import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../auth/roles.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { BookingStatus } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';
import {
  addDays,
  dayOfWeek,
  fromMinutes,
  toMinutes,
  ukDate,
  ukTime,
  ukToUtc,
} from '../common/uk-time.js';
import type { AvailabilityQueryDto, CreateBookingDto } from './dto/bookings.dto.js';

/*
 * HOW BOOKING WORKS
 *  1. A customer picks a time when at least one suitable technician is free.
 *     The booking is created as a REQUEST (status PENDING, no technician).
 *  2. Every approved technician who offers that service, covers that town and
 *     is working + free at that time sees it under "Booking requests".
 *  3. The first technician to accept gets the job (status CONFIRMED). Row
 *     locks make sure only one technician can win, and nobody is double-booked.
 *  4. Requests nobody accepted before their start time expire (CANCELLED).
 */

// ---- Booking rules (one place to change them) ----
const SLOT_STEP_MINUTES = 60; // offer a start time every hour
const MIN_NOTICE_MINUTES = 120; // bookings need 2 hours' notice
const MAX_DAYS_AHEAD = 30; // and can be up to 30 days ahead
const START_EARLY_MINUTES = 60; // a technician may start a job up to 1 hour early

// Bookings in these states hold a technician's time.
const ACTIVE_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
];

const bookingInclude = {
  service: { select: { id: true, name: true, durationInMinutes: true } },
  address: {
    select: { addressLine1: true, addressLine2: true, city: true, postalCode: true },
  },
  technicianProfile: {
    select: { id: true, userId: true, firstName: true, lastName: true },
  },
  customerProfile: {
    select: { userId: true, user: { select: { name: true, phone: true } } },
  },
} satisfies Prisma.BookingInclude;

type BookingWithRelations = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

/** What we need to know about a technician to decide if they can take a job. */
type TechnicianSchedule = {
  id: number;
  approvalStatus: string;
  services: Map<number, number>; // serviceId -> technician's price (0 = use base price)
  cities: Set<string>; // lower-case
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  exceptions: { exceptionDate: Date; startTime: string; endTime: string }[];
};

/** "CF14 3AB" -> "CF14": enough to judge distance, without the exact street. */
function postcodeArea(postcode: string) {
  const clean = postcode.trim().toUpperCase();
  return clean.includes(' ') ? clean.split(/\s+/)[0] : clean.slice(0, Math.max(2, clean.length - 3));
}

/** Is the technician working (and not on a day off) for this whole time? */
function worksAt(tech: TechnicianSchedule, start: Date, end: Date) {
  const date = ukDate(start);
  const from = toMinutes(ukTime(start));
  const to = from + Math.round((end.getTime() - start.getTime()) / 60_000);
  const weekday = dayOfWeek(date);

  const inHours = tech.availability.some(
    (a) => a.dayOfWeek === weekday && toMinutes(a.startTime) <= from && to <= toMinutes(a.endTime),
  );
  const dayOff = tech.exceptions.some(
    (ex) => ukDate(ex.exceptionDate) === date && toMinutes(ex.startTime) < to && toMinutes(ex.endTime) > from,
  );
  return inHours && !dayOff;
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // Helpers
  // =========================================================================

  private async customerProfileId(user: AuthenticatedUser) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) throw new ForbiddenException('Only customers can book services.');
    return profile.id;
  }

  /** The service, the customer's own address, and the service area covering it. */
  private async bookingContext(user: AuthenticatedUser, serviceId: number, addressId: number) {
    const [service, address] = await Promise.all([
      this.prisma.service.findFirst({
        where: { id: serviceId, isActive: true },
        select: { id: true, name: true, basePrice: true, durationInMinutes: true },
      }),
      this.prisma.address.findFirst({
        // Customers can only book at their OWN addresses.
        where: { id: addressId, userId: user.id },
        select: { id: true, city: true },
      }),
    ]);

    if (!service) throw new NotFoundException('That service is not available.');
    if (!address) throw new NotFoundException('Address not found.');

    const area = await this.prisma.serviceArea.findFirst({
      where: { isActive: true, city: { equals: address.city.trim(), mode: 'insensitive' } },
      select: { id: true, city: true },
    });
    if (!area) {
      throw new BadRequestException(`Sorry, ValleyFix doesn't cover ${address.city} yet.`);
    }

    return { service, address, area };
  }

  private assertBookableDate(date: string) {
    const today = ukDate(new Date());
    if (date < today || date > addDays(today, MAX_DAYS_AHEAD)) {
      throw new BadRequestException(
        `Please choose a date between today and ${MAX_DAYS_AHEAD} days from now.`,
      );
    }
  }

  /** Load the parts of a technician's profile that decide which jobs they can do. */
  private async technicianSchedule(userId: number): Promise<TechnicianSchedule | null> {
    const tech = await this.prisma.technicianProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        approvalStatus: true,
        technicianServices: { where: { isActive: true }, select: { serviceId: true, price: true } },
        technicianServiceAreas: {
          where: { isActive: true },
          select: { serviceArea: { select: { city: true } } },
        },
        technicianAvailability: {
          where: { isAvailable: true },
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
        technicianExceptions: {
          where: { isAvailable: false, exceptionDate: { gte: new Date(Date.now() - 86_400_000) } },
          select: { exceptionDate: true, startTime: true, endTime: true },
        },
      },
    });
    if (!tech) return null;

    return {
      id: tech.id,
      approvalStatus: tech.approvalStatus,
      services: new Map(tech.technicianServices.map((s) => [s.serviceId, Number(s.price)])),
      cities: new Set(tech.technicianServiceAreas.map((a) => a.serviceArea.city.toLowerCase())),
      availability: tech.technicianAvailability,
      exceptions: tech.technicianExceptions,
    };
  }

  private async approvedTechnician(user: AuthenticatedUser) {
    const tech = await this.technicianSchedule(user.id);
    if (!tech) throw new ForbiddenException('Technician account required.');
    if (tech.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException('Your account must be approved before you can take jobs.');
    }
    return tech;
  }

  /**
   * Requests nobody accepted before their start time can never happen:
   * mark them cancelled so customers see a clear outcome. (Run whenever
   * bookings are listed; a scheduled job could do this in the background.)
   */
  private async expireStaleRequests() {
    const stale = await this.prisma.booking.findMany({
      where: { status: BookingStatus.PENDING, technicianProfileId: null, scheduledStart: { lte: new Date() } },
      select: { id: true },
    });
    if (stale.length === 0) return;

    const reason = 'No technician was available at this time.';
    const ids = stale.map((b) => b.id);
    await this.prisma.$transaction([
      this.prisma.booking.updateMany({
        where: { id: { in: ids }, status: BookingStatus.PENDING, technicianProfileId: null },
        data: { status: BookingStatus.CANCELLED, cancelledAt: new Date(), cancellationReason: reason },
      }),
      this.prisma.bookingStatusHistory.createMany({
        data: ids.map((bookingId) => ({ bookingId, status: BookingStatus.CANCELLED, note: reason })),
      }),
    ]);
  }

  /**
   * Every start time on `date` that can still take a new request: at least one
   * suitable technician is free, after allowing for requests already waiting
   * for a technician in the same town at overlapping times.
   */
  private async computeSlots(serviceId: number, durationMinutes: number, area: { id: number; city: string }, date: string) {
    const weekday = dayOfWeek(date);
    const dayStart = ukToUtc(date, '00:00');
    const dayEnd = ukToUtc(addDays(date, 1), '00:00');

    const technicians = await this.prisma.technicianProfile.findMany({
      where: {
        approvalStatus: 'APPROVED',
        user: { isActive: true },
        technicianServices: { some: { serviceId, isActive: true } },
        technicianServiceAreas: { some: { serviceAreaId: area.id, isActive: true } },
        technicianAvailability: { some: { dayOfWeek: weekday, isAvailable: true } },
      },
      select: {
        id: true,
        technicianAvailability: {
          where: { dayOfWeek: weekday, isAvailable: true },
          select: { startTime: true, endTime: true },
        },
        // Exceptions are stored as dates; a day either side covers time zones.
        technicianExceptions: {
          where: {
            isAvailable: false,
            exceptionDate: { gte: new Date(dayStart.getTime() - 86_400_000), lt: new Date(dayEnd.getTime() + 86_400_000) },
          },
          select: { exceptionDate: true, startTime: true, endTime: true },
        },
      },
    });

    const ids = technicians.map((t) => t.id);
    const [busy, waiting] = await Promise.all([
      ids.length
        ? this.prisma.booking.findMany({
            where: {
              technicianProfileId: { in: ids },
              status: { in: ACTIVE_STATUSES },
              scheduledStart: { lt: dayEnd },
              scheduledEnd: { gt: dayStart },
            },
            select: { technicianProfileId: true, scheduledStart: true, scheduledEnd: true },
          })
        : Promise.resolve([]),
      // Requests in this town still waiting for someone to accept them.
      this.prisma.booking.findMany({
        where: {
          status: BookingStatus.PENDING,
          technicianProfileId: null,
          scheduledStart: { lt: dayEnd },
          scheduledEnd: { gt: dayStart },
          address: { city: { equals: area.city, mode: 'insensitive' } },
        },
        select: { scheduledStart: true, scheduledEnd: true },
      }),
    ]);

    const earliestStart = Date.now() + MIN_NOTICE_MINUTES * 60_000;
    const free = new Map<string, { time: string; start: Date; end: Date; technicians: number }>();

    for (const tech of technicians) {
      for (const window of tech.technicianAvailability) {
        const windowEnd = toMinutes(window.endTime);

        for (let m = toMinutes(window.startTime); m + durationMinutes <= windowEnd; m += SLOT_STEP_MINUTES) {
          const time = fromMinutes(m);
          const start = ukToUtc(date, time);
          const end = new Date(start.getTime() + durationMinutes * 60_000);

          if (start.getTime() < earliestStart) continue;

          const dayOff = tech.technicianExceptions.some(
            (ex) =>
              ukDate(ex.exceptionDate) === date &&
              toMinutes(ex.startTime) < m + durationMinutes &&
              toMinutes(ex.endTime) > m,
          );
          if (dayOff) continue;

          const clash = busy.some(
            (b) => b.technicianProfileId === tech.id && b.scheduledStart < end && b.scheduledEnd > start,
          );
          if (clash) continue;

          const slot = free.get(time) ?? { time, start, end, technicians: 0 };
          slot.technicians += 1;
          free.set(time, slot);
        }
      }
    }

    // A slot is bookable only if free technicians outnumber waiting requests.
    return [...free.values()]
      .filter((slot) => {
        const waitingThen = waiting.filter((w) => w.scheduledStart < slot.end && w.scheduledEnd > slot.start).length;
        return slot.technicians > waitingThen;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  private newReference() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I mix-ups
    let code = '';
    for (let i = 0; i < 8; i++) code += alphabet[randomInt(alphabet.length)];
    return `VF-${code}`;
  }

  /** The shape sent to the website / app. Hides details the viewer shouldn't see. */
  private present(booking: BookingWithRelations, viewer: AuthenticatedUser) {
    const tech = booking.technicianProfile;
    const isCustomer = viewer.role === Role.CUSTOMER;
    const isAdmin = viewer.role === Role.ADMIN || viewer.role === Role.SUPER_ADMIN;
    const isTechnician = viewer.role === Role.TECHNICIAN;
    const isOpenRequest = booking.status === BookingStatus.PENDING && !tech;
    // A technician looking at a request they haven't accepted yet.
    const isRequestView = isTechnician && isOpenRequest;
    const now = Date.now();
    const startsAt = booking.scheduledStart.getTime();

    return {
      id: booking.id,
      reference: booking.booking_reference,
      status: booking.status,
      service: booking.service,
      scheduledStart: booking.scheduledStart,
      scheduledEnd: booking.scheduledEnd,
      description: booking.description,
      estimatedPrice: Number(booking.estimatedPrice),
      // Before accepting, technicians see the town and postcode area only.
      address: isRequestView
        ? {
            addressLine1: '',
            addressLine2: null,
            city: booking.address.city,
            postalCode: postcodeArea(booking.address.postalCode),
          }
        : booking.address,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      // Customers see their technician's first name and initial only.
      technician: tech
        ? isCustomer
          ? { name: `${tech.firstName} ${tech.lastName.charAt(0)}.` }
          : { id: tech.id, userId: tech.userId, name: `${tech.firstName} ${tech.lastName}` }
        : null,
      // The assigned technician and admins need the customer's name and phone.
      customer:
        isCustomer || isRequestView
          ? undefined
          : {
              name: booking.customerProfile.user.name,
              phone: booking.customerProfile.user.phone,
            },
      // What this viewer may do right now. The website/app uses these flags to
      // show buttons, so the rules live in ONE place (here), not in every client.
      // The action endpoints below still enforce the same rules.
      allowedActions: {
        accept: isRequestView && startsAt > now,
        cancel:
          (isAdmin && ACTIVE_STATUSES.includes(booking.status)) ||
          (isCustomer &&
            (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) &&
            startsAt > now),
        start:
          isTechnician &&
          !isRequestView &&
          booking.status === BookingStatus.CONFIRMED &&
          now >= startsAt - START_EARLY_MINUTES * 60_000,
        complete: isTechnician && booking.status === BookingStatus.IN_PROGRESS,
      },
    };
  }

  private async findForViewer(user: AuthenticatedUser, id: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: bookingInclude });
    if (!booking) throw new NotFoundException('Booking not found.');

    const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    const isOwner = booking.customerProfile.userId === user.id;
    const isAssigned = booking.technicianProfile?.userId === user.id;

    // Same "not found" for someone else's booking: don't reveal it exists.
    if (!isAdmin && !isOwner && !isAssigned) throw new NotFoundException('Booking not found.');

    return { booking, isAdmin, isOwner, isAssigned };
  }

  private async changeStatus(
    bookingId: number,
    status: BookingStatus,
    actor: AuthenticatedUser,
    extra: Prisma.BookingUpdateInput = {},
    note?: string,
  ) {
    await this.prisma.$transaction([
      this.prisma.booking.update({ where: { id: bookingId }, data: { status, ...extra } }),
      this.prisma.bookingStatusHistory.create({
        data: { bookingId, status, changedById: actor.id, note },
      }),
    ]);
  }

  // =========================================================================
  // Customer
  // =========================================================================

  /** The customer's saved addresses, marking which ones we can serve. */
  async myAddresses(user: AuthenticatedUser) {
    await this.customerProfileId(user);
    const [addresses, areas] = await Promise.all([
      this.prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
        select: { id: true, addressLine1: true, addressLine2: true, city: true, postalCode: true, isDefault: true },
      }),
      this.prisma.serviceArea.findMany({ where: { isActive: true }, select: { city: true } }),
    ]);
    const covered = new Set(areas.map((a) => a.city.toLowerCase()));
    return addresses.map((a) => ({ ...a, covered: covered.has(a.city.trim().toLowerCase()) }));
  }

  async availability(user: AuthenticatedUser, query: AvailabilityQueryDto) {
    await this.customerProfileId(user);
    const { service, area } = await this.bookingContext(user, query.serviceId, query.addressId);
    this.assertBookableDate(query.date);

    const slots = await this.computeSlots(service.id, service.durationInMinutes, area, query.date);

    return {
      date: query.date,
      area: area.city,
      durationInMinutes: service.durationInMinutes,
      // Never reveal which technicians are free, just the times.
      slots: slots.map(({ time, start, end }) => ({ time, start, end })),
    };
  }

  /** Creates a booking REQUEST; a technician confirms it by accepting. */
  async create(user: AuthenticatedUser, dto: CreateBookingDto) {
    const customerProfileId = await this.customerProfileId(user);
    const { service, address, area } = await this.bookingContext(user, dto.serviceId, dto.addressId);
    this.assertBookableDate(dto.date);

    const slots = await this.computeSlots(service.id, service.durationInMinutes, area, dto.date);
    const slot = slots.find((s) => s.time === dto.time);
    if (!slot) {
      throw new ConflictException('That time is no longer available. Please choose another.');
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          booking_reference: this.newReference(),
          customerProfileId,
          serviceId: service.id,
          addressId: address.id,
          status: BookingStatus.PENDING,
          scheduledStart: slot.start,
          scheduledEnd: slot.end,
          description: dto.description || null,
          // The accepting technician's own price replaces this, if they set one.
          estimatedPrice: service.basePrice,
        },
        include: bookingInclude,
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId: created.id, status: BookingStatus.PENDING, changedById: user.id, note: 'Requested by customer' },
      });
      return created;
    });

    return this.present(booking, user);
  }

  // =========================================================================
  // Everyone: their own bookings
  // =========================================================================

  async mine(user: AuthenticatedUser) {
    await this.expireStaleRequests();

    const where: Prisma.BookingWhereInput =
      user.role === Role.TECHNICIAN
        ? { technicianProfile: { userId: user.id } }
        : { customerProfile: { userId: user.id } };

    const bookings = await this.prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { scheduledStart: 'asc' },
    });
    return bookings.map((b) => this.present(b, user));
  }

  async getOne(user: AuthenticatedUser, id: number) {
    const { booking } = await this.findForViewer(user, id);
    return this.present(booking, user);
  }

  async cancel(user: AuthenticatedUser, id: number, reason?: string) {
    const { booking, isAdmin, isOwner } = await this.findForViewer(user, id);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Please contact ValleyFix support to cancel this job.');
    }

    const cancellable: BookingStatus[] = isAdmin
      ? ACTIVE_STATUSES
      : [BookingStatus.PENDING, BookingStatus.CONFIRMED];

    if (!cancellable.includes(booking.status)) {
      throw new BadRequestException('This booking can no longer be cancelled.');
    }
    if (!isAdmin && booking.scheduledStart.getTime() <= Date.now()) {
      throw new BadRequestException('This booking has already started. Please contact ValleyFix support.');
    }

    const note = reason || (isAdmin ? 'Cancelled by ValleyFix' : 'Cancelled by customer');
    await this.changeStatus(
      booking.id,
      BookingStatus.CANCELLED,
      user,
      { cancelledAt: new Date(), cancellationReason: note },
      note,
    );

    return this.getOne(user, id);
  }

  // =========================================================================
  // Technicians: requests and doing the job
  // =========================================================================

  /** Open requests this technician could take: right service, town, hours, and free. */
  async requests(user: AuthenticatedUser) {
    const tech = await this.approvedTechnician(user);
    await this.expireStaleRequests();

    const now = new Date();
    const [open, myJobs] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          status: BookingStatus.PENDING,
          technicianProfileId: null,
          serviceId: { in: [...tech.services.keys()] },
          scheduledStart: { gt: now },
        },
        include: bookingInclude,
        orderBy: { scheduledStart: 'asc' },
        take: 200,
      }),
      this.prisma.booking.findMany({
        where: { technicianProfileId: tech.id, status: { in: ACTIVE_STATUSES }, scheduledEnd: { gt: now } },
        select: { scheduledStart: true, scheduledEnd: true },
      }),
    ]);

    return open
      .filter((b) => tech.cities.has(b.address.city.trim().toLowerCase()))
      .filter((b) => worksAt(tech, b.scheduledStart, b.scheduledEnd))
      .filter((b) => !myJobs.some((j) => j.scheduledStart < b.scheduledEnd && j.scheduledEnd > b.scheduledStart))
      .map((b) => this.present(b, user));
  }

  /** First technician to accept gets the job. */
  async accept(user: AuthenticatedUser, id: number) {
    const tech = await this.approvedTechnician(user);

    await this.prisma.$transaction(async (tx) => {
      // Lock the request: if two technicians accept at the same moment, the
      // second waits here and then sees it's already taken.
      await tx.$queryRaw`SELECT id FROM bookings WHERE id = ${id} FOR UPDATE`;
      const booking = await tx.booking.findUnique({
        where: { id },
        select: {
          status: true,
          technicianProfileId: true,
          serviceId: true,
          scheduledStart: true,
          scheduledEnd: true,
          estimatedPrice: true,
          address: { select: { city: true } },
        },
      });

      if (!booking) throw new NotFoundException('Request not found.');
      if (booking.status !== BookingStatus.PENDING || booking.technicianProfileId) {
        throw new ConflictException('Sorry, this request has already been taken or cancelled.');
      }
      if (booking.scheduledStart.getTime() <= Date.now()) {
        throw new BadRequestException('This request has expired.');
      }

      const suitable =
        tech.services.has(booking.serviceId) &&
        tech.cities.has(booking.address.city.trim().toLowerCase()) &&
        worksAt(tech, booking.scheduledStart, booking.scheduledEnd);
      if (!suitable) {
        throw new ForbiddenException("This request doesn't match your services, areas or working hours.");
      }

      // Lock this technician too, so they can't be booked twice for the same time.
      await tx.$queryRaw`SELECT id FROM technician_profiles WHERE id = ${tech.id} FOR UPDATE`;
      const clash = await tx.booking.count({
        where: {
          technicianProfileId: tech.id,
          status: { in: ACTIVE_STATUSES },
          scheduledStart: { lt: booking.scheduledEnd },
          scheduledEnd: { gt: booking.scheduledStart },
        },
      });
      if (clash > 0) throw new ConflictException('You already have a job at that time.');

      const techPrice = tech.services.get(booking.serviceId) ?? 0;
      await tx.booking.update({
        where: { id },
        data: {
          technicianProfileId: tech.id,
          status: BookingStatus.CONFIRMED,
          ...(techPrice > 0 && { estimatedPrice: techPrice }),
        },
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId: id, status: BookingStatus.CONFIRMED, changedById: user.id, note: 'Accepted by technician' },
      });
    });

    return this.getOne(user, id);
  }

  /** Counts for the technician's sidebar badges. */
  async technicianSummary(user: AuthenticatedUser) {
    const tech = await this.technicianSchedule(user.id);
    if (!tech || tech.approvalStatus !== 'APPROVED') {
      return { requests: 0, accepted: 0, pending: 0, completed: 0 };
    }
    const [requests, mine] = await Promise.all([this.requests(user), this.mine(user)]);
    return {
      requests: requests.length,
      accepted: mine.filter((b) => b.status === BookingStatus.CONFIRMED && !b.allowedActions.start).length,
      pending: mine.filter(
        (b) => b.status === BookingStatus.IN_PROGRESS || (b.status === BookingStatus.CONFIRMED && b.allowedActions.start),
      ).length,
      completed: mine.filter((b) => b.status === BookingStatus.COMPLETED).length,
    };
  }

  private async assignedBooking(user: AuthenticatedUser, id: number) {
    const { booking, isAssigned } = await this.findForViewer(user, id);
    if (!isAssigned) throw new NotFoundException('Booking not found.');
    if (user.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException('Your account must be approved before you can work on jobs.');
    }
    return booking;
  }

  async start(user: AuthenticatedUser, id: number) {
    const booking = await this.assignedBooking(user, id);
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed jobs can be started.');
    }
    if (Date.now() < booking.scheduledStart.getTime() - START_EARLY_MINUTES * 60_000) {
      throw new BadRequestException(`You can start this job from ${START_EARLY_MINUTES} minutes before the booked time.`);
    }
    await this.changeStatus(booking.id, BookingStatus.IN_PROGRESS, user);
    return this.getOne(user, id);
  }

  async complete(user: AuthenticatedUser, id: number) {
    const booking = await this.assignedBooking(user, id);
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Only jobs in progress can be completed.');
    }
    await this.changeStatus(booking.id, BookingStatus.COMPLETED, user);
    return this.getOne(user, id);
  }

  // =========================================================================
  // Admins
  // =========================================================================

  async adminList(user: AuthenticatedUser, status?: BookingStatus, page = 1, pageSize = 20) {
    await this.expireStaleRequests();

    const where: Prisma.BookingWhereInput = status ? { status } : {};
    const [total, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { scheduledStart: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, page, pageSize, bookings: bookings.map((b) => this.present(b, user)) };
  }
}

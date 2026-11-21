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
import { addDays, dayOfWeek, fromMinutes, toMinutes, ukDate, ukToUtc } from '../common/uk-time.js';
import type { AvailabilityQueryDto, CreateBookingDto } from './dto/bookings.dto.js';

// ---- Booking rules (one place to change them) ----
const SLOT_STEP_MINUTES = 60; // offer a start time every hour
const MIN_NOTICE_MINUTES = 120; // bookings need 2 hours' notice
const MAX_DAYS_AHEAD = 30; // and can be up to 30 days ahead
const START_EARLY_MINUTES = 60; // a technician may start a job up to 1 hour early

// Bookings in these states hold the technician's time.
const ACTIVE_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
];

type Slot = {
  time: string; // "09:00" UK time
  start: Date;
  end: Date;
  technicianIds: number[];
};

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

  /**
   * Every start time on `date` when at least one suitable technician is free.
   * A technician is suitable when they are approved and active, offer the
   * service, cover the area, work that day, have no day-off exception and no
   * overlapping booking.
   */
  private async computeSlots(serviceId: number, durationMinutes: number, areaId: number, date: string) {
    const weekday = dayOfWeek(date);
    const dayStart = ukToUtc(date, '00:00');
    const dayEnd = ukToUtc(addDays(date, 1), '00:00');

    const technicians = await this.prisma.technicianProfile.findMany({
      where: {
        approvalStatus: 'APPROVED',
        user: { isActive: true },
        technicianServices: { some: { serviceId, isActive: true } },
        technicianServiceAreas: { some: { serviceAreaId: areaId, isActive: true } },
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
        technicianServices: { where: { serviceId }, select: { price: true } },
      },
    });

    const ids = technicians.map((t) => t.id);
    const busy = ids.length
      ? await this.prisma.booking.findMany({
          where: {
            technicianProfileId: { in: ids },
            status: { in: ACTIVE_STATUSES },
            scheduledStart: { lt: dayEnd },
            scheduledEnd: { gt: dayStart },
          },
          select: { technicianProfileId: true, scheduledStart: true, scheduledEnd: true },
        })
      : [];

    const earliestStart = Date.now() + MIN_NOTICE_MINUTES * 60_000;
    const slots = new Map<string, Slot>();

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

          const slot = slots.get(time) ?? { time, start, end, technicianIds: [] };
          slot.technicianIds.push(tech.id);
          slots.set(time, slot);
        }
      }
    }

    // How many jobs each technician already has that day (to share work fairly).
    const jobsThatDay = new Map<number, number>();
    for (const b of busy) {
      if (b.technicianProfileId) {
        jobsThatDay.set(b.technicianProfileId, (jobsThatDay.get(b.technicianProfileId) ?? 0) + 1);
      }
    }

    const prices = new Map(
      technicians.map((t) => [t.id, Number(t.technicianServices[0]?.price ?? 0)]),
    );

    return {
      slots: [...slots.values()].sort((a, b) => a.time.localeCompare(b.time)),
      jobsThatDay,
      prices,
    };
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
      address: booking.address,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      // Customers see their technician's first name and initial only.
      technician: tech
        ? isCustomer
          ? { name: `${tech.firstName} ${tech.lastName.charAt(0)}.` }
          : { id: tech.id, userId: tech.userId, name: `${tech.firstName} ${tech.lastName}` }
        : null,
      // Technicians and admins need the customer's name and phone to do the job.
      customer: isCustomer
        ? undefined
        : {
            name: booking.customerProfile.user.name,
            phone: booking.customerProfile.user.phone,
          },
      // What this viewer may do right now. The website/app uses these flags to
      // show buttons, so the rules live in ONE place (here), not in every client.
      // The action endpoints below still enforce the same rules.
      allowedActions: {
        cancel:
          (isAdmin && ACTIVE_STATUSES.includes(booking.status)) ||
          (isCustomer &&
            (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) &&
            startsAt > now),
        start:
          isTechnician &&
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

    const { slots } = await this.computeSlots(service.id, service.durationInMinutes, area.id, query.date);

    return {
      date: query.date,
      area: area.city,
      durationInMinutes: service.durationInMinutes,
      // Never reveal which technicians are free, just the times.
      slots: slots.map(({ time, start, end }) => ({ time, start, end })),
    };
  }

  async create(user: AuthenticatedUser, dto: CreateBookingDto) {
    const customerProfileId = await this.customerProfileId(user);
    const { service, address, area } = await this.bookingContext(user, dto.serviceId, dto.addressId);
    this.assertBookableDate(dto.date);

    const { slots, jobsThatDay, prices } = await this.computeSlots(
      service.id,
      service.durationInMinutes,
      area.id,
      dto.date,
    );
    const slot = slots.find((s) => s.time === dto.time);
    if (!slot) {
      throw new ConflictException('That time is no longer available. Please choose another.');
    }

    // Least-busy technician first, to share work fairly.
    const candidates = [...slot.technicianIds].sort(
      (a, b) => (jobsThatDay.get(a) ?? 0) - (jobsThatDay.get(b) ?? 0),
    );

    for (const technicianId of candidates) {
      const created = await this.prisma.$transaction(async (tx) => {
        // Lock this technician's row. If two customers book the same technician
        // at the same moment, the second waits here, then sees the first booking
        // in the re-check below, so a technician can never be double-booked.
        await tx.$queryRaw`SELECT id FROM technician_profiles WHERE id = ${technicianId} FOR UPDATE`;

        const clash = await tx.booking.count({
          where: {
            technicianProfileId: technicianId,
            status: { in: ACTIVE_STATUSES },
            scheduledStart: { lt: slot.end },
            scheduledEnd: { gt: slot.start },
          },
        });
        if (clash > 0) return null;

        const techPrice = prices.get(technicianId) ?? 0;
        const booking = await tx.booking.create({
          data: {
            booking_reference: this.newReference(),
            customerProfileId,
            serviceId: service.id,
            addressId: address.id,
            technicianProfileId: technicianId,
            status: BookingStatus.CONFIRMED,
            scheduledStart: slot.start,
            scheduledEnd: slot.end,
            description: dto.description || null,
            estimatedPrice: techPrice > 0 ? techPrice : service.basePrice,
          },
          include: bookingInclude,
        });

        await tx.bookingStatusHistory.create({
          data: { bookingId: booking.id, status: BookingStatus.CONFIRMED, changedById: user.id },
        });

        return booking;
      });

      if (created) return this.present(created, user);
    }

    throw new ConflictException('That time was just taken. Please choose another.');
  }

  // =========================================================================
  // Customers and technicians: their own bookings
  // =========================================================================

  async mine(user: AuthenticatedUser) {
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
      ? [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
      : [BookingStatus.PENDING, BookingStatus.CONFIRMED];

    if (!cancellable.includes(booking.status)) {
      throw new BadRequestException('This booking can no longer be cancelled.');
    }
    if (!isAdmin && booking.scheduledStart.getTime() <= Date.now()) {
      throw new BadRequestException('This booking has already started. Please contact ValleyFix support.');
    }

    const note = reason || (isAdmin ? 'Cancelled by ValleyFix' : 'Cancelled by customer');
    await this.changeStatus(booking.id, BookingStatus.CANCELLED, user, {
      cancelledAt: new Date(),
      cancellationReason: note,
    }, note);

    return this.getOne(user, id);
  }

  // =========================================================================
  // Technicians: doing the job
  // =========================================================================

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

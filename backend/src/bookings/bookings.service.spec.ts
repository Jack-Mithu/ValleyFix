import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { addDays, ukDate, ukToUtc } from '../common/uk-time.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const customer = { id: 10, name: 'Rhys', email: 'rhys@example.com', phone: null, role: 'customer' };
const techUser = { id: 20, name: 'Gareth Evans', email: 'g@example.com', phone: null, role: 'technician', approvalStatus: 'APPROVED' as const };

// A date safely in the future (outside the 2-hour notice window) and within 30 days.
const DATE = addDays(ukDate(new Date()), 3);
const WEEKDAY = new Date(`${DATE}T12:00:00Z`).getUTCDay();
const at = (time: string) => ukToUtc(DATE, time);

const slotTech = (id: number, start = '09:00', end = '12:00') => ({
  id,
  technicianAvailability: [{ startTime: start, endTime: end }],
  technicianExceptions: [] as { exceptionDate: Date; startTime: string; endTime: string }[],
});

/** A full booking row, as returned with `bookingInclude`. */
const bookingRow = (over: Record<string, unknown> = {}) => ({
  id: 1,
  booking_reference: 'VF-TEST1234',
  status: 'PENDING',
  scheduledStart: at('10:00'),
  scheduledEnd: at('11:00'),
  description: 'Leaking tap',
  estimatedPrice: 60,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  serviceId: 1,
  service: { id: 1, name: 'Plumbing', durationInMinutes: 60 },
  address: { addressLine1: '1 Test St', addressLine2: null, city: 'Cardiff', postalCode: 'CF14 3AB' },
  technicianProfile: null,
  customerProfile: { userId: 10, user: { name: 'Rhys', phone: '+447700900111' } },
  ...over,
});

function setup(opts: { slotTechs?: ReturnType<typeof slotTech>[]; busy?: object[]; waiting?: object[]; open?: object[]; myJobs?: object[] } = {}) {
  const tx = {
    $queryRaw: vi.fn(),
    booking: { create: vi.fn(), findUnique: vi.fn(), count: vi.fn().mockResolvedValue(0), update: vi.fn() },
    bookingStatusHistory: { create: vi.fn() },
  };
  const prisma = {
    customerProfile: { findUnique: vi.fn().mockResolvedValue({ id: 5 }) },
    service: { findFirst: vi.fn().mockResolvedValue({ id: 1, name: 'Plumbing', basePrice: 60, durationInMinutes: 60 }) },
    address: { findFirst: vi.fn().mockResolvedValue({ id: 3, city: 'Cardiff' }) },
    serviceArea: { findFirst: vi.fn().mockResolvedValue({ id: 2, city: 'Cardiff' }) },
    technicianProfile: {
      findMany: vi.fn().mockResolvedValue(opts.slotTechs ?? []),
      // The logged-in technician's schedule.
      findUnique: vi.fn().mockResolvedValue({
        id: 7,
        approvalStatus: 'APPROVED',
        technicianServices: [{ serviceId: 1, price: 75 }],
        technicianServiceAreas: [{ serviceArea: { city: 'Cardiff' } }],
        technicianAvailability: [{ dayOfWeek: WEEKDAY, startTime: '08:00', endTime: '18:00' }],
        technicianExceptions: [],
      }),
    },
    booking: {
      // Route each query to the right fake data by the shape of its `where`.
      findMany: vi.fn(({ where }: { where: Record<string, unknown> }) => {
        if ((where.scheduledStart as { lte?: Date })?.lte) return []; // expiry sweep
        if ((where.technicianProfileId as { in?: number[] })?.in) return opts.busy ?? [];
        if (where.technicianProfileId === null && where.address) return opts.waiting ?? [];
        if (where.technicianProfileId === null) return opts.open ?? [];
        return opts.myJobs ?? [];
      }),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    bookingStatusHistory: { createMany: vi.fn() },
    $transaction: vi.fn((arg: unknown) => (typeof arg === 'function' ? (arg as (t: typeof tx) => unknown)(tx) : Promise.all(arg as unknown[]))),
  };
  return { service: new BookingsService(prisma as unknown as PrismaService), prisma, tx };
}

const query = { serviceId: 1, addressId: 3, date: DATE };

describe('availability', () => {
  it('offers hourly slots that fit inside working hours', async () => {
    const { service } = setup({ slotTechs: [slotTech(1, '09:00', '12:00')] });
    const result = await service.availability(customer, query);
    expect(result.slots.map((s) => s.time)).toEqual(['09:00', '10:00', '11:00']);
  });

  it("removes times that overlap the technician's existing job", async () => {
    const busy = [{ technicianProfileId: 1, scheduledStart: at('10:00'), scheduledEnd: at('11:00') }];
    const { service } = setup({ slotTechs: [slotTech(1)], busy });
    expect((await service.availability(customer, query)).slots.map((s) => s.time)).toEqual(['09:00', '11:00']);
  });

  it('respects a day-off exception', async () => {
    const tech = slotTech(1);
    tech.technicianExceptions = [{ exceptionDate: at('00:00'), startTime: '09:00', endTime: '11:00' }];
    const { service } = setup({ slotTechs: [tech] });
    expect((await service.availability(customer, query)).slots.map((s) => s.time)).toEqual(['11:00']);
  });

  it('counts requests still waiting for a technician against free capacity', async () => {
    const waiting = [{ scheduledStart: at('10:00'), scheduledEnd: at('11:00') }];
    // One technician, one waiting request at 10:00 -> 10:00 is full.
    const one = setup({ slotTechs: [slotTech(1)], waiting });
    expect((await one.service.availability(customer, query)).slots.map((s) => s.time)).toEqual(['09:00', '11:00']);
    // Two technicians -> there's still room at 10:00.
    const two = setup({ slotTechs: [slotTech(1), slotTech(2)], waiting });
    expect((await two.service.availability(customer, query)).slots.map((s) => s.time)).toContain('10:00');
  });

  it('rejects dates in the past or too far ahead, and towns we do not cover', async () => {
    const { service, prisma } = setup({ slotTechs: [slotTech(1)] });
    await expect(service.availability(customer, { ...query, date: '2020-01-01' })).rejects.toThrow(BadRequestException);
    prisma.serviceArea.findFirst.mockResolvedValue(null);
    await expect(service.availability(customer, query)).rejects.toThrow("doesn't cover Cardiff");
  });
});

describe('create (customer)', () => {
  it('refuses a time that is not available', async () => {
    const { service } = setup({ slotTechs: [slotTech(1)] });
    await expect(service.create(customer, { serviceId: 1, addressId: 3, date: DATE, time: '15:00' })).rejects.toThrow(ConflictException);
  });

  it('creates a request with no technician yet', async () => {
    const { service, tx } = setup({ slotTechs: [slotTech(1)] });
    tx.booking.create.mockImplementation(({ data }) => bookingRow({ ...data, id: 9 }));

    const booking = await service.create(customer, { serviceId: 1, addressId: 3, date: DATE, time: '10:00' });

    const data = tx.booking.create.mock.calls[0][0].data;
    expect(data.status).toBe('PENDING');
    expect(data.technicianProfileId).toBeUndefined();
    expect(booking.technician).toBeNull();
    expect(booking.allowedActions).toEqual({ accept: false, cancel: true, start: false, complete: false });
  });
});

describe('requests (technician)', () => {
  it('shows only requests in my towns and hours, when I am free', async () => {
    const open = [
      bookingRow({ id: 1 }), // Cardiff 10:00 -> yes
      bookingRow({ id: 2, address: { addressLine1: 'x', addressLine2: null, city: 'Swansea', postalCode: 'SA1 1AA' } }), // other town
      bookingRow({ id: 3, scheduledStart: at('19:00'), scheduledEnd: at('20:00') }), // after my hours
      bookingRow({ id: 4, scheduledStart: at('14:00'), scheduledEnd: at('15:00') }), // clashes with my job
    ];
    const myJobs = [{ scheduledStart: at('14:00'), scheduledEnd: at('15:00') }];
    const { service } = setup({ open, myJobs });

    const requests = await service.requests(techUser);
    expect(requests.map((r) => r.id)).toEqual([1]);
  });

  it("hides the customer's name, phone and street until accepted", async () => {
    const { service } = setup({ open: [bookingRow()] });
    const [request] = await service.requests(techUser);
    expect(request.customer).toBeUndefined();
    expect(request.address).toEqual({ addressLine1: '', addressLine2: null, city: 'Cardiff', postalCode: 'CF14' });
    expect(request.allowedActions.accept).toBe(true);
  });

  it('is not available before approval', async () => {
    const { service, prisma } = setup();
    prisma.technicianProfile.findUnique.mockResolvedValue({
      ...(await prisma.technicianProfile.findUnique()),
      approvalStatus: 'PENDING',
    });
    await expect(service.requests(techUser)).rejects.toThrow(ForbiddenException);
  });
});

describe('accept (technician)', () => {
  const pending = { status: 'PENDING', technicianProfileId: null, serviceId: 1, scheduledStart: at('10:00'), scheduledEnd: at('11:00'), estimatedPrice: 60, address: { city: 'Cardiff' } };

  it('the first technician wins; a second gets "already taken"', async () => {
    const { service, tx } = setup();
    tx.booking.findUnique.mockResolvedValue({ ...pending, status: 'CONFIRMED', technicianProfileId: 99 });
    await expect(service.accept(techUser, 1)).rejects.toThrow('already been taken');
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1); // the request row was locked first
    expect(tx.booking.update).not.toHaveBeenCalled();
  });

  it("refuses a request outside the technician's areas", async () => {
    const { service, tx } = setup();
    tx.booking.findUnique.mockResolvedValue({ ...pending, address: { city: 'Swansea' } });
    await expect(service.accept(techUser, 1)).rejects.toThrow(ForbiddenException);
  });

  it('refuses if the technician is already booked then', async () => {
    const { service, tx } = setup();
    tx.booking.findUnique.mockResolvedValue(pending);
    tx.booking.count.mockResolvedValue(1);
    await expect(service.accept(techUser, 1)).rejects.toThrow('already have a job');
  });

  it("assigns the job, confirms it and applies the technician's price", async () => {
    const { service, tx, prisma } = setup();
    tx.booking.findUnique.mockResolvedValue(pending);
    prisma.booking.findUnique.mockResolvedValue(
      bookingRow({ status: 'CONFIRMED', technicianProfile: { id: 7, userId: 20, firstName: 'Gareth', lastName: 'Evans' } }),
    );

    const booking = await service.accept(techUser, 1);

    expect(tx.booking.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { technicianProfileId: 7, status: 'CONFIRMED', estimatedPrice: 75 },
    });
    // Now that it's theirs, the technician sees the customer's details.
    expect(booking.customer).toEqual({ name: 'Rhys', phone: '+447700900111' });
  });
});

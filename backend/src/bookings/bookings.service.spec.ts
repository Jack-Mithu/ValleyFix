import { BadRequestException, ConflictException } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { addDays, ukDate, ukToUtc } from '../common/uk-time.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const customer = { id: 10, name: 'Rhys', email: 'rhys@example.com', phone: null, role: 'customer' };

// A date safely in the future (outside the 2-hour notice window) and within 30 days.
const DATE = addDays(ukDate(new Date()), 3);

const technician = (id: number, start = '09:00', end = '12:00') => ({
  id,
  technicianAvailability: [{ startTime: start, endTime: end }],
  technicianExceptions: [] as { exceptionDate: Date; startTime: string; endTime: string }[],
  technicianServices: [{ price: 0 }],
});

function setup(technicians: ReturnType<typeof technician>[], busy: object[] = []) {
  const tx = {
    $queryRaw: vi.fn(),
    booking: { count: vi.fn().mockResolvedValue(0), create: vi.fn() },
    bookingStatusHistory: { create: vi.fn() },
  };
  const prisma = {
    customerProfile: { findUnique: vi.fn().mockResolvedValue({ id: 5 }) },
    service: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, name: 'Plumbing', basePrice: 60, durationInMinutes: 60 }),
    },
    address: { findFirst: vi.fn().mockResolvedValue({ id: 3, city: 'Cardiff' }) },
    serviceArea: { findFirst: vi.fn().mockResolvedValue({ id: 2, city: 'Cardiff' }) },
    technicianProfile: { findMany: vi.fn().mockResolvedValue(technicians) },
    booking: { findMany: vi.fn().mockResolvedValue(busy) },
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  return { service: new BookingsService(prisma as unknown as PrismaService), prisma, tx };
}

const query = { serviceId: 1, addressId: 3, date: DATE };

describe('BookingsService availability', () => {
  it('offers an hourly slot that fits inside working hours', async () => {
    const { service } = setup([technician(1, '09:00', '12:00')]);
    const result = await service.availability(customer, query);
    // 60-minute job, 09:00-12:00 -> starts at 09, 10, 11 (11:00 ends exactly at 12:00).
    expect(result.slots.map((s) => s.time)).toEqual(['09:00', '10:00', '11:00']);
  });

  it('removes times that overlap an existing booking', async () => {
    const busy = [
      {
        technicianProfileId: 1,
        scheduledStart: ukToUtc(DATE, '10:00'),
        scheduledEnd: ukToUtc(DATE, '11:00'),
      },
    ];
    const { service } = setup([technician(1, '09:00', '12:00')], busy);
    const result = await service.availability(customer, query);
    expect(result.slots.map((s) => s.time)).toEqual(['09:00', '11:00']);
  });

  it('keeps a time open if another technician is free then', async () => {
    const busy = [
      { technicianProfileId: 1, scheduledStart: ukToUtc(DATE, '10:00'), scheduledEnd: ukToUtc(DATE, '11:00') },
    ];
    const { service } = setup([technician(1), technician(2)], busy);
    const result = await service.availability(customer, query);
    expect(result.slots.map((s) => s.time)).toContain('10:00');
  });

  it('respects a day-off exception', async () => {
    const tech = technician(1, '09:00', '12:00');
    tech.technicianExceptions = [{ exceptionDate: ukToUtc(DATE, '00:00'), startTime: '09:00', endTime: '11:00' }];
    const { service } = setup([tech]);
    const result = await service.availability(customer, query);
    expect(result.slots.map((s) => s.time)).toEqual(['11:00']);
  });

  it('rejects dates in the past or too far ahead', async () => {
    const { service } = setup([technician(1)]);
    await expect(service.availability(customer, { ...query, date: '2020-01-01' })).rejects.toThrow(BadRequestException);
    await expect(
      service.availability(customer, { ...query, date: addDays(ukDate(new Date()), 45) }),
    ).rejects.toThrow(BadRequestException);
  });

  it("explains when we don't cover the customer's town", async () => {
    const { service, prisma } = setup([technician(1)]);
    prisma.serviceArea.findFirst.mockResolvedValue(null);
    await expect(service.availability(customer, query)).rejects.toThrow("doesn't cover Cardiff");
  });
});

describe('BookingsService create', () => {
  it('refuses a time that is not available', async () => {
    const { service } = setup([technician(1, '09:00', '12:00')]);
    await expect(
      service.create(customer, { serviceId: 1, addressId: 3, date: DATE, time: '15:00' }),
    ).rejects.toThrow(ConflictException);
  });

  it('assigns the least-busy free technician', async () => {
    // Technician 1 already has a 14:00 job that day; technician 2 has none.
    const busy = [
      { technicianProfileId: 1, scheduledStart: ukToUtc(DATE, '14:00'), scheduledEnd: ukToUtc(DATE, '15:00') },
    ];
    const { service, tx } = setup([technician(1, '09:00', '17:00'), technician(2, '09:00', '17:00')], busy);
    tx.booking.create.mockImplementation(({ data }) => ({
      ...data,
      id: 1,
      cancelledAt: null,
      cancellationReason: null,
      createdAt: new Date(),
      service: { id: 1, name: 'Plumbing', durationInMinutes: 60 },
      address: { addressLine1: '1 Test St', addressLine2: null, city: 'Cardiff', postalCode: 'CF10 1AA' },
      technicianProfile: { id: data.technicianProfileId, userId: 99, firstName: 'Gareth', lastName: 'Evans' },
      customerProfile: { userId: 10, user: { name: 'Rhys', phone: null } },
    }));

    const booking = await service.create(customer, { serviceId: 1, addressId: 3, date: DATE, time: '09:00' });

    expect(tx.booking.create.mock.calls[0][0].data.technicianProfileId).toBe(2);
    expect(booking.status).toBe('CONFIRMED');
    // The customer only sees the technician's first name and initial.
    expect(booking.technician).toEqual({ name: 'Gareth E.' });
    // A future confirmed booking: the customer may cancel, but not start/complete it.
    expect(booking.allowedActions).toEqual({ cancel: true, start: false, complete: false });
  });

  it('tries the next technician if the first was taken at the last moment', async () => {
    const { service, tx } = setup([technician(1), technician(2)]);
    tx.booking.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0); // first locked check finds a clash
    tx.booking.create.mockImplementation(({ data }) => ({
      ...data,
      id: 1,
      createdAt: new Date(),
      service: { id: 1, name: 'Plumbing', durationInMinutes: 60 },
      address: { addressLine1: 'x', addressLine2: null, city: 'Cardiff', postalCode: 'CF10' },
      technicianProfile: { id: data.technicianProfileId, userId: 99, firstName: 'A', lastName: 'B' },
      customerProfile: { userId: 10, user: { name: 'Rhys', phone: null } },
    }));

    await service.create(customer, { serviceId: 1, addressId: 3, date: DATE, time: '09:00' });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(2); // locked both, one after the other
    expect(tx.booking.create).toHaveBeenCalledTimes(1);
  });
});

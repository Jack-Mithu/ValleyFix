import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const customer = { id: 10, name: 'Rhys', email: 'rhys@example.com', phone: null, role: 'customer' };

function setup() {
  const tx = {
    address: { updateMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  };
  const prisma = {
    customerProfile: { findUnique: vi.fn().mockResolvedValue({ id: 5 }) },
    user: {
      update: vi.fn(),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ name: 'Rhys', email: 'x', phone: null, createdAt: new Date(), address: [] }),
    },
    serviceArea: { findMany: vi.fn().mockResolvedValue([{ city: 'Cardiff' }]) },
    address: { count: vi.fn().mockResolvedValue(1), findFirst: vi.fn() },
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  return { service: new CustomersService(prisma as unknown as PrismaService), prisma, tx };
}

const newAddress = { addressLine1: '2 New Rd', city: 'Swansea', postcode: 'SA1 1AA', country: 'United Kingdom' };

describe('CustomersService', () => {
  it("can't edit someone else's address", async () => {
    const { service, prisma } = setup();
    prisma.address.findFirst.mockResolvedValue(null); // not found for THIS user
    await expect(service.updateAddress(customer, 99, { city: 'Cardiff' })).rejects.toThrow(NotFoundException);
    expect(prisma.address.findFirst).toHaveBeenCalledWith({ where: { id: 99, userId: customer.id } });
  });

  it('setting a new default clears the old one first', async () => {
    const { service, prisma, tx } = setup();
    prisma.address.findFirst.mockResolvedValue({ id: 3, userId: customer.id });
    await service.updateAddress(customer, 3, { isDefault: true });
    expect(tx.address.updateMany).toHaveBeenCalledWith({ where: { userId: customer.id }, data: { isDefault: false } });
    expect(tx.address.update).toHaveBeenCalledWith(expect.objectContaining({ data: { isDefault: true } }));
  });

  it('the first address saved becomes the default', async () => {
    const { service, prisma, tx } = setup();
    prisma.address.count.mockResolvedValue(0);
    await service.addAddress(customer, newAddress);
    expect(tx.address.create.mock.calls[0][0].data.isDefault).toBe(true);
  });

  it('limits customers to 10 addresses', async () => {
    const { service, prisma } = setup();
    prisma.address.count.mockResolvedValue(10);
    await expect(service.addAddress(customer, newAddress)).rejects.toThrow(BadRequestException);
  });

  it('only updates name and phone, and an empty phone clears it', async () => {
    const { service, prisma } = setup();
    await service.updateMe(customer, { name: 'Rhys Morgan', phone: '' });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: customer.id }, data: { name: 'Rhys Morgan', phone: null } });
  });
});

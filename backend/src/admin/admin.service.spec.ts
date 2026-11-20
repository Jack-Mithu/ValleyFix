import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { Role } from '../auth/roles.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { UploadsService } from '../uploads/uploads.service.js';

const superAdmin = { id: 1, name: 'Boss', email: 'boss@example.com', phone: null, role: Role.SUPER_ADMIN };
const subAdmin = { id: 2, name: 'Helper', email: 'helper@example.com', phone: null, role: Role.ADMIN };

describe('AdminService permission rules', () => {
  const prisma = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  };
  const service = new AdminService(
    prisma as unknown as PrismaService,
    {} as UploadsService,
  );

  // The account being edited.
  const target = (id: number, role: string) =>
    prisma.user.findUnique.mockResolvedValueOnce({
      id,
      name: 'Target',
      email: 'target@example.com',
      phone: null,
      isActive: true,
      role: { name: role },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.update.mockResolvedValue({ id: 99, role: { name: Role.CUSTOMER } });
  });

  it('nobody can change the super admin account, not even the super admin', async () => {
    for (const actor of [superAdmin, subAdmin]) {
      target(1, Role.SUPER_ADMIN);
      await expect(service.updateUser(actor, 1, { name: 'New Name' })).rejects.toThrow(ForbiddenException);
    }
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('a sub admin cannot change another admin', async () => {
    target(3, Role.ADMIN);
    await expect(service.updateUser(subAdmin, 3, { isActive: false })).rejects.toThrow(
      'Only the super admin can manage sub admins.',
    );
  });

  it('the super admin can deactivate a sub admin', async () => {
    target(3, Role.ADMIN);
    await service.updateUser(superAdmin, 3, { isActive: false });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3 }, data: { isActive: false } }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('a sub admin can edit customers and technicians', async () => {
    for (const role of [Role.CUSTOMER, Role.TECHNICIAN]) {
      target(5, role);
      await service.updateUser(subAdmin, 5, { phone: '+447700900123' });
    }
    expect(prisma.user.update).toHaveBeenCalledTimes(2);
  });

  it('an empty phone number clears it', async () => {
    target(5, Role.CUSTOMER);
    await service.updateUser(subAdmin, 5, { phone: '' });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { phone: null } }),
    );
  });

  it('rejects an update with nothing to change', async () => {
    target(5, Role.CUSTOMER);
    await expect(service.updateUser(subAdmin, 5, {})).rejects.toThrow(BadRequestException);
  });

  it('a sub admin cannot list sub admins', async () => {
    await expect(service.listUsers(subAdmin, { role: 'admin' })).rejects.toThrow(ForbiddenException);
  });
});

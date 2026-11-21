import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';

describe('AuthService', () => {
  let service: AuthService;

  // Fakes for everything AuthService depends on, so no real database is needed.
  const prisma = {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    role: { findFirst: vi.fn() },
    auditLog: { create: vi.fn() },
    customerProfile: { create: vi.fn() },
    address: { create: vi.fn() },
    // Run the transaction callback against the same fake client.
    $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  };

  const jwtService = { signAsync: vi.fn().mockResolvedValue('signed-token') };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: UploadsService, useValue: {} },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    const storedUser = async (overrides: Record<string, unknown> = {}) => ({
      id: 7,
      name: 'Rhys Morgan',
      email: 'rhys@example.com',
      phone: null,
      isActive: true,
      // Low cost factor keeps the test fast.
      passwordHash: await bcrypt.hash('CorrectHorse1', 4),
      role: { name: 'customer' },
      ...overrides,
    });

    it('returns a token and never the password hash', async () => {
      prisma.user.findUnique.mockResolvedValue(await storedUser());

      const result = await service.login({
        email: 'rhys@example.com',
        password: 'CorrectHorse1',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 7,
        email: 'rhys@example.com',
        role: 'customer',
      });
    });

    it('looks up the email in lower case', async () => {
      prisma.user.findUnique.mockResolvedValue(await storedUser());

      await service.login({
        email: '  Rhys@Example.COM ',
        password: 'CorrectHorse1',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'rhys@example.com' } }),
      );
    });

    it('rejects a wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(await storedUser());

      await expect(
        service.login({ email: 'rhys@example.com', password: 'WrongPass1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an unknown email with the same message', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'whatever1' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('rejects an inactive account', async () => {
      prisma.user.findUnique.mockResolvedValue(
        await storedUser({ isActive: false }),
      );

      await expect(
        service.login({ email: 'rhys@example.com', password: 'CorrectHorse1' }),
      ).rejects.toThrow('Your account is inactive');
    });
  });

  describe('register (customer)', () => {
    const dto = {
      name: 'Rhys Morgan',
      email: 'Rhys.Morgan@Example.com',
      phone: '+447700900123',
      password: 'ValleyFix@2026',
      addressLine1: '14 Heol y Coed',
      city: 'Cardiff',
      postcode: 'CF14 3AB',
      country: 'United Kingdom',
    };

    it('rejects an email that is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('stores the email in lower case and hashes the password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.role.findFirst.mockResolvedValue({ id: 1, name: 'customer' });
      prisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 10, ...data }),
      );
      prisma.customerProfile.create.mockResolvedValue({ id: 20 });
      prisma.address.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 30, ...data }),
      );

      const result = await service.register(dto);

      const createdUser = prisma.user.create.mock.calls[0][0].data;
      expect(createdUser.email).toBe('rhys.morgan@example.com');
      expect(createdUser.passwordHash).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, createdUser.passwordHash)).toBe(
        true,
      );
      expect(result.address.postcode).toBe('CF14 3AB');
    });
  });

  describe('changePassword', () => {
    const account = async (role = 'customer', password = 'OldPassword1') => ({
      id: 7,
      email: 'rhys@example.com',
      isActive: true,
      passwordHash: await bcrypt.hash(password, 4),
      role: { name: role },
    });

    it('rejects a wrong current password', async () => {
      prisma.user.findUnique.mockResolvedValue(await account());
      await expect(
        service.changePassword(7, { currentPassword: 'nope', newPassword: 'NewPassword1' }),
      ).rejects.toThrow('Your current password is incorrect.');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects reusing the same password', async () => {
      prisma.user.findUnique.mockResolvedValue(await account());
      await expect(
        service.changePassword(7, { currentPassword: 'OldPassword1', newPassword: 'OldPassword1' }),
      ).rejects.toThrow('must be different');
    });

    it('requires at least 10 characters for admins', async () => {
      prisma.user.findUnique.mockResolvedValue(await account('admin'));
      await expect(
        service.changePassword(7, { currentPassword: 'OldPassword1', newPassword: 'Short123' }),
      ).rejects.toThrow('Admin passwords must be at least 10 characters.');
    });

    it('stores a new hash, records the change time and returns a fresh token', async () => {
      prisma.user.findUnique.mockResolvedValue(await account());

      const result = await service.changePassword(7, {
        currentPassword: 'OldPassword1',
        newPassword: 'BrandNewPass1',
      });

      const { data } = prisma.user.update.mock.calls[0][0];
      expect(await bcrypt.compare('BrandNewPass1', data.passwordHash)).toBe(true);
      expect(data.passwordChangedAt).toBeInstanceOf(Date);
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('signed-token');
    });
  });
});

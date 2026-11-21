import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('JwtStrategy.validate', () => {
  const prisma = { user: { findUnique: vi.fn() } };
  const config = { get: () => 'test-secret' } as unknown as ConfigService;
  const strategy = new JwtStrategy(config, prisma as unknown as PrismaService);

  const user = (overrides: Record<string, unknown> = {}) => ({
    id: 7,
    name: 'Rhys',
    email: 'rhys@example.com',
    phone: null,
    isActive: true,
    passwordChangedAt: null,
    role: { name: 'customer' },
    technicianProfile: null,
    ...overrides,
  });

  const payload = (iat: number) => ({ sub: 7, email: 'rhys@example.com', role: 'customer', iat });

  it('accepts a valid token', async () => {
    prisma.user.findUnique.mockResolvedValue(user());
    await expect(strategy.validate(payload(1_000))).resolves.toMatchObject({ id: 7, role: 'customer' });
  });

  it('rejects deactivated accounts', async () => {
    prisma.user.findUnique.mockResolvedValue(user({ isActive: false }));
    await expect(strategy.validate(payload(1_000))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects tokens issued before the last password change', async () => {
    // Password changed at t = 2000 s; this token was issued at t = 1999 s.
    prisma.user.findUnique.mockResolvedValue(user({ passwordChangedAt: new Date(2_000_000) }));
    await expect(strategy.validate(payload(1_999))).rejects.toThrow('Your password was changed');
  });

  it('accepts the fresh token issued in the same second as the change', async () => {
    prisma.user.findUnique.mockResolvedValue(user({ passwordChangedAt: new Date(2_000_400) }));
    await expect(strategy.validate(payload(2_000))).resolves.toMatchObject({ id: 7 });
  });
});

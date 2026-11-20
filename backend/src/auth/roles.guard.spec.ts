import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { Role } from './roles.js';

// Builds a fake request context with the given user and @Roles metadata.
function contextFor(role: string | undefined, required: string[] | undefined) {
  const reflector = { getAllAndOverride: () => required } as unknown as Reflector;
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { id: 1, role } : undefined }),
    }),
  } as unknown as ExecutionContext;
  return { guard: new RolesGuard(reflector), context };
}

describe('RolesGuard', () => {
  it('allows any logged-in user when no roles are required', () => {
    const { guard, context } = contextFor(Role.CUSTOMER, undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a user whose role is listed', () => {
    const { guard, context } = contextFor(Role.ADMIN, [Role.ADMIN, Role.SUPER_ADMIN]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('blocks a sub admin from a super-admin-only route', () => {
    const { guard, context } = contextFor(Role.ADMIN, [Role.SUPER_ADMIN]);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('blocks customers and technicians from admin routes', () => {
    for (const role of [Role.CUSTOMER, Role.TECHNICIAN]) {
      const { guard, context } = contextFor(role, [Role.ADMIN, Role.SUPER_ADMIN]);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    }
  });
});

import { SetMetadata } from '@nestjs/common';

// Role names exactly as stored in the `roles` table (see prisma/seed.ts).
export const Role = {
  CUSTOMER: 'customer',
  TECHNICIAN: 'technician',
  /** Sub admin: manages customers and technicians. */
  ADMIN: 'admin',
  /** The real admin: everything, including approvals and managing sub admins. */
  SUPER_ADMIN: 'super_admin',
} as const;

export type RoleName = (typeof Role)[keyof typeof Role];

export const ADMIN_ROLES: RoleName[] = [Role.ADMIN, Role.SUPER_ADMIN];

export const ROLES_KEY = 'roles';

/**
 * Restrict a route (or a whole controller) to the given roles.
 * Must be combined with JwtAuthGuard + RolesGuard:
 *
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.SUPER_ADMIN)
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);

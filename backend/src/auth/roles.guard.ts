import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, type RoleName } from './roles.js';
import type { AuthenticatedUser } from './jwt.strategy.js';

/**
 * Checks the @Roles(...) metadata against the logged-in user's role.
 * Runs after JwtAuthGuard, which has already put the user on the request.
 * A method-level @Roles overrides a controller-level one.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleName[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() means "any logged-in user".
    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();

    if (!user || !required.includes(user.role as RoleName)) {
      throw new ForbiddenException('You do not have permission to do this.');
    }

    return true;
  }
}

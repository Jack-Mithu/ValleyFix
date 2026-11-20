import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import type { TechnicianApprovalStatus } from '../generated/prisma/enums.js';

// The data we put inside the token when the user logs in (see AuthService).
export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

// What controllers receive as `req.user` after a successful check.
export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  /** Only for technicians: PENDING until a super admin approves them. */
  approvalStatus?: TechnicianApprovalStatus;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is missing from the backend environment');
    }

    super({
      // Read the token from the "Authorization: Bearer <token>" header.
      // Both the Next.js server and the future mobile app send it this way.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Runs only after passport-jwt has verified the signature and expiry.
  // We still load the user, so deactivated or deleted accounts lose access
  // immediately instead of when their token expires.
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
        technicianProfile: { select: { approvalStatus: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Your session is no longer valid');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      ...(user.technicianProfile && {
        approvalStatus: user.technicianProfile.approvalStatus,
      }),
    };
  }
}

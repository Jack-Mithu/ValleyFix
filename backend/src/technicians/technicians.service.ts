import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { toMinutes } from '../common/uk-time.js';
import type { SetAvailabilityDto, UpdateMyTechnicianDto } from './dto/technicians.dto.js';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  private async profileId(user: AuthenticatedUser) {
    const profile = await this.prisma.technicianProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) throw new ForbiddenException('Technician account required.');
    return profile.id;
  }

  async me(user: AuthenticatedUser) {
    const id = await this.profileId(user);
    const profile = await this.prisma.technicianProfile.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        approvalStatus: true,
        rejectionReason: true,
        createdAt: true,
        user: { select: { email: true, phone: true } },
        technicianServices: {
          where: { isActive: true },
          select: { service: { select: { name: true } } },
        },
        technicianServiceAreas: {
          where: { isActive: true },
          select: { serviceArea: { select: { city: true } } },
        },
        technicianAvailability: {
          where: { isAvailable: true },
          select: { dayOfWeek: true, startTime: true, endTime: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.user.email,
      phone: profile.user.phone,
      bio: profile.bio,
      approvalStatus: profile.approvalStatus,
      rejectionReason: profile.rejectionReason,
      memberSince: profile.createdAt,
      services: profile.technicianServices.map((s) => s.service.name),
      areas: [...new Set(profile.technicianServiceAreas.map((a) => a.serviceArea.city))],
      availability: profile.technicianAvailability,
    };
  }

  async updateMe(user: AuthenticatedUser, dto: UpdateMyTechnicianDto) {
    const id = await this.profileId(user);
    if (dto.phone === undefined && dto.bio === undefined) {
      throw new BadRequestException('Nothing to update.');
    }

    await this.prisma.$transaction([
      ...(dto.phone !== undefined
        ? [this.prisma.user.update({ where: { id: user.id }, data: { phone: dto.phone || null } })]
        : []),
      ...(dto.bio !== undefined
        ? [this.prisma.technicianProfile.update({ where: { id }, data: { bio: dto.bio || null } })]
        : []),
    ]);

    return this.me(user);
  }

  /**
   * Replace the technician's weekly working hours (one window per day).
   * Jobs already accepted are not affected; new requests follow the new hours.
   */
  async setAvailability(user: AuthenticatedUser, dto: SetAvailabilityDto) {
    const id = await this.profileId(user);

    const seen = new Set<number>();
    for (const day of dto.days) {
      if (seen.has(day.dayOfWeek)) {
        throw new BadRequestException('Each day can only appear once.');
      }
      seen.add(day.dayOfWeek);
      if (toMinutes(day.startTime) >= toMinutes(day.endTime)) {
        throw new BadRequestException('Each day must finish after it starts.');
      }
    }

    await this.prisma.$transaction([
      this.prisma.technicianAvailability.deleteMany({ where: { technicianProfileId: id } }),
      this.prisma.technicianAvailability.createMany({
        data: dto.days.map((d) => ({
          technicianProfileId: id,
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime,
          isAvailable: true,
        })),
      }),
    ]);

    return this.me(user);
  }
}

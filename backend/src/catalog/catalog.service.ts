import { Injectable, NotFoundException } from '@nestjs/common';
import { access } from 'node:fs/promises';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';
import type { Prisma } from '../generated/prisma/client.js';

// Only technicians who are approved AND active are ever shown publicly.
const PUBLIC_TECHNICIAN: Prisma.TechnicianProfileWhereInput = {
  approvalStatus: 'APPROVED',
  user: { isActive: true },
};

// Public, read-only data: what ValleyFix offers, where, and who does the work.
@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  /**
   * Approved technicians, optionally filtered by town and/or service slug.
   * Public-safe details only: never email, phone, address, ID or NI number.
   */
  async technicians(filters: { city?: string; service?: string }) {
    const technicians = await this.prisma.technicianProfile.findMany({
      where: {
        ...PUBLIC_TECHNICIAN,
        ...(filters.city && {
          technicianServiceAreas: {
            some: { isActive: true, serviceArea: { city: { equals: filters.city, mode: 'insensitive' } } },
          },
        }),
        ...(filters.service && {
          technicianServices: { some: { isActive: true, service: { slug: filters.service } } },
        }),
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        profilePic: true,
        createdAt: true,
        technicianServices: {
          where: { isActive: true, service: { isActive: true } },
          select: { service: { select: { name: true, slug: true } } },
        },
        technicianServiceAreas: {
          where: { isActive: true },
          select: { serviceArea: { select: { city: true } } },
        },
        _count: { select: { bookings: { where: { status: 'COMPLETED' } } } },
      },
    });

    return technicians.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName.charAt(0)}.`,
      bio: t.bio,
      hasPhoto: Boolean(t.profilePic),
      memberSince: t.createdAt,
      completedJobs: t._count.bookings,
      services: t.technicianServices.map((s) => s.service),
      areas: [...new Set(t.technicianServiceAreas.map((a) => a.serviceArea.city))],
    }));
  }

  /** Profile photo of an approved technician (never their ID document). */
  async technicianPhoto(id: number) {
    const tech = await this.prisma.technicianProfile.findFirst({
      where: { id, ...PUBLIC_TECHNICIAN },
      select: { profilePic: true },
    });
    if (!tech?.profilePic) throw new NotFoundException('Photo not found.');

    const path = this.uploads.resolveTechnicianFile(tech.profilePic);
    try {
      await access(path);
    } catch {
      throw new NotFoundException('Photo not found.');
    }

    const ext = tech.profilePic.slice(tech.profilePic.lastIndexOf('.')).toLowerCase();
    const contentType =
      { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext];
    if (!contentType) throw new NotFoundException('Photo not found.');

    return { path, contentType };
  }

  async services() {
    const services = await this.prisma.service.findMany({
      where: { isActive: true, category: { isActive: true } },
      orderBy: [{ category: { sortedOrder: 'asc' } }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        basePrice: true,
        durationInMinutes: true,
        category: { select: { name: true } },
      },
    });

    return services.map(({ basePrice, category, ...s }) => ({
      ...s,
      category: category.name,
      // Prisma returns money as a Decimal object; send a plain number.
      basePrice: Number(basePrice),
    }));
  }

  areas() {
    return this.prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { city: 'asc' },
      select: { id: true, name: true, city: true, postalCode: true },
    });
  }
}

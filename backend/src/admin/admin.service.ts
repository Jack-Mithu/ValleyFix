import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { access } from 'node:fs/promises';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';
import { Role, type RoleName } from '../auth/roles.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import type {
  CreateSubAdminDto,
  ListTechniciansQueryDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './dto/admin.dto.js';
import type { Prisma } from '../generated/prisma/client.js';

// Fields that are safe to send to the admin UI (never the password hash).
const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
  role: { select: { name: true } },
  technicianProfile: {
    select: { id: true, approvalStatus: true },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  /*
   * THE PERMISSION RULES, in one place:
   *  - Nobody can change the super admin account through the admin API.
   *  - Only the super admin can view or change sub admins.
   *  - Sub admins and the super admin can manage customers and technicians.
   */
  private assertCanManage(actor: AuthenticatedUser, targetRole: string) {
    if (targetRole === Role.SUPER_ADMIN) {
      throw new ForbiddenException('The super admin account cannot be changed here.');
    }
    if (targetRole === Role.ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only the super admin can manage sub admins.');
    }
  }

  private async audit(
    actor: AuthenticatedUser,
    action: string,
    entity: string,
    entityId: number,
    oldValues?: object,
    newValues?: object,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action,
        entity,
        entityId,
        oldValues: oldValues as Prisma.InputJsonValue | undefined,
        newValues: newValues as Prisma.InputJsonValue | undefined,
      },
    });
  }

  // ---------- Overview ----------

  async overview(actor: AuthenticatedUser) {
    const countRole = (name: RoleName) =>
      this.prisma.user.count({ where: { role: { name } } });

    const [customers, technicians, pendingTechnicians, subAdmins] = await Promise.all([
      countRole(Role.CUSTOMER),
      countRole(Role.TECHNICIAN),
      this.prisma.technicianProfile.count({ where: { approvalStatus: 'PENDING' } }),
      actor.role === Role.SUPER_ADMIN ? countRole(Role.ADMIN) : Promise.resolve(null),
    ]);

    return { customers, technicians, pendingTechnicians, subAdmins };
  }

  // ---------- Users ----------

  async listUsers(actor: AuthenticatedUser, query: ListUsersQueryDto) {
    if (query.role === Role.ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only the super admin can view sub admins.');
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.UserWhereInput = {
      role: query.role
        ? { name: query.role }
        : { name: { in: [Role.CUSTOMER, Role.TECHNICIAN] } },
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      users: users.map(({ role, ...u }) => ({ ...u, role: role.name })),
    };
  }

  async getUser(actor: AuthenticatedUser, id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        address: {
          select: {
            id: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            postalCode: true,
            country: true,
            isDefault: true,
          },
        },
        technicianProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            ni_Number: true,
            approvalStatus: true,
            reviewedAt: true,
            rejectionReason: true,
            createdAt: true,
            technicianServices: { select: { service: { select: { name: true } } } },
            technicianServiceAreas: { select: { serviceArea: { select: { city: true } } } },
            technicianAvailability: {
              select: { dayOfWeek: true, startTime: true, endTime: true },
              orderBy: { dayOfWeek: 'asc' },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    // Sub admins may not look at admin accounts at all.
    if (actor.role !== Role.SUPER_ADMIN && user.role.name !== Role.CUSTOMER && user.role.name !== Role.TECHNICIAN) {
      throw new ForbiddenException('You do not have permission to view this account.');
    }

    const { role, technicianProfile, ...rest } = user;

    return {
      ...rest,
      role: role.name,
      technician: technicianProfile && {
        id: technicianProfile.id,
        firstName: technicianProfile.firstName,
        lastName: technicianProfile.lastName,
        bio: technicianProfile.bio,
        approvalStatus: technicianProfile.approvalStatus,
        reviewedAt: technicianProfile.reviewedAt,
        rejectionReason: technicianProfile.rejectionReason,
        appliedAt: technicianProfile.createdAt,
        // The NI number is sensitive: only the super admin (who approves) sees it in full.
        niNumber:
          actor.role === Role.SUPER_ADMIN
            ? technicianProfile.ni_Number
            : `•••••${technicianProfile.ni_Number.slice(-3)}`,
        services: technicianProfile.technicianServices.map((s) => s.service.name),
        areas: technicianProfile.technicianServiceAreas.map((a) => a.serviceArea.city),
        availability: technicianProfile.technicianAvailability,
      },
    };
  }

  async updateUser(actor: AuthenticatedUser, id: number, dto: UpdateUserDto) {
    const target = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!target) throw new NotFoundException('User not found.');

    this.assertCanManage(actor, target.role.name);

    if (target.id === actor.id && dto.isActive === false) {
      throw new BadRequestException('You cannot deactivate your own account.');
    }

    if (dto.email && dto.email !== target.email) {
      const taken = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (taken) throw new ConflictException('That email is already used by another account.');
    }

    const data: Prisma.UserUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone !== undefined && { phone: dto.phone || null }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nothing to update.');
    }

    const updated = await this.prisma.user.update({ where: { id }, data, select: userSelect });

    await this.audit(
      actor,
      'user.update',
      'User',
      id,
      { name: target.name, email: target.email, phone: target.phone, isActive: target.isActive },
      data,
    );

    return { ...updated, role: updated.role.name };
  }

  // ---------- Technician approval ----------

  async listTechnicians(query: ListTechniciansQueryDto) {
    const technicians = await this.prisma.technicianProfile.findMany({
      where: query.status ? { approvalStatus: query.status } : undefined,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        approvalStatus: true,
        createdAt: true,
        user: { select: { id: true, email: true, phone: true, isActive: true } },
        technicianServices: { select: { service: { select: { name: true } } } },
        technicianServiceAreas: { select: { serviceArea: { select: { city: true } } } },
      },
    });

    return technicians.map((t) => ({
      userId: t.user.id,
      name: `${t.firstName} ${t.lastName}`,
      email: t.user.email,
      phone: t.user.phone,
      isActive: t.user.isActive,
      approvalStatus: t.approvalStatus,
      appliedAt: t.createdAt,
      services: t.technicianServices.map((s) => s.service.name),
      areas: t.technicianServiceAreas.map((a) => a.serviceArea.city),
    }));
  }

  private async findTechnicianByUserId(userId: number) {
    const profile = await this.prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Technician not found.');
    return profile;
  }

  async approveTechnician(actor: AuthenticatedUser, userId: number) {
    const profile = await this.findTechnicianByUserId(userId);

    const updated = await this.prisma.technicianProfile.update({
      where: { id: profile.id },
      data: {
        approvalStatus: 'APPROVED',
        reviewedAt: new Date(),
        reviewedById: actor.id,
        rejectionReason: null,
      },
      select: { approvalStatus: true, reviewedAt: true },
    });

    await this.audit(actor, 'technician.approve', 'TechnicianProfile', profile.id,
      { approvalStatus: profile.approvalStatus }, { approvalStatus: 'APPROVED' });

    return updated;
  }

  async rejectTechnician(actor: AuthenticatedUser, userId: number, reason: string) {
    const profile = await this.findTechnicianByUserId(userId);

    const updated = await this.prisma.technicianProfile.update({
      where: { id: profile.id },
      data: {
        approvalStatus: 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: actor.id,
        rejectionReason: reason,
      },
      select: { approvalStatus: true, reviewedAt: true, rejectionReason: true },
    });

    await this.audit(actor, 'technician.reject', 'TechnicianProfile', profile.id,
      { approvalStatus: profile.approvalStatus }, { approvalStatus: 'REJECTED', reason });

    return updated;
  }

  /** Absolute path + content type of a technician's ID document or profile photo. */
  async technicianFile(userId: number, kind: 'identity' | 'profile') {
    const profile = await this.findTechnicianByUserId(userId);
    const stored = kind === 'identity' ? profile.id_Proof : profile.profilePic;
    if (!stored) throw new NotFoundException('File not found.');

    const path = this.uploads.resolveTechnicianFile(stored);
    try {
      await access(path);
    } catch {
      throw new NotFoundException('File not found.');
    }

    const extension = stored.slice(stored.lastIndexOf('.')).toLowerCase();
    const contentType =
      {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
      }[extension] ?? 'application/octet-stream';

    return { path, contentType };
  }

  // ---------- Sub admins ----------

  async createSubAdmin(actor: AuthenticatedUser, dto: CreateSubAdminDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('That email is already used by another account.');

    const adminRole = await this.prisma.role.findUnique({ where: { name: Role.ADMIN } });
    if (!adminRole) throw new InternalServerErrorException('Admin role has not been configured.');

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 12),
        roleId: adminRole.id,
      },
      select: userSelect,
    });

    await this.audit(actor, 'admin.create', 'User', user.id, undefined, { name: dto.name, email: dto.email });

    return { ...user, role: user.role.name };
  }

  // ---------- Audit log ----------

  async auditLog() {
    const entries = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        newValues: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    });
    return entries;
  }
}

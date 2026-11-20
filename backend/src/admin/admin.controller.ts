import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ADMIN_ROLES, Role, Roles } from '../auth/roles.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { AdminService } from './admin.service.js';
import {
  CreateSubAdminDto,
  ListTechniciansQueryDto,
  ListUsersQueryDto,
  RejectTechnicianDto,
  UpdateUserDto,
} from './dto/admin.dto.js';

// Every route here needs a logged-in admin or super admin by default.
// Routes marked @Roles(Role.SUPER_ADMIN) are for the real admin only.
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMIN_ROLES)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview(@CurrentUser() actor: AuthenticatedUser) {
    return this.admin.overview(actor);
  }

  // ----- Customers, technicians (and sub admins for the super admin) -----

  @Get('users')
  listUsers(@CurrentUser() actor: AuthenticatedUser, @Query() query: ListUsersQueryDto) {
    return this.admin.listUsers(actor, query);
  }

  @Get('users/:id')
  getUser(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.admin.getUser(actor, id);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.admin.updateUser(actor, id, dto);
  }

  // ----- Technician approval -----

  @Get('technicians')
  listTechnicians(@Query() query: ListTechniciansQueryDto) {
    return this.admin.listTechnicians(query);
  }

  @Post('technicians/:userId/approve')
  @HttpCode(200)
  @Roles(Role.SUPER_ADMIN)
  approve(@CurrentUser() actor: AuthenticatedUser, @Param('userId', ParseIntPipe) userId: number) {
    return this.admin.approveTechnician(actor, userId);
  }

  @Post('technicians/:userId/reject')
  @HttpCode(200)
  @Roles(Role.SUPER_ADMIN)
  reject(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: RejectTechnicianDto,
  ) {
    return this.admin.rejectTechnician(actor, userId, dto.reason);
  }

  // ID documents: super admin only. Profile photos: any admin.
  @Get('technicians/:userId/files/:kind')
  async technicianFile(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('kind', new ParseEnumPipe(['identity', 'profile'])) kind: 'identity' | 'profile',
  ) {
    if (kind === 'identity' && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only the super admin can view identity documents.');
    }

    const file = await this.admin.technicianFile(userId, kind);
    return new StreamableFile(createReadStream(file.path), {
      type: file.contentType,
      disposition: 'inline',
    });
  }

  // ----- Sub admins + audit log: super admin only -----

  @Post('admins')
  @Roles(Role.SUPER_ADMIN)
  createSubAdmin(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateSubAdminDto) {
    return this.admin.createSubAdmin(actor, dto);
  }

  @Get('audit-log')
  @Roles(Role.SUPER_ADMIN)
  auditLog() {
    return this.admin.auditLog();
  }
}

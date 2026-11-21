import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { BookingsModule } from '../bookings/bookings.module.js';

@Module({
  // AuthModule exports PassportModule, which JwtAuthGuard needs.
  imports: [AuthModule, PrismaModule, UploadsModule, BookingsModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}

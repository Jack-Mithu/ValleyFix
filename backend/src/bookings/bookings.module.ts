import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService, RolesGuard],
  exports: [BookingsService], // the admin module lists all bookings with it
})
export class BookingsModule {}

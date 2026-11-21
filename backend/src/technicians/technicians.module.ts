import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [TechniciansController],
  providers: [TechniciansService, RolesGuard],
})
export class TechniciansModule {}

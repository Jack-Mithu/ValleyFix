import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Role, Roles } from '../auth/roles.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { TechniciansService } from './technicians.service.js';
import { SetAvailabilityDto, UpdateMyTechnicianDto } from './dto/technicians.dto.js';

// The logged-in technician's own profile. Works before approval too, so
// technicians can check their details while they wait.
@Controller('technicians/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TECHNICIAN)
export class TechniciansController {
  constructor(private readonly technicians: TechniciansService) {}

  @Get()
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.technicians.me(user);
  }

  @Patch()
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateMyTechnicianDto) {
    return this.technicians.updateMe(user, dto);
  }

  @Put('availability')
  setAvailability(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetAvailabilityDto) {
    return this.technicians.setAvailability(user, dto);
  }
}

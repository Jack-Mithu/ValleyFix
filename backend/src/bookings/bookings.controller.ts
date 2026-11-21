import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Role, Roles } from '../auth/roles.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { BookingsService } from './bookings.service.js';
import { AvailabilityQueryDto, CancelBookingDto, CreateBookingDto } from './dto/bookings.dto.js';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // ----- Customer: making a booking -----

  @Get('my-addresses')
  @Roles(Role.CUSTOMER)
  myAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.bookings.myAddresses(user);
  }

  @Get('availability')
  @Roles(Role.CUSTOMER)
  availability(@CurrentUser() user: AuthenticatedUser, @Query() query: AvailabilityQueryDto) {
    return this.bookings.availability(user, query);
  }

  @Post()
  @Roles(Role.CUSTOMER)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookingDto) {
    return this.bookings.create(user, dto);
  }

  // ----- Customers and technicians: their own bookings -----

  @Get('mine')
  @Roles(Role.CUSTOMER, Role.TECHNICIAN)
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.bookings.mine(user);
  }

  // Any logged-in user; the service checks it's their booking (or an admin).
  @Get(':id')
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.bookings.getOne(user, id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN)
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookings.cancel(user, id, dto.reason);
  }

  // ----- Technician: doing the job -----

  @Post(':id/start')
  @HttpCode(200)
  @Roles(Role.TECHNICIAN)
  start(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.bookings.start(user, id);
  }

  @Post(':id/complete')
  @HttpCode(200)
  @Roles(Role.TECHNICIAN)
  complete(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.bookings.complete(user, id);
  }
}

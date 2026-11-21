import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Role, Roles } from '../auth/roles.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { CustomersService } from './customers.service.js';
import { CreateAddressDto, UpdateAddressDto, UpdateMyProfileDto } from './dto/customers.dto.js';

// The logged-in customer's own profile and addresses.
@Controller('customers/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.customers.me(user);
  }

  @Patch()
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateMyProfileDto) {
    return this.customers.updateMe(user, dto);
  }

  @Post('addresses')
  addAddress(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAddressDto) {
    return this.customers.addAddress(user, dto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.customers.updateAddress(user, id, dto);
  }
}

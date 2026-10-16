import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // CUSTOMER REGISTRATION
  async register(registerDto: RegisterDto) {
    const {
      name,
      phone,
      email,
      password,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
      isDefault,
    } = registerDto;

    // Check whether the email is already registered.
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Find the customer role.
    const customerRole = await this.prisma.role.findFirst({
      where: { name: 'customer' },
    });

    if (!customerRole) {
      throw new InternalServerErrorException(
        'Customer role has not been configured',
      );
    }

    // Hash the password before saving it.
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user, customer profile and address atomically.
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          phone,
          email,
          passwordHash,
          roleId: customerRole.id,
        },
      });

      const customerProfile = await tx.customerProfile.create({
        data: {
          userId: user.id,
        },
      });

      const address = await tx.address.create({
        data: {
          userId: user.id,
          customerProfileId: customerProfile.id,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,

          // The frontend uses "postcode".
          // The Prisma Address model uses "postalCode".
          postalCode: postcode,

          country,
          isDefault: isDefault ?? true,
        },
      });

      return { user, customerProfile, address };
    });

    // Generate the JWT.
    const accessToken = await this.jwtService.signAsync({
      sub: result.user.id,
      email: result.user.email,
      role: customerRole.name,
    });

    // Return safe user information without the password hash.
    return {
      message: 'Registration successful',
      accessToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: customerRole.name,
      },
      address: {
        id: result.address.id,
        addressLine1: result.address.addressLine1,
        addressLine2: result.address.addressLine2,
        city: result.address.city,
        postcode: result.address.postalCode,
        country: result.address.country,
        isDefault: result.address.isDefault,
      },
    };
  }

  // LOGIN
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find the user and their role.
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    // Use the same message for an unknown email and incorrect password.
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reject inactive accounts.
    if (!user.isActive) {
      throw new UnauthorizedException('Your account is inactive');
    }

    // Compare the submitted password with the stored hash.
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create a signed JWT.
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    // Never return the password hash.
    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
    };
  }
}
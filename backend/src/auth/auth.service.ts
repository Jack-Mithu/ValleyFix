import { Injectable, 
  ConflictException,
  InternalServerErrorException, 
  UnauthorizedException } from '@nestjs/common';

import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import{PrismaService} from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from '../auth/dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    // Implementation for registration logic
    const { name, email, phone,password } = registerDto;

  const existingUser = await this.prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictException('User already exists');
  }

  const customerRole = await this.prisma.role.findFirst({
      where: {
        name: 'customer',
      },
    });
    if (!customerRole) {
      throw new InternalServerErrorException(
        'Customer role has not been configured',
      );
    }

  const passwordhash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        name,
        phone,
        email,
        password,
        passwordhash,
        roleId: customerRole.id,
      },
      include: {
        role: true,
      },
    });

  const accesstoken = await this.jwtService.signAsync({ 
    sub: user.id,
    email: user.email,
  role: user.role.name,
  });

  return { message: 'User registered successfully', 
    user :{ 
      id: user.id, 
      name: user.name, 
      email: user.email }, 
      accesstoken };

    }
  }
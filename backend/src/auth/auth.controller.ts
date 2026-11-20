import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { AuthService } from './auth.service.js';

import { RegisterDto } from './dto/register.dto.js';

import { RegisterTechnicianDto } from './dto/register-technician.dto.js';

import { LoginDto } from './dto/login.dto.js';

import { JwtAuthGuard } from './jwt-auth.guard.js';

import { CurrentUser } from './current-user.decorator.js';

import type { AuthenticatedUser } from './jwt.strategy.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // CUSTOMER REGISTRATION — keep existing functionality
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // CUSTOMER AND TECHNICIAN LOGIN — keep existing functionality
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // CURRENT USER — requires "Authorization: Bearer <token>"
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  // TECHNICIAN REGISTRATION — multipart/form-data
  @Post('register/technician')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'idProof', maxCount: 1 },
        { name: 'profilePicture', maxCount: 1 },
      ],
      {
        // Files are held in memory, so stop oversized uploads early
        // (UploadsService applies the exact per-type limits afterwards).
        limits: { fileSize: 5 * 1024 * 1024, files: 2 },
      },
    ),
  )
  registerTechnician(
    @Body() registerTechnicianDto: RegisterTechnicianDto,
    @UploadedFiles()
    files: {
      idProof?: Express.Multer.File[];
      profilePicture?: Express.Multer.File[];
    },
  ) {
    const idProof = files?.idProof?.[0];
    const profilePicture = files?.profilePicture?.[0];

    if (!idProof) {
      throw new BadRequestException('Identity document is required.');
    }

    if (!profilePicture) {
      throw new BadRequestException('Profile picture is required.');
    }

    return this.authService.registerTechnician(
      registerTechnicianDto,
      idProof,
      profilePicture,
    );
  }
}
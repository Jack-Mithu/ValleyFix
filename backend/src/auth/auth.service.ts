import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { extname } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterTechnicianDto } from './dto/register-technician.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UploadsService } from '../uploads/uploads.service.js';

@Injectable()
export class AuthService {


  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly uploadsService: UploadsService,
  ) {}

  // CUSTOMER REGISTRATION
  async register(registerDto: RegisterDto) {
    const {
      name,
      phone,
      password,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
      isDefault,
    } = registerDto;

    // Store emails in one canonical form so "Bob@x.com" and "bob@x.com"
    // can never become two different accounts.
    const email = registerDto.email.trim().toLowerCase();

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
  // TECHNICIAN REGISTRATION
  async registerTechnician(
    registerDto: RegisterTechnicianDto,
    idProof: Express.Multer.File,
    profilePicture: Express.Multer.File,
  ) {
    const {
      firstName,
      lastName,
      password,
      phone,
      niNumber,
      bio,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
      services: servicesJson,
      serviceAreas: serviceAreasJson,
      availability: availabilityJson,
    } = registerDto;

    const email = registerDto.email.trim().toLowerCase();

    // 1. Validate required uploaded files.
    if (!idProof || !profilePicture) {
      throw new BadRequestException(
        'Identity document and profile picture are required.',
      );
    }

    // 2. Check whether the email is already registered.
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    // 3. Check whether this NI number is already registered.
    const existingTechnician = await this.prisma.technicianProfile.findUnique({
      where: { ni_Number: niNumber.trim() },
    });

    if (existingTechnician) {
      throw new ConflictException(
        'This National Insurance number is already registered.',
      );
    }

    // 4. Find the technician role.
    const technicianRole = await this.prisma.role.findFirst({
      where: { name: 'technician' },
    });

    if (!technicianRole) {
      throw new InternalServerErrorException(
        'Technician role has not been configured.',
      );
    }

    // 5. Parse and validate the JSON form fields.
    let selectedServices: unknown;
    let selectedAreas: unknown;
    let selectedAvailability: unknown;

    try {
      selectedServices = JSON.parse(servicesJson);
      selectedAreas = JSON.parse(serviceAreasJson);
      selectedAvailability = JSON.parse(availabilityJson);
    } catch {
      throw new BadRequestException(
        'Services, service areas or availability contain invalid JSON.',
      );
    }

    if (
      !Array.isArray(selectedServices) ||
      selectedServices.length === 0 ||
      !selectedServices.every(
        (value) => typeof value === 'string' && value.trim().length > 0,
      )
    ) {
      throw new BadRequestException(
        'Please select at least one valid service.',
      );
    }

    if (
      !Array.isArray(selectedAreas) ||
      selectedAreas.length === 0 ||
      !selectedAreas.every(
        (value) => typeof value === 'string' && value.trim().length > 0,
      )
    ) {
      throw new BadRequestException(
        'Please select at least one valid service area.',
      );
    }

    if (
      !selectedAvailability ||
      typeof selectedAvailability !== 'object' ||
      Array.isArray(selectedAvailability)
    ) {
      throw new BadRequestException('Invalid availability information.');
    }

    const weekdayNumbers: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const availabilityRecords: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[] = [];

    for (const [day, value] of Object.entries(selectedAvailability)) {
      if (!(day in weekdayNumbers)) {
        throw new BadRequestException(`Invalid weekday: ${day}.`);
      }

      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new BadRequestException(`Invalid availability for ${day}.`);
      }

      const dayValue = value as {
        enabled?: unknown;
        startTime?: unknown;
        endTime?: unknown;
      };

      if (typeof dayValue.enabled !== 'boolean') {
        throw new BadRequestException(`Invalid availability for ${day}.`);
      }

      if (!dayValue.enabled) {
        continue;
      }

      const { startTime, endTime } = dayValue;

      const validTime = (time: unknown): time is string =>
        typeof time === 'string' &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

      if (
        !validTime(startTime) ||
        !validTime(endTime) ||
        startTime >= endTime
      ) {
        throw new BadRequestException(
          `Please provide valid working hours for ${day}.`,
        );
      }

      availabilityRecords.push({
        dayOfWeek: weekdayNumbers[day],
        startTime,
        endTime,
        isAvailable: true,
      });
    }

    if (availabilityRecords.length === 0) {
      throw new BadRequestException(
        'Please select at least one available working day.',
      );
    }

    // 6. Resolve the selected service names to existing database records.
    const serviceNames = [
      ...new Set(
        (selectedServices as string[]).map((service) => service.trim()),
      ),
    ];

    const serviceRecords = await this.prisma.service.findMany({
      where: {
        name: {
          in: serviceNames,
          mode: 'insensitive',
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const foundServiceNames = new Set(
      serviceRecords.map((service) => service.name.toLowerCase()),
    );

    const missingServices = serviceNames.filter(
      (service) => !foundServiceNames.has(service.toLowerCase()),
    );

    if (missingServices.length > 0) {
      throw new BadRequestException(
        `These services are missing or inactive in the database: ${missingServices.join(', ')}.`,
      );
    }

    // 7. Resolve selected city names to active service-area records.
    const areaNames = [
      ...new Set(
        (selectedAreas as string[]).map((area) => area.trim()),
      ),
    ];

    const areaRecords = await this.prisma.serviceArea.findMany({
      where: {
        city: {
          in: areaNames,
          mode: 'insensitive',
        },
        isActive: true,
      },
      select: {
        id: true,
        city: true,
      },
    });

    const foundCities = new Set(
      areaRecords.map((area) => area.city.toLowerCase()),
    );

    const missingAreas = areaNames.filter(
      (area) => !foundCities.has(area.toLowerCase()),
    );

    if (missingAreas.length > 0) {
      throw new BadRequestException(
        `These service areas are missing or inactive in the database: ${missingAreas.join(', ')}.`,
      );
    }

    // 8. Hash the password.
    const passwordHash = await bcrypt.hash(password, 12);

    // 9. Save files locally, then create all database records.
    // If a later operation fails, remove any files already saved.
    let savedIdentity:
      | { key: string; path: string }
      | undefined;

    let savedProfile:
      | { key: string; path: string }
      | undefined;

    try {
      savedIdentity = await this.uploadsService.saveTechnicianFile(
        idProof,
        'identity',
      );

      savedProfile = await this.uploadsService.saveTechnicianFile(
        profilePicture,
        'profile',
      );

      const identityFilename =
        `${savedIdentity.key}${extname(idProof.originalname).toLowerCase()}`;

      const profileFilename =
        `${savedProfile.key}${extname(profilePicture.originalname).toLowerCase()}`;

      const result = await this.prisma.$transaction(async (tx) => {
        // Create the account with the technician role assigned by the server.
        const user = await tx.user.create({
          data: {
            name: `${firstName.trim()} ${lastName.trim()}`,
            phone: phone.trim(),
            email,
            passwordHash,
            roleId: technicianRole.id,
          },
        });

        // Create the technician profile.
        const technicianProfile = await tx.technicianProfile.create({
          data: {
            userId: user.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            ni_Number: niNumber.trim(),
            id_Proof: `identity/${identityFilename}`,
            id_proofKey: savedIdentity!.key,
            profilePic: `profiles/${profileFilename}`,
            profilePicKey: savedProfile!.key,
            bio: bio.trim(),
          },
        });

        // Create the technician's address.
        const address = await tx.address.create({
          data: {
            userId: user.id,
            technicianProfileId: technicianProfile.id,
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2?.trim() || null,
            city: city.trim(),
            postalCode: postcode.trim(),
            country: country.trim(),
            isDefault: true,
          },
        });

        // Associate the technician with the selected services.
        await tx.technicianService.createMany({
          data: serviceRecords.map((service) => ({
            technicianProfileId: technicianProfile.id,
            serviceId: service.id,
          })),
        });

        // Associate the technician with the selected service areas.
        await tx.technicianServiceArea.createMany({
          data: areaRecords.map((area) => ({
            technicianProfileId: technicianProfile.id,
            serviceAreaId: area.id,
          })),
        });

        // Save the selected working days and hours.
        await tx.technicianAvailability.createMany({
          data: availabilityRecords.map((availability) => ({
            technicianProfileId: technicianProfile.id,
            ...availability,
          })),
        });

        return { user, technicianProfile, address };
      });

      // 10. Generate the JWT.
      const accessToken = await this.jwtService.signAsync({
        sub: result.user.id,
        email: result.user.email,
        role: technicianRole.name,
      });

      // 11. Return safe account details.
      return {
        message: 'Technician registration successful. Your application is awaiting review.',
        accessToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: technicianRole.name,
        },
        technician: {
          id: result.technicianProfile.id,
          firstName: result.technicianProfile.firstName,
          lastName: result.technicianProfile.lastName,
          status: result.technicianProfile.status,
        },
        address: {
          id: result.address.id,
          addressLine1: result.address.addressLine1,
          addressLine2: result.address.addressLine2,
          city: result.address.city,
          postcode: result.address.postalCode,
          country: result.address.country,
        },
      };
    } catch (error) {
      // Remove files if registration fails.
      if (savedIdentity) {
        await this.uploadsService
          .deleteFile(savedIdentity.path)
          .catch(() => undefined);
      }

      if (savedProfile) {
        await this.uploadsService
          .deleteFile(savedProfile.path)
          .catch(() => undefined);
      }

      throw error;
    }
  }
  // LOGIN
  async login(loginDto: LoginDto) {
    const { password } = loginDto;
    const email = loginDto.email.trim().toLowerCase();

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

  // CHANGE PASSWORD (any logged-in user)
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Your session is no longer valid');
    }

    // Proves it's really the account owner, not someone at an unlocked screen.
    const currentMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new BadRequestException('Your current password is incorrect.');
    }

    if (await bcrypt.compare(dto.newPassword, user.passwordHash)) {
      throw new BadRequestException('Your new password must be different from your current one.');
    }

    // Admin accounts can see everyone's data, so they need longer passwords.
    const isAdmin = user.role.name === 'admin' || user.role.name === 'super_admin';
    if (isAdmin && dto.newPassword.length < 10) {
      throw new BadRequestException('Admin passwords must be at least 10 characters.');
    }

    const changedAt = new Date();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 12),
        passwordChangedAt: changedAt,
      },
    });

    await this.prisma.auditLog.create({
      data: { userId: user.id, action: 'auth.password_change', entity: 'User', entityId: user.id },
    });

    // Every older token is now rejected (see JwtStrategy), so hand back a
    // fresh one: this device stays signed in, all other devices are signed out.
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    return { message: 'Password changed successfully.', accessToken };
  }
}
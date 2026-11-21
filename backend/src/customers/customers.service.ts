import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import type { CreateAddressDto, UpdateAddressDto, UpdateMyProfileDto } from './dto/customers.dto.js';

const MAX_ADDRESSES = 10;

const addressSelect = {
  id: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  postalCode: true,
  country: true,
  isDefault: true,
} as const;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private async profileId(user: AuthenticatedUser) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) throw new ForbiddenException('Customer account required.');
    return profile.id;
  }

  /** Cities ValleyFix currently serves (lower-case), to flag addresses we can't reach. */
  private async coveredCities() {
    const areas = await this.prisma.serviceArea.findMany({
      where: { isActive: true },
      select: { city: true },
    });
    return new Set(areas.map((a) => a.city.toLowerCase()));
  }

  async me(user: AuthenticatedUser) {
    await this.profileId(user);
    const [account, covered] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          address: { select: addressSelect, orderBy: [{ isDefault: 'desc' }, { id: 'asc' }] },
        },
      }),
      this.coveredCities(),
    ]);

    const { address, ...rest } = account;
    return {
      ...rest,
      addresses: address.map((a) => ({ ...a, covered: covered.has(a.city.trim().toLowerCase()) })),
    };
  }

  async updateMe(user: AuthenticatedUser, dto: UpdateMyProfileDto) {
    await this.profileId(user);
    const data = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone || null }),
    };
    if (Object.keys(data).length === 0) throw new BadRequestException('Nothing to update.');

    await this.prisma.user.update({ where: { id: user.id }, data });
    return this.me(user);
  }

  async addAddress(user: AuthenticatedUser, dto: CreateAddressDto) {
    const customerProfileId = await this.profileId(user);
    const count = await this.prisma.address.count({ where: { userId: user.id } });
    if (count >= MAX_ADDRESSES) {
      throw new BadRequestException(`You can save up to ${MAX_ADDRESSES} addresses.`);
    }

    // The first address, or one marked as default, becomes the default.
    const makeDefault = dto.isDefault === true || count === 0;

    await this.prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      }
      await tx.address.create({
        data: {
          userId: user.id,
          customerProfileId,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2 || null,
          city: dto.city,
          postalCode: dto.postcode,
          country: dto.country,
          isDefault: makeDefault,
        },
      });
    });

    return this.me(user);
  }

  async updateAddress(user: AuthenticatedUser, id: number, dto: UpdateAddressDto) {
    await this.profileId(user);

    // Only the customer's OWN address ("not found" otherwise, so we don't
    // reveal that someone else's address id exists).
    const address = await this.prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!address) throw new NotFoundException('Address not found.');

    await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true) {
        await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      }
      await tx.address.update({
        where: { id },
        data: {
          ...(dto.addressLine1 !== undefined && { addressLine1: dto.addressLine1 }),
          ...(dto.addressLine2 !== undefined && { addressLine2: dto.addressLine2 || null }),
          ...(dto.city !== undefined && { city: dto.city }),
          ...(dto.postcode !== undefined && { postalCode: dto.postcode }),
          ...(dto.country !== undefined && { country: dto.country }),
          // You can pick a new default, but not leave the account with none.
          ...(dto.isDefault === true && { isDefault: true }),
        },
      });
    });

    return this.me(user);
  }
}

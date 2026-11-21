import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// GET /bookings/availability?serviceId=1&addressId=2&date=2026-11-24
export class AvailabilityQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  addressId: number;

  @Matches(DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;
}

// POST /bookings
export class CreateBookingDto {
  @IsInt()
  @Min(1)
  serviceId: number;

  @IsInt()
  @Min(1)
  addressId: number;

  @Matches(DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @Matches(TIME, { message: 'time must be in HH:mm format' })
  time: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(trim)
  description?: string;
}

// POST /bookings/:id/cancel
export class CancelBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(trim)
  reason?: string;
}

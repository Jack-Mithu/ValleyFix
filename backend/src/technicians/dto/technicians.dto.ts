import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// PATCH /technicians/me
// Name, email, services and areas are not editable here: they were checked by
// an admin when the technician was approved.
export class UpdateMyTechnicianDto {
  // Empty string clears the phone number.
  @IsOptional()
  @IsString()
  @Matches(/^(\+?[1-9]\d{7,14})?$/, { message: 'Please provide a valid phone number' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  bio?: string;
}

export class WorkingDayDto {
  @IsInt()
  @Min(0) // Sunday
  @Max(6) // Saturday
  dayOfWeek: number;

  @Matches(TIME, { message: 'startTime must be HH:mm' })
  startTime: string;

  @Matches(TIME, { message: 'endTime must be HH:mm' })
  endTime: string;
}

// PUT /technicians/me/availability (replaces the whole week)
export class SetAvailabilityDto {
  @IsArray()
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => WorkingDayDto)
  days: WorkingDayDto[];
}

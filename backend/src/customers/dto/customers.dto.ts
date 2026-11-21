import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const postcode = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

// PATCH /customers/me
// Email is deliberately NOT editable here: changing it safely needs a
// verification email, which ValleyFix doesn't send yet.
export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(trim)
  name?: string;

  // Empty string clears the phone number.
  @IsOptional()
  @IsString()
  @Matches(/^(\+?[1-9]\d{7,14})?$/, { message: 'Please provide a valid phone number' })
  @Transform(trim)
  phone?: string;
}

// POST /customers/me/addresses (same rules as registration)
export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Transform(trim)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  @Transform(trim)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Transform(trim)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Transform(postcode)
  postcode: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Transform(trim)
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// PATCH /customers/me/addresses/:id (only the fields sent are changed)
export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Transform(trim)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  @Transform(trim)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Transform(trim)
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Transform(postcode)
  postcode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Transform(trim)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

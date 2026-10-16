import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsBoolean,
} from 'class-validator';

export class RegisterDto {
  // Common user information

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 72)
  password: string;

  // Customer address information

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  postcode: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
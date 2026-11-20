import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class RegisterTechnicianDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 72)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  niNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  bio: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postcode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @IsJSON()
  services: string;

  @IsJSON()
  serviceAreas: string;

  @IsJSON()
  availability: string;
}
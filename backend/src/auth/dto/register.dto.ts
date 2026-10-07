import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';



export class RegisterDto {
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
}
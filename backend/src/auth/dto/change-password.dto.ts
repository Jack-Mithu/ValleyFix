import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 72)
  currentPassword: string;

  // bcrypt only uses the first 72 bytes, so longer passwords give a false
  // sense of security. Admins get a stricter minimum in AuthService.
  @IsString()
  @Length(8, 72, { message: 'Your new password must be between 8 and 72 characters' })
  newPassword: string;
}

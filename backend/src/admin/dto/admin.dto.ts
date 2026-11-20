import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Role } from '../../auth/roles.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// GET /admin/users?role=&search=&page=
export class ListUsersQueryDto {
  @IsOptional()
  @IsIn([Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN])
  role?: 'customer' | 'technician' | 'admin';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

// GET /admin/technicians?status=
export class ListTechniciansQueryDto {
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// PATCH /admin/users/:id  (only the fields that are sent are changed)
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(trim)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  // Empty string clears the phone number.
  @IsOptional()
  @IsString()
  @Matches(/^(\+?[1-9]\d{7,14})?$/, {
    message: 'Please provide a valid phone number',
  })
  @Transform(trim)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// POST /admin/admins
export class CreateSubAdminDto {
  @IsString()
  @Length(2, 100)
  @Transform(trim)
  name: string;

  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @IsString()
  @Length(10, 72, {
    message: 'Admin passwords must be between 10 and 72 characters',
  })
  password: string;
}

// POST /admin/technicians/:id/reject
export class RejectTechnicianDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(trim)
  reason: string;
}

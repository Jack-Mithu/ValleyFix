import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// GET /catalog/technicians?city=Cardiff&service=plumbing
export class TechniciansQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  city?: string;

  @IsOptional()
  @Matches(/^[a-z0-9-]{1,100}$/, { message: 'service must be a service slug' })
  service?: string;
}

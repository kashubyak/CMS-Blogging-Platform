import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'New User Name' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'newStrongPassword123' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.ADMIN,
    description: 'Update user role (USER or ADMIN)',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

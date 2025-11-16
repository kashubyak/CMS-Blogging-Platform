import { OmitType, PartialType } from '@nestjs/swagger';
import { SignUpDto } from 'src/api/auth/dto/request/sign-up.dto';

export class UpdateUserDto extends PartialType(
  OmitType(SignUpDto, ['email'] as const),
) {}

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH } from 'src/common/auth.constant';

@Injectable()
export class RefreshTokenGuard extends AuthGuard(JWT_REFRESH) {}

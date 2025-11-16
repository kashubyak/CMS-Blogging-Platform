import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT } from 'src/common/auth.constant';

@Injectable()
export class AccessTokenGuard extends AuthGuard(JWT) {}

import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { refreshTokenName } from 'src/common/auth.constant';
import { SignInDto } from './dto/request/sign-in.dto';
import { SignUpDto } from './dto/request/sign-up.dto';
import { SignInResponseDto } from './dto/response/sign-in-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { AuthRepository } from './repository/auth.repository';
import { JwtPayload } from './types/jwt-payload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async signUp(dto: SignUpDto): Promise<UserResponseDto> {
    const password = await bcrypt.hash(dto.password, 10);
    const newUser = await this.authRepository.create({
      email: dto.email,
      password,
      fullName: dto.fullName,
    });

    this.kafkaClient.emit('user.created', {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
    });
    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  }

  async signIn(dto: SignInDto, res: Response): Promise<SignInResponseDto> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordMatches = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatches)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    res.cookie(refreshTokenName, tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken: tokens.accessToken };
  }

  async logout(userId: number, res: Response) {
    await this.authRepository.clearRtHash(userId);
    res.clearCookie(refreshTokenName, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(
    userId: number,
    rtFromCookie: string,
    res: Response,
  ): Promise<SignInResponseDto> {
    const user = await this.authRepository.findById(userId);
    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const isRtMatches = await bcrypt.compare(
      rtFromCookie,
      user.hashedRefreshToken,
    );
    if (!isRtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    res.cookie(refreshTokenName, tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken: tokens.accessToken };
  }

  private async updateRtHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.authRepository.updateRtHash(userId, hash);
  }

  private async getTokens(
    userId: number,
    email: string,
    role: Role,
  ): Promise<Tokens> {
    const payload: JwtPayload = { sub: userId, email, role };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: parseInt(this.config.getOrThrow('JWT_ACCESS_EXPIRATION')),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: parseInt(this.config.getOrThrow('JWT_REFRESH_EXPIRATION')),
      }),
    ]);

    return { accessToken: at, refreshToken: rt };
  }
}

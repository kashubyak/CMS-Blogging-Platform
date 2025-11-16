import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUserPayload } from 'src/common/decorators/current-user-payload.decorator';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/request/sign-in.dto';
import { SignUpDto } from './dto/request/sign-up.dto';
import { SignInResponseDto } from './dto/response/sign-in-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('1. Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  signUp(@Body() dto: SignUpDto): Promise<UserResponseDto> {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description:
      'Returns Access Token. Refresh Token is set in httpOnly cookie.',
    type: SignInResponseDto,
  })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResponseDto> {
    return this.authService.signIn(dto, res);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out' })
  async logout(
    @CurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(userId, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: SignInResponseDto })
  async refreshTokens(
    @CurrentUserPayload()
    user: { sub: number; email: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResponseDto> {
    return this.authService.refreshTokens(user.sub, user.refreshToken, res);
  }
}

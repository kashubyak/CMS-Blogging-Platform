import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/request/sign-in.dto';
import { SignUpDto } from './dto/request/sign-up.dto';
import { SignInResponseDto } from './dto/response/sign-in-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';

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
}

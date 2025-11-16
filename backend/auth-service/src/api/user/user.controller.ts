import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { FilterUserDto } from './dto/request/filter-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { PaginatedUserResponseDto } from './dto/response/paginated-user-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Get all users with pagination' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: PaginatedUserResponseDto })
  getAllUsers(
    @Query() query: FilterUserDto,
  ): Promise<PaginatedUserResponseDto> {
    return this.userService.getAllUsers(query);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Get any user by ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.getUserById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserResponseDto })
  getMe(@CurrentUserId() userId: number): Promise<UserResponseDto> {
    return this.userService.getMe(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserResponseDto })
  updateMe(
    @CurrentUserId() userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateMe(userId, dto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User account deleted' })
  deleteMe(
    @CurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.deleteMe(userId, res);
  }
}

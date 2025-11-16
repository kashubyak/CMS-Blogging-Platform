import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcryptjs/umd/types';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getMe(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateMe(userId: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const dataToUpdate: Prisma.UserUpdateInput = {};
    if (dto.password)
      dataToUpdate.password = await bcrypt.hash(dto.password, 10);
    if (dto.fullName) dataToUpdate.fullName = dto.fullName;

    const updatedUser = await this.userRepository.updateUser(
      userId,
      dataToUpdate,
    );

    return this.buildUserResponse(updatedUser);
  }

  private buildUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

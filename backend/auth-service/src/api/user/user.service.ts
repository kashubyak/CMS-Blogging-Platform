import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { refreshTokenName } from 'src/common/auth.constant';
import { AdminUpdateUserDto } from './dto/request/admin-update-user.dto';
import { FilterUserDto } from './dto/request/filter-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { PaginatedUserResponseDto } from './dto/response/paginated-user-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async getMe(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.buildUserResponse(user);
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

    this.kafkaClient.emit('user.updated', {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
    });

    return this.buildUserResponse(updatedUser);
  }

  async deleteMe(userId: number, res: Response) {
    await this.userRepository.deleteUser(userId);

    res.clearCookie(refreshTokenName, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    this.kafkaClient.emit('user.deleted', {
      id: userId,
    });

    return { message: 'User account deleted successfully' };
  }

  async getAllUsers(query: FilterUserDto): Promise<PaginatedUserResponseDto> {
    const { page = 1, limit = 10, search, role } = query;

    const where: Prisma.UserWhereInput = {};
    const skip = (page - 1) * limit;

    if (role) where.role = role;

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const { data, total } = await this.userRepository.findAll({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const formattedData = data.map((user) => this.buildUserResponse(user));

    return {
      data: formattedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return this.buildUserResponse(user);
  }

  async updateUserById(
    userId: number,
    dto: AdminUpdateUserDto,
  ): Promise<UserResponseDto> {
    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (dto.password)
      dataToUpdate.password = await bcrypt.hash(dto.password, 10);
    if (dto.fullName) dataToUpdate.fullName = dto.fullName;
    if (dto.role) dataToUpdate.role = dto.role;

    const updatedUser = await this.userRepository.updateUser(
      userId,
      dataToUpdate,
    );

    this.kafkaClient.emit('user.updated.admin', {
      id: updatedUser.id,
      ...dataToUpdate,
    });

    return this.buildUserResponse(updatedUser);
  }

  async deleteUserById(userId: number) {
    await this.userRepository.deleteUser(userId);
    this.kafkaClient.emit('user.deleted.admin', {
      id: userId,
    });
    return { message: 'User deleted successfully by admin' };
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

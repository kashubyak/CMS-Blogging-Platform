import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRepository } from './repository/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, RolesGuard],
})
export class UserModule {}

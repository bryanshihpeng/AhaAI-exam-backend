import { EntityManager } from '@mikro-orm/postgresql';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../domain/user/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { JWTGuard } from '../auth/jwt.gurad';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private em: EntityManager) {}

  @UseGuards(JWTGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return user.toObject(['password', 'firebaseUid', 'id']);
  }
}

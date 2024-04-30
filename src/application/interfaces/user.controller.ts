import { EntityManager } from '@mikro-orm/postgresql';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JWTGuard } from '../auth/jwt.startegy';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private em: EntityManager) {}

  @UseGuards(JWTGuard)
  @Get('profile')
  async getProfile() {}
}

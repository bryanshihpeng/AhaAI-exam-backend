import { Module } from '@nestjs/common';
import { AccountController } from './application/interfaces/account.controller';
import { AccountService } from './application/services/account.service';
import { AuthService } from './application/services/auth.service';

@Module({
  imports: [],
  controllers: [AccountController],
  providers: [AccountService, AuthService],
})
export class AppModule {}

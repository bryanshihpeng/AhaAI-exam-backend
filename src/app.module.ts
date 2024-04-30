import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AccountController } from './application/interfaces/account.controller';
import { AuthService } from './application/services/auth.service';
import { dbConfig } from './infrastructure/orm/mikro-orm.config';

@Module({
  imports: [MikroOrmModule.forRoot(dbConfig)],
  controllers: [AccountController],
  providers: [AuthService],
})
export class AppModule {}

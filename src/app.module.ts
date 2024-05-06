import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthService } from './application/auth/auth.service';
import { UserSessionService } from './application/user/user-session.service';
import { EmailService } from './infrastructure/email.service';
import { dbConfig } from './infrastructure/orm/mikro-orm.config';
import { AuthController } from './interface/auth.controller';
import { UserController } from './interface/user.controller';

@Module({
  imports: [
    MikroOrmModule.forRoot(dbConfig),
    JwtModule.register({
      global: true,
      secret: 'jwtConstants.secret',
    }),
    // In memory cache, can be replaced with Redis
    CacheModule.register(),
    // For cron jobs
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [UserController, AuthController],
  providers: [AuthService, UserSessionService, EmailService],
})
export class AppModule {}

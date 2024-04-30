import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './application/interfaces/auth.controller';
import { UserController } from './application/interfaces/user.controller';
import { AuthService } from './application/services/auth.service';
import { dbConfig } from './infrastructure/orm/mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(dbConfig),
    JwtModule.register({
      global: true,
      secret: 'jwtConstants.secret',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [AuthService],
})
export class AppModule {}

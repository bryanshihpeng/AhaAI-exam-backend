import { EntityManager } from '@mikro-orm/postgresql';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/user/user.entity';

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract JWT from cookies
    const jwt = request.cookies ? request.cookies['jwt'] : null;
    if (!jwt) {
      console.log('No JWT provided');
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(jwt);
      request.user = await this.em.findOneOrFail(User, payload.id);
      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }
}

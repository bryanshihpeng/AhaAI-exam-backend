import { EntityManager } from '@mikro-orm/postgresql';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/user/user.entity';
import { UserActivityHappenedEvent } from '../user/user-activity.event';

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private em: EntityManager,
    private eventEmitter: EventEmitter2,
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
      const user = await this.em.findOneOrFail(User, payload.id);
      request.user = user;

      const event = new UserActivityHappenedEvent(user.id, new Date());
      this.eventEmitter.emit('user.activity.happened', event);
      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }
}

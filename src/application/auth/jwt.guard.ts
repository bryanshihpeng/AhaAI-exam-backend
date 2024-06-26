import { EntityManager } from '@mikro-orm/postgresql';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/user/user.entity';
import { UserActivityHappenedEvent } from '../user/user-activity.event';

@Injectable()
export class JwtGuard implements CanActivate {
  logger = new Logger(JwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private em: EntityManager,
    private eventEmitter: EventEmitter2,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const jwt = this.extractJwt(request);
    if (!jwt) throw new UnauthorizedException();

    try {
      const payload = this.jwtService.verify(jwt);
      const user = await this.em.findOneOrFail(User, payload.id);
      request.user = user;

      const event = new UserActivityHappenedEvent(user.id, new Date());
      this.eventEmitter.emit('user.activity.happened', event);

      return true;
    } catch (e) {
      this.logger.log(e);
      throw new UnauthorizedException();
    }
  }

  extractJwt(request: any): string | null {
    // Extract JWT from cookies
    const jwt = request.cookies ? request.cookies['jwt'] : null;
    if (jwt) return jwt;

    // Or extract JWT from Authorization header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

import { EntityManager } from '@mikro-orm/postgresql';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { User } from '../../domain/user/user.entity';
import {
  UserActivityHappenedEvent,
  UserLoggedInEvent,
} from './user-activity.event';

@Injectable()
export class UserSessionService {
  // 10 minutes
  private expiredSessionTime = 1000 * 60 * 10;

  constructor(
    private em: EntityManager,
    // In memory cache, can be replaced with Redis
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 10 minutes cron job
  @Cron('0 */10 * * * *')
  async checkCachedSessions() {
    const keys = await this.cacheManager.store.keys();
    for (const userId of keys) {
      console.log(`Checking user ${userId}`);

      const user = await this.em.findOne(User, userId);
      if (!user) {
        console.log(`User ${userId} not found`);
        continue;
      }

      const lastSession = await this.cacheManager.get<Date>(userId);
      if (!lastSession) {
        console.log(`User ${userId} last session not found`);
        continue;
      }

      const isExpired =
        new Date().getTime() - lastSession.getTime() > this.expiredSessionTime;
      if (!isExpired) continue;

      console.log(`User ${userId} last session expired, persisting...`);
      await this.persistUserSessionTime(user, lastSession);
      await this.cacheManager.del(userId);
      console.log(`User ${userId} last session persisted`);
    }
  }

  @OnEvent('user.activity.happened', { async: true })
  async onUserActivityHappened(event: UserActivityHappenedEvent) {
    console.log(`User ${event.userId} activity happened`);
    const user = await this.em.findOne(User, event.userId);
    if (user) {
      await this.cacheLastSessionTime(user, event.activityTime);
    } else {
      console.log(`User with id ${event.userId} not found`);
    }
  }

  @OnEvent('user.logged.in', { async: true })
  async onUserLoggedIn(event: UserLoggedInEvent) {
    console.log(`User ${event.userId} logged in`);
    const user = await this.em.findOne(User, event.userId);
    if (!user) {
      console.log(`User with id ${event.userId} not found`);
      return;
    }

    user.loginCount += 1;
    await this.em.persistAndFlush(user);
  }

  private async persistUserSessionTime(user: User, lastSession: Date) {
    user.lastSessionAt = lastSession;
    await this.em.persistAndFlush(user);
  }

  private async cacheLastSessionTime(user: User, lastSession: Date) {
    const cacheKey = `${user.id}`;
    await this.cacheManager.set(cacheKey, lastSession);
  }
}

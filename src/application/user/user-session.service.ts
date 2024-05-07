import { EntityManager } from '@mikro-orm/postgresql';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { User } from '../../domain/user/user.entity';
import { UserActivityHappenedEvent } from './user-activity.event';
import { UserLoggedInEvent } from './user-loged-in.event';

@Injectable()
export class UserSessionService {
  // This timeout threshold helps in reducing the frequency of database writes by batching session updates.
  private expiredSessionTime = 1000 * 60 * 10;
  private logger = new Logger(UserSessionService.name);

  constructor(
    private em: EntityManager,
    // In memory cache, can be replaced with Redis
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Every 10 minutes
  @Cron('0 */10 * * * *')
  async checkCachedSessions() {
    // Periodically checks and cleans up expired sessions to manage server memory and reduce database load.
    const userIds = await this.cacheManager.store.keys();
    for (const userId of userIds) {
      this.logger.log(`Checking user ${userId}`);

      const user = await this.em.findOne(User, userId);
      if (!user) {
        this.logger.warn(`User ${userId} not found`);
        continue;
      }

      const lastSession = await this.cacheManager.get<Date>(userId);
      if (!lastSession) {
        this.logger.warn(`User ${userId} last session not found`);
        continue;
      }

      if (!this.isSessionExpired(lastSession)) continue;

      // Persisting session data only when necessary minimizes database access, enhancing performance.
      this.logger.log(`User ${userId} last session expired, persisting...`);
      await this.persistUserSessionTime(user, lastSession);
      await this.cacheManager.del(userId);
      this.logger.log(`User ${userId} last session persisted`);
    }
  }

  @OnEvent('user.activity.happened', { async: true })
  async onUserActivityHappened(event: UserActivityHappenedEvent) {
    // Caching session times reduces the need for immediate database writes, optimizing resource usage.
    this.logger.log(`User ${event.userId} activity happened`);
    await this.cacheLastSessionTime(event.userId, event.activityTime);
  }

  @OnEvent('user.logged.in', { async: true })
  async onUserLoggedIn(event: UserLoggedInEvent) {
    // Incrementing login count directly in the database helps in maintaining accurate user metrics.
    this.logger.log(`User ${event.userId} logged in`);
    const user = await this.em.findOne(User, event.userId);
    if (!user) {
      this.logger.log(`User with id ${event.userId} not found`);
      return;
    }

    user.loginCount += 1;
    await this.em.persistAndFlush(user);
  }

  private async persistUserSessionTime(user: User, lastSession: Date) {
    // Direct database updates for session times ensure data integrity and user traceability.
    user.lastSessionAt = lastSession;
    await this.em.persistAndFlush(user);
  }

  private async cacheLastSessionTime(userId: string, lastSession: Date) {
    // Using caching for session management reduces database queries, improving response times.
    const cacheKey = userId;
    const existingSession = await this.cacheManager.get<Date>(cacheKey);
    await this.cacheManager.set(cacheKey, lastSession);

    // Persisting session data at the first activity ensures session tracking even if the server restarts or crashes.
    if (!existingSession) {
      const user = await this.em.findOne(User, userId);
      if (!user) {
        this.logger.warn(`User ${userId} not found`);
        return;
      }
      await this.persistUserSessionTime(user, lastSession);
    }
  }

  private isSessionExpired(lastSession: Date): boolean {
    // Efficient session expiration checking to trigger necessary actions without excessive resource use.
    return (
      new Date().getTime() - lastSession.getTime() > this.expiredSessionTime
    );
  }
}

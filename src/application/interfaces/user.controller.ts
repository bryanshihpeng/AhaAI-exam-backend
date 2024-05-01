import { EntityManager } from '@mikro-orm/postgresql';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../../domain/user/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { JWTGuard } from '../auth/jwt.guard';
import { UserDashboardResponse } from './dto/user-dashboard.response';
import { UserStatisticsResponse } from './dto/user-statistics.response';

// Annotations:
//
//   CQRS Model and Read-Only Operations:
//   This code example demonstrates how to provide read-only operations for the User module, which aligns with the CQRS (Command Query Responsibility Separation) model. This model separates command operations (such as modifying or inserting) from query operations to enhance maintainability and performance.
//   In this example, we implement the read-only operations as a set of simple queries (getProfile, getAllUsers, and getUserStatistics) directly in the Controller rather than abstracting them into the service layer.
//   Why Read-Only Operations Can Be in the Controller:
//   Read-only operations can often be directly implemented in the Controller because they tend to be relatively simple and self-contained.
//   By implementing these queries directly in the Controller, we avoid over-engineering and simplify the code structure.
//   If future read-only operations become more complex or need to be reused, we can consider abstracting them into the service layer.
//   Conclusion:
// When implementing read-only operations, consider the CQRS model, separating them from command operations.
//   For simple read-only operations, they can be directly implemented in the Controller to avoid over-engineering.
//   Only consider abstracting them into the service layer when further optimization and reuse are needed.

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private em: EntityManager) {}

  @UseGuards(JWTGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return user.toObject(['password']);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get a list of all users with their sign-up and session info',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: UserDashboardResponse,
    isArray: true,
  })
  async getAllUsers(): Promise<UserDashboardResponse[]> {
    const users = await this.em.find(User, {});
    return users.map((user) => ({
      id: user.id,
      signUpAt: user.signUpAt,
      loginCount: user.loginCount,
      lastSessionAt: user.lastSessionAt,
    }));
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get statistics of user sign-ups and sessions' })
  @ApiResponse({
    status: 200,
    description: 'Statistics of users',
    type: UserStatisticsResponse,
  })
  async getUserStatistics(): Promise<UserStatisticsResponse> {
    const totalUsers = await this.em.count(User);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await this.em.count(User, {
      lastSessionAt: { $gte: today },
    });

    const lastSevenDays = new Date(today);
    lastSevenDays.setDate(today.getDate() - 7);

    const activeLastSevenDays = await this.em.find(User, {
      lastSessionAt: { $gte: lastSevenDays },
    });
    const averageActive = activeLastSevenDays.length / 7;

    return {
      totalUsers,
      activeToday,
      averageActive,
    };
  }
}

import { EntityManager } from '@mikro-orm/postgresql';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../../domain/user/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { JWTGuard } from '../auth/jwt.guard';
import { ResetPasswordRequest } from './dto/reset-password.request';
import { UpdateUserProfileRequest } from './dto/update-user-profile.request';
import { UserDashboardResponse } from './dto/user-dashboard.response';
import { UserProfileResponse } from './dto/user-profile.response';
import { UserStatisticsResponse } from './dto/user-statistics.response';

@ApiTags('User')
@UseGuards(JWTGuard)
@Controller('user')
export class UserController {
  constructor(private em: EntityManager) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile data',
    type: UserProfileResponse,
  })
  async getUserProfile(@CurrentUser() user: User) {
    return user.toObject(['password']);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
  })
  async updateUserProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateUserProfileRequest,
  ) {
    // Can only update name
    user.name = body.name;
    await this.em.persistAndFlush(user);
  }

  @Patch('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Password reset failed',
  })
  async resetPassword(
    @CurrentUser() user: User,
    @Body() body: ResetPasswordRequest,
  ) {
    user.resetPassword(body.oldPassword, body.newPassword);
    await this.em.persistAndFlush(user);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get a list of all users with their sign-up and session info',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    isArray: true,
    type: UserDashboardResponse,
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
      averageActive: Number(averageActive.toFixed(2)),
    };
  }
}

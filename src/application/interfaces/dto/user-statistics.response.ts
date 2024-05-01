import { ApiProperty } from '@nestjs/swagger';

export class UserStatisticsResponse {
  @ApiProperty({ example: 100 })
  totalUsers: number;

  @ApiProperty({ example: 10 })
  activeToday: number;

  @ApiProperty({ example: 7 })
  averageActive: number;
}

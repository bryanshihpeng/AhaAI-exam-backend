import { ApiProperty } from '@nestjs/swagger';

export class UserStatisticsResponse {
  @ApiProperty({
    example: 100,
    description: 'The total number of users registered in the system',
  })
  totalUsers: number;

  @ApiProperty({
    example: 10,
    description: 'The number of users who have been active today',
  })
  activeToday: number;

  @ApiProperty({
    example: 7,
    description: 'The average number of users active per day',
  })
  averageActive: number;
}

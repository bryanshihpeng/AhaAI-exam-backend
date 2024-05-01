import { ApiProperty } from '@nestjs/swagger';

export class UserDashboardResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  signUpAt: Date;

  @ApiProperty({ example: 5 })
  loginCount: number;

  @ApiProperty({ example: '2023-01-02T12:34:56.000Z' })
  lastSessionAt: Date;
}

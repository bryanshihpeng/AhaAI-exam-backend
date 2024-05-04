import { ApiProperty } from '@nestjs/swagger';

export class UserDashboardResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time when the user registered or signed up',
  })
  signUpAt: Date;

  @ApiProperty({
    example: 5,
    description:
      'The total number of times the user has logged into the system',
  })
  loginCount: number;

  @ApiProperty({
    example: '2023-01-02T12:34:56.000Z',
    description: "The date and time of the user's last session in the system",
    nullable: true,
  })
  lastSessionAt: Date | null;
}

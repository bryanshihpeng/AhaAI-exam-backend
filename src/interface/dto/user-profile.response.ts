import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/user/user.entity';

export class UserProfileResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user',
  })
  readonly id: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time when the user signed up',
  })
  readonly signUpAt: Date;

  @ApiProperty({
    example: 5,
    description: 'The number of times the user has logged in',
  })
  readonly loginCount: number;

  @ApiProperty({
    example: '2023-01-02T12:34:56.000Z',
    description: "The date and time of the user's last session",
    nullable: true,
  })
  readonly lastSessionAt: Date | null;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  readonly email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  readonly name: string;

  @ApiProperty({
    example: 'firebase-uid-example',
    description: 'The unique Firebase UID for the user',
  })
  readonly firebaseUid: string;

  @ApiProperty({
    example: false,
    description: "Indicates if the user's email is verified",
  })
  readonly emailVerified: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.signUpAt = user.signUpAt;
    this.loginCount = user.loginCount;
    this.lastSessionAt = user.lastSessionAt;
    this.email = user.email;
    this.name = user.name;
    this.firebaseUid = user.firebaseUid;
    this.emailVerified = user.emailVerified;
  }
}

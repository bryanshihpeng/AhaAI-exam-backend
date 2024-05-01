import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../domain/user/user.entity';

export class UserProfileResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  signUpAt: Date;

  @ApiProperty({ example: 5 })
  loginCount: number;

  @ApiProperty({ example: '2023-01-02T12:34:56.000Z' })
  lastSessionAt: Date;

  @ApiProperty({ example: '' })
  email: string;

  @ApiProperty({ example: '' })
  name: string;

  @ApiProperty({ example: '' })
  firebaseUid: string;

  @ApiProperty({ example: false })
  emailVerified: boolean;

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

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';
import { User } from '../../domain/user/user.entity';

export class ResetPasswordRequest {
  @ApiProperty({
    example: 'OldPassword@123',
    description: 'The current password of the user',
    type: 'string',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'The new password for the account',
    type: 'string',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(User.passWordRules, {
    message:
      'Password must include at least one lower case letter, one upper case letter, one digit, and one special character.',
  })
  newPassword: string;
}

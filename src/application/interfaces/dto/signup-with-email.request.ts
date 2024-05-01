import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { User } from '../../../domain/user/user.entity';

export class SignupWithEmailRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
    type: 'string',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'The password for the account, must meet complexity requirements',
    type: 'string',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(User.passWordRules, {
    message:
      'Password must include at least one lower case letter, one upper case letter, one digit, and one special character.',
  })
  password: string;
}

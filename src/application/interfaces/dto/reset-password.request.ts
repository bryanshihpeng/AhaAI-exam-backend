import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordRequest {
  @ApiProperty({
    example: 'OldPassword@123',
    description: 'The current password of the user',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'The new password for the account',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'Re-enter the new password for confirmation',
  })
  @IsString()
  @MinLength(8)
  confirmNewPassword: string;
}

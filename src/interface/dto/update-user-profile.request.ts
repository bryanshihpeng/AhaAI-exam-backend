import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserProfileRequest {
  @ApiProperty({
    example: 'John Doe',
    description: 'The new name of the user',
    type: 'string',
  })
  @IsString()
  name: string;
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SignupWithEmailRequest } from './dto/signup-with-email.request';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiBody({ type: SignupWithEmailRequest })
  @ApiOperation({ summary: 'Register a new account with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful, verification email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, account with this email already exists',
  })
  async signUpWithEmail(@Body() body: SignupWithEmailRequest) {
    return this.authService.signUp(body.email, body.password);
  }
}

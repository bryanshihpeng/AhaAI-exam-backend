import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth/auth.service';
import { CurrentUser } from '../application/auth/current-user.decorator';
import { JwtGuard } from '../application/auth/jwt.guard';
import { User } from '../domain/user/user.entity';
import { SignupWithEmailRequest } from './dto/signup-with-email.request';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
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
    const user = await this.authService.signUpWithEmail(
      body.email,
      body.password,
    );
    return { jwt: this.authService.generateJwt(user) };
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Sign in successful, JWT provided',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, invalid credentials',
  })
  async signInWithEmail(@Body() body: SignupWithEmailRequest) {
    return { jwt: await this.authService.signIn(body.email, body.password) };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email and sign in' })
  @ApiResponse({
    status: 201,
    description: 'Email verified and sign in successful, JWT provided',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, invalid or expired token',
  })
  async verifyEmailAndSignIn(@Body() body: { token: string }) {
    return { jwt: await this.authService.verifyEmail(body.token) };
  }

  @Post('firebase')
  @ApiOperation({ summary: 'Sign in with Firebase token' })
  @ApiResponse({
    status: 200,
    description: 'Sign in successful, JWT provided',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, invalid Firebase token',
  })
  async signInWithFirebase(@Body() body: { token: string }) {
    return { jwt: await this.authService.signInWithFirebase(body.token) };
  }

  @UseGuards(JwtGuard)
  @Post('send-verification-email')
  @ApiOperation({ summary: 'Send verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
  })
  async sendVerificationEmail(@CurrentUser() user: User) {
    return this.authService.sendVerificationEmail(user);
  }
}

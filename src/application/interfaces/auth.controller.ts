import { EntityManager } from '@mikro-orm/postgresql';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as process from 'process';
import { User } from '../../domain/user/user.entity';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JWTGuard } from '../auth/jwt.guard';
import { SignupWithEmailRequest } from './dto/signup-with-email.request';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private em: EntityManager,
  ) {}

  @Post('signup')
  @ApiBody({ type: SignupWithEmailRequest })
  @ApiOperation({ summary: 'Register a new account with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful, verification email sent',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, account with this email already exists',
  })
  async signUpWithEmail(@Body() body: SignupWithEmailRequest) {
    return this.authService.signUpWithEmail(body.email, body.password);
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
  async signInWithEmail(
    @Body() body: SignupWithEmailRequest,
    @Res() response: Response,
  ) {
    const jwt = await this.authService.signIn(body.email, body.password);
    this.respondJwt(jwt, response);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email and sign in' })
  @ApiResponse({
    status: 200,
    description: 'Email verified and sign in successful, JWT provided',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, invalid or expired token',
  })
  async verifyEmailAndSignIn(
    @Body() body: { token: string },
    @Res() response: Response,
  ) {
    const jwt = await this.authService.verifyEmail(body.token);
    this.respondJwt(jwt, response);
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
  async signInWithFirebase(
    @Body() body: { token: string },
    @Res() response: Response,
  ) {
    const jwt = await this.authService.signInWithFirebase(body.token);
    this.respondJwt(jwt, response);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  logout(@Res() response: Response) {
    response.clearCookie('jwt');
    response.status(HttpStatus.OK).json({});
  }

  respondJwt(jwt: string, response: Response) {
    response.cookie('jwt', jwt, {
      httpOnly: true,
      secure: true,
      domain: process.env.COOKIE_DOMAIN,
    });
    response.status(HttpStatus.OK).json({});
  }

  @UseGuards(JWTGuard)
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

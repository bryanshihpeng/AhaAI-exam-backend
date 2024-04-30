import { EntityManager } from '@mikro-orm/postgresql';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { SignupWithEmailRequest } from './dto/signup-with-email.request';

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
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, account with this email already exists',
  })
  async signUpWithEmail(@Body() body: SignupWithEmailRequest) {
    return this.authService.signUp(body.email, body.password);
  }

  @Post('signin')
  async signInWithEmail(
    @Body() body: SignupWithEmailRequest,
    @Res() response: Response,
  ) {
    const jwt = await this.authService.signIn(body.email, body.password);
    this.respondJwt(jwt, response);
  }

  @Post('verify-email')
  async verifyEmailAndSignIn(@Body() token: string, @Res() response: Response) {
    const jwt = await this.authService.verifyEmail(token);
    this.respondJwt(jwt, response);
  }

  @Post('firebase')
  async signInWithFirebase(@Body() token: string, @Res() response: Response) {
    const jwt = await this.authService.signInWithFirebase(token);
    this.respondJwt(jwt, response);
  }

  @Post('logout')
  logout(@Res() response: Response) {
    response.clearCookie('jwt');
    response.status(HttpStatus.OK).json({});
  }

  respondJwt(jwt: string, response: Response) {
    response.cookie('jwt', jwt, { httpOnly: true });
    response.status(HttpStatus.OK).json({});
  }
}

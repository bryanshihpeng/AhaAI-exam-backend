import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as process from 'process';
import { User } from '../../domain/user/user.entity';
import { EmailService } from '../../infrastructure/email.service';
import { UserLoggedInEvent } from '../user/user-loged-in.event';

@Injectable()
export class AuthService {
  constructor(
    private em: EntityManager,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private emailService: EmailService,
  ) {}

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const existingAccount = await this.em.findOne(User, { email });
    if (existingAccount) {
      throw new BadRequestException('Account with this email already exists');
    }

    const newAccount = User.createWithEmailAndPassword(email, password);

    await this.em.persistAndFlush(newAccount);

    await this.sendVerificationEmail(newAccount);
    return newAccount;
  }

  async signIn(email: string, password: string): Promise<string> {
    const account = await this.em.findOne(User, { email });
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    account.verifyPassword(password);
    this.eventEmitter.emit('user.logged.in', new UserLoggedInEvent(account.id));
    return this.generateJwt(account);
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const emailContent = `<a href="${this.generateVerificationUrl(user)}">Verify Email</a>`;
    await this.emailService.sendEmail(
      user.email,
      'Please verify your email address',
      emailContent,
    );
  }

  async verifyEmail(token: string) {
    const { id } = this.verifyJwt(token);
    const account = await this.em.findOne(User, { id });
    if (!account) {
      throw new BadRequestException('Invalid token');
    }
    if (account.emailVerified) {
      throw new BadRequestException('Email already verified');
    }
    account.emailVerified = true;
    await this.em.persistAndFlush(account);

    return this.generateJwt(account);
  }

  verifyJwt(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  generateJwt(account: User): string {
    return this.jwtService.sign({ id: account.id });
  }

  async signInWithFirebase(idToken: string): Promise<string> {
    const payload = await this.validateFirebaseIdToken(idToken);
    const account = await this.em.findOne(User, {
      firebaseUid: payload.firebaseUid,
    });
    if (account) {
      return this.generateJwt(account);
    }

    // Check if the email is already registered
    const existingAccount = await this.em.findOne(User, {
      email: payload.email,
    });
    // Assuming that we trust google to verify the email
    if (existingAccount) {
      existingAccount.firebaseUid = payload.firebaseUid;
      existingAccount.emailVerified = true;
      await this.em.persistAndFlush(existingAccount);
      return this.generateJwt(existingAccount);
    }

    // Create a new account
    const newAccount = new User();
    newAccount.firebaseUid = payload.firebaseUid;
    newAccount.name = payload.displayName;
    newAccount.email = payload.email;
    newAccount.emailVerified = true;
    await this.em.persistAndFlush(newAccount);
    return this.generateJwt(newAccount);
  }

  async validateFirebaseIdToken(idToken: string) {
    const decodedToken = jwt.decode(idToken, { complete: true });
    if (
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      !decodedToken.header
    ) {
      throw new BadRequestException('Invalid token');
    }
    const { kid, alg } = decodedToken.header;
    if (alg !== 'RS256') {
      throw new BadRequestException('Invalid token algorithm');
    }
    const keysUrl =
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
    const response = await axios.get(keysUrl);
    const publicKey = response.data[kid];
    if (!publicKey) {
      throw new BadRequestException('Invalid key ID');
    }
    try {
      const jwtPayload = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
      });
      if (!jwtPayload['sub'] || typeof jwtPayload['sub'] !== 'string') {
        throw new BadRequestException('Invalid token subject');
      }
      return {
        firebaseUid: jwtPayload['sub'],
        displayName: jwtPayload['name'] || '',
        email: jwtPayload['email'] || '',
      };
    } catch (error) {
      throw new BadRequestException('Invalid token signature');
    }
  }

  private generateVerificationUrl(user: User): string {
    const emailVerificationToken = this.generateJwt(user);
    return `${process.env.FRONTEND_URL}/sign-in?emailToken=${emailVerificationToken}`;
  }
}

import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as SgMail from '@sendgrid/mail';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { Account } from '../../domain/account/account.entity';

@Injectable()
export class AuthService {
  constructor(
    private em: EntityManager,
    private jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string): Promise<Account> {
    const existingAccount = await this.em.find(Account, { email });
    if (existingAccount) {
      throw new BadRequestException('Account with this email already exists');
    }

    const newAccount = Account.createWithEmailAndPassword(email, password);

    await this.em.persistAndFlush(newAccount);

    await this.sendVerificationEmail(newAccount);
    return newAccount;
  }

  async signIn(email: string, password: string): Promise<string> {
    const account = await this.em.findOne(Account, { email });
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    if (!account.verifyPassword(password)) {
      throw new BadRequestException('Invalid password');
    }
    return this.generateJwt(account);
  }

  async sendVerificationEmail(account: Account): Promise<void> {
    const emailVerificationToken = this.jwtService.sign(
      {
        id: account.id,
      },
      // expire the token in 15 minutes
      // { expiresIn: '15m' },
    );
    SgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: account.email,
      from: 'bryanshihpeng@gmail.com',
      subject: 'Please verify your email address',
      text: 'Please verify your email address',
      html: `<a href="http://localhost:3000/verify-email/${emailVerificationToken}">Verify Email</a>`,
    };
    await SgMail.send(msg);
  }

  async verifyEmail(token: string) {
    const { id } = this.jwtService.verify(token);
    if (!id) {
      throw new BadRequestException('Invalid token');
    }
    const account = await this.em.findOne(Account, { id });
    if (!account) {
      throw new BadRequestException('Invalid token');
    }
    account.emailVerified = true;
    await this.em.persistAndFlush(account);

    return this.generateJwt(account);
  }

  generateJwt(account: Account): string {
    return this.jwtService.sign({ id: account.id });
  }

  async resetPassword(
    email: string,
    password: string,
    newPassword: string,
  ): Promise<void> {
    const account = await this.em.findOne(Account, { email });
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    account.resetPassword(password, newPassword);
    await this.em.persistAndFlush(account);
  }

  async signInWithFirebase(idToken: string): Promise<string> {
    const firebaseUid = await this.validateFirebaseIdToken(idToken);
    const account = await this.em.findOne(Account, { firebaseUid });
    if (account) {
      return this.generateJwt(account);
    }
  }

  async signUpWithFirebase(idToken: string): Promise<string> {
    const firebaseUid = await this.validateFirebaseIdToken(idToken);
    const account = await this.em.findOne(Account, { firebaseUid });
    if (account) {
      return this.jwtService.sign({ id: account.id });
    }
    const newAccount = new Account();
    newAccount.firebaseUid = firebaseUid;
    await this.em.persistAndFlush(newAccount);
    return this.generateJwt(newAccount);
  }

  async validateFirebaseIdToken(idToken: string): Promise<string> {
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
      const { sub } = jwt.verify(idToken, publicKey, { algorithms: ['RS256'] });
      if (!sub || typeof sub !== 'string') {
        throw new BadRequestException('Invalid token subject');
      }
      return sub;
    } catch (error) {
      throw new BadRequestException('Invalid token signature');
    }
  }
}

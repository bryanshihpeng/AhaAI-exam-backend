import {
  BaseEntity,
  Entity,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';

@Entity()
export class User extends BaseEntity {
  static passWordRules =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  @PrimaryKey()
  id = v4();

  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  signUpAt = new Date();

  @Property({ type: 'number', default: 0 })
  loginCount = 0;

  // Index for counting active users
  @Index()
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  lastSessionAt?: Date;

  @Index()
  @Property({ unique: true, nullable: true })
  email: string;

  @Property()
  name = '';

  @Index()
  @Property({ unique: true, nullable: true })
  firebaseUid?: string;

  @Property({ nullable: true })
  emailVerified?: boolean;

  @Property({ nullable: true })
  private password?: string;

  static createWithEmailAndPassword(email: string, password: string): User {
    if (!email) throw new BadRequestException('Email is required');
    if (!password) throw new BadRequestException('Password is required');
    const user = new User();
    user.email = email;
    user.emailVerified = false;
    user.setPassword(password);
    return user;
  }

  resetPassword(password: string, newPassword: string): void {
    if (password == newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }
    if (!this.validatePassword(newPassword)) {
      throw new BadRequestException(
        'New password does not meet complexity requirements',
      );
    }
    this.verifyPassword(password);
    this.setPassword(newPassword);
  }

  setPassword(password: string): void {
    if (!this.validatePassword(password)) {
      throw new BadRequestException(
        'Password does not meet complexity requirements',
      );
    }

    this.password = this.hashPassword(password);
  }

  verifyPassword(password: string) {
    if (!this.password) {
      throw new BadRequestException('Account does not have a password');
    }
    const isVerified = bcrypt.compareSync(password, this.password);
    if (!isVerified) {
      throw new BadRequestException('Invalid password');
    }
    return true;
  }

  validatePassword(password: string): boolean {
    return User.passWordRules.test(password);
  }

  private hashPassword(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }
}

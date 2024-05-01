import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
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
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  lastSessionAt?: Date;
  @Property({ unique: true, nullable: true })
  email: string;
  @Property()
  name = '';
  @Property({ nullable: true })
  firebaseUid?: string;
  @Property({ nullable: true })
  emailVerified?: boolean;
  @Property({ nullable: true })
  password?: string;

  static createWithEmailAndPassword(email: string, password: string): User {
    if (!email || !password) throw new Error('Email and password are required');
    const user = new User();
    user.email = email;
    user.emailVerified = false;
    user.setPassword(password);
    return user;
  }

  resetPassword(password: string, newPassword: string): void {
    if (!this.password) {
      throw new BadRequestException('Account does not have a password');
    }
    if (this.password !== password) {
      throw new BadRequestException('Invalid password');
    }
    this.setPassword(newPassword);
  }

  setPassword(password: string): void {
    if (!this.validatePassword(password)) {
      throw new BadRequestException(
        'Password does not meet complexity requirements',
      );
    }
    this.password = password;
  }

  verifyPassword(password: string): boolean {
    return this.password === password;
  }

  validatePassword(password: string): boolean {
    return User.passWordRules.test(password);
  }
}

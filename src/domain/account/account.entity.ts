import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';

@Entity()
export class Account extends BaseEntity {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ unique: true, nullable: true })
  email: string;

  @Property()
  displayName = '';

  @Property({ nullable: true })
  firebaseUid?: string;

  @Property({ nullable: true })
  emailVerified?: boolean;

  @Property({ nullable: true })
  password?: string;

  static createWithEmailAndPassword(email: string, password: string): Account {
    if (!email || !password) throw new Error('Email and password are required');
    const account = new Account();
    account.email = email;
    account.emailVerified = false;
    account.setPassword(password);
    return account;
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
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }
}

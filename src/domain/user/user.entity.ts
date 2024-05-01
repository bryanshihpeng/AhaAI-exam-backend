import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
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
  private password?: string;

  static createWithEmailAndPassword(email: string, password: string): User {
    if (!email || !password) throw new Error('Email and password are required');
    const user = new User();
    user.email = email;
    user.emailVerified = false;
    user.setPassword(password);
    return user;
  }

  resetPassword(password: string, newPassword: string): void {
    this.validatePassword(newPassword);
    this.verifyPassword(password);
    this.setPassword(newPassword);
  }

  setPassword(password: string): void {
    this.validatePassword(password);
    this.password = this.hashPassword(password);
  }

  hashPassword(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }

  private verifyPassword(password: string): boolean {
    if (!this.password) {
      throw new BadRequestException('Account does not have a password');
    }
    return this.password == this.hashPassword(password);
  }

  private validatePassword(password: string): boolean {
    return User.passWordRules.test(password);
  }
}

import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Account } from '../../domain/account/account.entity';

@Injectable()
export class AuthService {
  constructor(private em: EntityManager) {}

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

  async sendVerificationEmail(account: Account): Promise<void> {
    // Implement email sending logic
  }
}

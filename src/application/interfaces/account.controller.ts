import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AccountService } from '../services/account.service';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
}

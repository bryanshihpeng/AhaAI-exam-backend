import { EntityManager } from '@mikro-orm/postgresql';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private em: EntityManager) {}
}

import { Migration } from '@mikro-orm/migrations';

export class Migration20240501034301_user_statistics extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "user" add column "sign_up_at" timestamptz not null default now(), add column "login_count" int not null default 0, add column "last_session_at" timestamptz not null default now();',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user" drop column "sign_up_at", drop column "login_count", drop column "last_session_at";',
    );
  }
}

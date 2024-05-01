import { Migration } from '@mikro-orm/migrations';

export class Migration20240501024315 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "user" ("id" varchar(255) not null, "email" varchar(255) null, "name" varchar(255) not null default \'\', "firebase_uid" varchar(255) null, "email_verified" boolean null, "password" varchar(255) null, constraint "user_pkey" primary key ("id"));',
    );
    this.addSql(
      'alter table "user" add constraint "user_email_unique" unique ("email");',
    );
  }
}

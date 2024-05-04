import { Migration } from '@mikro-orm/migrations';

export class Migration20240503045752_user extends Migration {
  async up(): Promise<void> {
    this.addSql('create index "user_email_index" on "user" ("email");');
    this.addSql(
      'create index "user_firebase_uid_index" on "user" ("firebase_uid");',
    );
    this.addSql(
      'alter table "user" add constraint "user_firebase_uid_unique" unique ("firebase_uid");',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop index "user_email_index";');
    this.addSql('drop index "user_firebase_uid_index";');
    this.addSql(
      'alter table "user" drop constraint "user_firebase_uid_unique";',
    );
  }
}

import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as dotenv from 'dotenv';
import { Account } from '../../domain/account/account.entity';

dotenv.config();

export const dbConfig: Options = {
  entities: [Account],
  dbName: 'dev',
  driver: PostgreSqlDriver,
  migrations: {
    path: './src/infrastructure/orm/migrations', // 路徑到你的遷移目錄
  },
  extensions: [Migrator],
};
export default defineConfig(dbConfig);

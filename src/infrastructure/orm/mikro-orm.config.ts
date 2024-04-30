import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as dotenv from 'dotenv';
import { User } from '../../domain/user/user.entity';

dotenv.config();

export const dbConfig: Options = {
  entities: [User],
  driver: PostgreSqlDriver,
  dbName: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  driverOptions: {
    connection: { ssl: process.env.DB_USE_SSL === 'true' },
  },
  migrations: {
    path: './src/infrastructure/orm/migrations', // 路徑到你的遷移目錄
  },
  extensions: [Migrator],
};
export default defineConfig(dbConfig);

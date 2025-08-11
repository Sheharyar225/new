import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { User } from '../auth/entities/user.entity';
import { ShortUrl } from '../urls/url.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  username: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'url_shortener',
  entities: [User, ShortUrl],
  synchronize: true, // DEV only. Use migrations in production.
  logging: false,
};

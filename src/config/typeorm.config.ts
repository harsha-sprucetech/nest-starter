import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NumberEntity } from '../entities/number.entity';

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '../../.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '12345678',
  database: process.env.POSTGRES_DB || 'testing',
  entities: [NumberEntity],
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  synchronize: true,
}); 
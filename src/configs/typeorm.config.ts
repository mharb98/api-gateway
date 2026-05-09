import 'reflect-metadata';
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'api_gateway',
  synchronize: false,
  logging: isProduction ? false : ['query', 'error'],
  entities: isProduction
    ? ['dist/data-access/entities/**/*.js']
    : ['src/data-access/entities/**/*.ts'],
  migrations: isProduction
    ? ['dist/database/migrations/**/*.js']
    : ['database/migrations/**/*.ts'],
  subscribers: isProduction
    ? ['dist/data-access/subscribers/**/*.js']
    : ['src/data-access/subscribers/**/*.ts'],
};

export const typeOrmConfig: TypeOrmModuleOptions = baseConfig;

export const AppDataSource = new DataSource(baseConfig);

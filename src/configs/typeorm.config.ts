import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Environment } from '../environment';

const isProduction = Environment.NODE_ENV === 'production';

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: Environment.DB_HOST,
  port: parseInt(Environment.DB_PORT, 10),
  username: Environment.DB_USERNAME,
  password: Environment.DB_PASSWORD,
  database: Environment.DB_NAME,
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

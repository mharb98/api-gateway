import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Environment } from '../environment';
import { Service } from '../data-access/entities/service.entity';
import { ServiceInstance } from '../data-access/entities/service-instance.entity';
import { Route } from '../data-access/entities/route.entity';

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
  entities: [Service, ServiceInstance, Route],
  migrations: isProduction
    ? ['dist/database/migrations/**/*.js']
    : ['database/migrations/**/*.ts'],
  subscribers: isProduction
    ? ['dist/data-access/subscribers/**/*.js']
    : ['src/data-access/subscribers/**/*.ts'],
};

// NestJS app: never auto-loads or runs migrations at startup
export const typeOrmConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  migrations: [],
};

// TypeORM CLI (migration:generate / migration:run): needs glob to find migration files
export const AppDataSource = new DataSource(baseConfig);

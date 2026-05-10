import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { clsConfig } from './configs/cls.config';
import { typeOrmConfig } from './configs/typeorm.config';
import { DataAccessModule } from './data-access/data-access.module';
import { RedisModule } from './redis/redis.module';
import { RoutingModule } from './routing/routing.module';

@Module({
  imports: [
    ClsModule.forRoot(clsConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    DataAccessModule,
    RedisModule,
    RoutingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceInstance } from './entities/service-instance.entity';
import { Route } from './entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceInstance, Route])],
  exports: [TypeOrmModule],
})
export class DataAccessModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceInstance } from './entities/service-instance.entity';
import { Route } from './entities/route.entity';
import { TransactionModule } from './transaction/transaction.module';
import { ServicesRepository } from './repositories/services.repository';
import { ServiceInstancesRepository } from './repositories/service-instances.repository';
import { RoutesRepository } from './repositories/routes.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceInstance, Route]),
    TransactionModule,
  ],
  providers: [ServicesRepository, ServiceInstancesRepository, RoutesRepository],
  exports: [ServicesRepository, ServiceInstancesRepository, RoutesRepository],
})
export class DataAccessModule {}

import { Module } from '@nestjs/common';
import { DataAccessModule } from '../../../data-access/data-access.module';
import { RoutingModule } from '../../../routing/routing.module';
import { ServiceInstancesService } from './service-instances.service';
import { ServiceInstancesController } from './v1/service-instances.controller';

@Module({
  imports: [DataAccessModule, RoutingModule],
  providers: [ServiceInstancesService],
  controllers: [ServiceInstancesController],
})
export class ServiceInstancesModule {}

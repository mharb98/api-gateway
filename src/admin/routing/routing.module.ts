import { Module } from '@nestjs/common';
import { RoutesModule } from './routes/routes.module';
import { ServiceInstancesModule } from './service-instances/service-instances.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [RoutesModule, ServicesModule, ServiceInstancesModule],
})
export class AdminRoutingModule {}

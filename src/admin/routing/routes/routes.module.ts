import { Module } from '@nestjs/common';
import { DataAccessModule } from '../../../data-access/data-access.module';
import { RoutingModule } from '../../../routing/routing.module';
import { RoutesService } from './routes.service';
import { RoutesController } from './v1/routes.controller';

@Module({
  imports: [DataAccessModule, RoutingModule],
  providers: [RoutesService],
  controllers: [RoutesController],
})
export class RoutesModule {}

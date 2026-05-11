import { Module } from '@nestjs/common';
import { AdminRoutingModule } from './routing/routing.module';

@Module({
  imports: [AdminRoutingModule],
})
export class AdminModule {}

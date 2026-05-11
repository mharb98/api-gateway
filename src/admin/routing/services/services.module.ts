import { Module } from '@nestjs/common';
import { DataAccessModule } from '../../../data-access/data-access.module';
import { ServicesService } from './services.service';
import { ServicesController } from './v1/services.controller';

@Module({
  imports: [DataAccessModule],
  providers: [ServicesService],
  controllers: [ServicesController],
})
export class ServicesModule {}

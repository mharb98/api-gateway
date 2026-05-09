import { Module } from '@nestjs/common';
import { TransactionBootstrapService } from './transaction-bootstrap.service';

@Module({
  providers: [TransactionBootstrapService],
  exports: [],
})
export class TransactionModule {}

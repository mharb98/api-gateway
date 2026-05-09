import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import { initializeClsService } from './cls-accessor';
import { initializeDataSource } from './datasource-accessor';

@Injectable()
export class TransactionBootstrapService {
  constructor(
    cls: ClsService,
    @InjectDataSource() dataSource: DataSource,
  ) {
    initializeClsService(cls);
    initializeDataSource(dataSource);
  }
}

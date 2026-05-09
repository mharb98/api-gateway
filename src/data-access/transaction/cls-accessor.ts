import { ClsService } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TRANSACTION_MANAGER_KEY } from './transaction.constants';

let _cls: ClsService | undefined;

export function initializeClsService(cls: ClsService): void {
  _cls = cls;
}

export function getTransactionManager(): EntityManager | undefined {
  return _cls?.get<EntityManager | undefined>(TRANSACTION_MANAGER_KEY);
}

export function setTransactionManager(manager: EntityManager | undefined): void {
  _cls?.set(TRANSACTION_MANAGER_KEY, manager);
}

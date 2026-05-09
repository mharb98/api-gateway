import { getDataSource } from '../../data-access/transaction/datasource-accessor';
import {
  getTransactionManager,
  setTransactionManager,
} from '../../data-access/transaction/cls-accessor';

export const TransactionIsolationLevel = {
  READ_UNCOMMITTED: 'READ UNCOMMITTED',
  READ_COMMITTED: 'READ COMMITTED',
  REPEATABLE_READ: 'REPEATABLE READ',
  SERIALIZABLE: 'SERIALIZABLE',
} as const;

export type TransactionIsolationLevel =
  (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

export function Transactional(
  isolationLevel?: TransactionIsolationLevel,
): MethodDecorator {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const original = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (
      this: object,
      ...args: unknown[]
    ): Promise<unknown> {
      // REQUIRED semantics — reuse existing transaction if active
      if (getTransactionManager()) {
        return original.apply(this, args);
      }

      const queryRunner = getDataSource().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction(isolationLevel);
      setTransactionManager(queryRunner.manager);

      try {
        const result = await original.apply(this, args);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
        setTransactionManager(undefined);
      }
    };

    return descriptor;
  };
}

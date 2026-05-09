import { DataSource, EntityManager } from 'typeorm';

type IsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE';

export enum TransactionIsolationLevel {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

/**
 * Wraps the decorated method in a TypeORM transaction.
 *
 * The class using this decorator MUST inject DataSource:
 *   @InjectDataSource() private readonly dataSource: DataSource
 *
 * The transactional EntityManager is injected as the last argument.
 * Declare it as an optional last parameter to support nested reuse:
 *   async createUser(dto: CreateUserDto, manager?: EntityManager): Promise<User>
 *
 * When calling a @Transactional method from another @Transactional method,
 * pass the manager explicitly to reuse the outer transaction (avoids deadlocks).
 */
export function Transactional(
  isolationLevel?: TransactionIsolationLevel,
): MethodDecorator {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = async function (
      this: { dataSource: DataSource },
      ...args: unknown[]
    ): Promise<unknown> {
      const lastArg = args[args.length - 1];
      if (lastArg instanceof EntityManager) {
        return originalMethod.apply(this, args);
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction(isolationLevel);

      try {
        const result = await originalMethod.apply(this, [
          ...args,
          queryRunner.manager,
        ]);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    };

    return descriptor;
  };
}

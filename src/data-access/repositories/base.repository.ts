import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { getTransactionManager } from '../transaction/cls-accessor';
import { getDataSource } from '../transaction/datasource-accessor';

export function BaseRepository<TEntity extends ObjectLiteral>(
  entity: EntityTarget<TEntity>,
) {
  abstract class BaseRepositoryHost {
    public getRepository(): Repository<TEntity> {
      const transactionalManager = getTransactionManager();
      return (transactionalManager ?? getDataSource().manager).getRepository(entity);
    }
  }

  return BaseRepositoryHost;
}

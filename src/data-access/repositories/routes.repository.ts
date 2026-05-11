import { Injectable } from '@nestjs/common';
import { Route, HttpMethod } from '../entities/route.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class RoutesRepository extends BaseRepository(Route) {
  async findByUid(uid: string): Promise<Route | null> {
    return this.getRepository().findOneBy({ uid });
  }

  async findEnabledByServiceId(serviceId: number): Promise<Route[]> {
    return this.getRepository().findBy({ serviceId, isEnabled: true });
  }

  async findByPriority(): Promise<Route[]> {
    return this.getRepository().find({ order: { priority: 'DESC' } });
  }

  async findEnabledWithActiveInstances(): Promise<Route[]> {
    return this.getRepository()
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.service', 'service')
      .leftJoinAndSelect(
        'service.instances',
        'instance',
        'instance.isHealthy = :healthy',
        { healthy: true },
      )
      .where('route.isEnabled = :enabled', { enabled: true })
      .orderBy('route.priority', 'DESC')
      .getMany();
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    serviceId?: number;
    method?: HttpMethod | null;
    isEnabled?: boolean;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<[Route[], number]> {
    const { page, limit, serviceId, method, isEnabled, sortBy = 'priority', order = 'DESC' } =
      options;

    const qb = this.getRepository()
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.service', 'service');

    if (serviceId !== undefined) {
      qb.andWhere('route.serviceId = :serviceId', { serviceId });
    }
    if (method !== undefined) {
      if (method === null) {
        qb.andWhere('route.method IS NULL');
      } else {
        qb.andWhere('route.method = :method', { method });
      }
    }
    if (isEnabled !== undefined) {
      qb.andWhere('route.isEnabled = :isEnabled', { isEnabled });
    }

    const allowed = ['priority', 'createdAt', 'pathPattern'];
    const col = allowed.includes(sortBy) ? sortBy : 'priority';
    qb.orderBy(`route.${col}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }
}

import { Injectable } from '@nestjs/common';
import { Route } from '../entities/route.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class RoutesRepository extends BaseRepository(Route) {
  async findEnabledByServiceId(serviceId: string): Promise<Route[]> {
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
}

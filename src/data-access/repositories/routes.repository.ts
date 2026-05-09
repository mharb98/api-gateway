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
}

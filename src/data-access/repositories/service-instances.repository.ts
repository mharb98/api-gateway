import { Injectable } from '@nestjs/common';
import { ServiceInstance } from '../entities/service-instance.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ServiceInstancesRepository extends BaseRepository(ServiceInstance) {
  async findHealthyByServiceId(serviceId: string): Promise<ServiceInstance[]> {
    return this.getRepository().findBy({ serviceId, isHealthy: true });
  }
}

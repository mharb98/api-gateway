import { Injectable } from '@nestjs/common';
import { ServiceInstance } from '../entities/service-instance.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ServiceInstancesRepository extends BaseRepository(ServiceInstance) {
  async findByUid(uid: string): Promise<ServiceInstance | null> {
    return this.getRepository().findOneBy({ uid });
  }

  async findHealthyByServiceId(serviceId: number): Promise<ServiceInstance[]> {
    return this.getRepository().findBy({ serviceId, isHealthy: true });
  }

  async findByServiceId(serviceId: number): Promise<ServiceInstance[]> {
    return this.getRepository().findBy({ serviceId });
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    serviceId?: number;
    isHealthy?: boolean;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<[ServiceInstance[], number]> {
    const { page, limit, serviceId, isHealthy, sortBy = 'createdAt', order = 'DESC' } = options;

    const qb = this.getRepository()
      .createQueryBuilder('instance')
      .leftJoinAndSelect('instance.service', 'service');

    if (serviceId !== undefined) {
      qb.andWhere('instance.serviceId = :serviceId', { serviceId });
    }
    if (isHealthy !== undefined) {
      qb.andWhere('instance.isHealthy = :isHealthy', { isHealthy });
    }

    const allowed = ['port', 'createdAt', 'weight'];
    const col = allowed.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`instance.${col}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }
}

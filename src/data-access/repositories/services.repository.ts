import { Injectable } from '@nestjs/common';
import { Service, ServiceProtocol } from '../entities/service.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ServicesRepository extends BaseRepository(Service) {
  async findByUid(uid: string): Promise<Service | null> {
    return this.getRepository().findOneBy({ uid });
  }

  async findByName(name: string): Promise<Service | null> {
    return this.getRepository().findOneBy({ name });
  }

  async findAll(): Promise<Service[]> {
    return this.getRepository().find();
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    protocol?: ServiceProtocol;
    search?: string;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<[Service[], number]> {
    const { page, limit, protocol, search, sortBy = 'createdAt', order = 'DESC' } = options;

    const qb = this.getRepository().createQueryBuilder('service');

    if (protocol) {
      qb.andWhere('service.protocol = :protocol', { protocol });
    }
    if (search) {
      qb.andWhere('service.name ILIKE :search', { search: `%${search}%` });
    }

    const allowed = ['name', 'createdAt', 'protocol'];
    const col = allowed.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`service.${col}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }
}

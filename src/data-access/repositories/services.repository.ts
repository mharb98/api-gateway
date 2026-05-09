import { Injectable } from '@nestjs/common';
import { Service } from '../entities/service.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ServicesRepository extends BaseRepository(Service) {
  async findByName(name: string): Promise<Service | null> {
    return this.getRepository().findOneBy({ name });
  }

  async findAll(): Promise<Service[]> {
    return this.getRepository().find();
  }
}

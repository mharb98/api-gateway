import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '../../../common/database/transactional';
import { Service } from '../../../data-access/entities/service.entity';
import { ServicesRepository } from '../../../data-access/repositories/services.repository';
import { CreateServiceRequestDto } from './v1/dto/request/create-service.request.dto';
import { ListServicesRequestDto } from './v1/dto/request/list-services.request.dto';
import { UpdateServiceRequestDto } from './v1/dto/request/update-service.request.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async create(dto: CreateServiceRequestDto): Promise<Service> {
    await this.assertUniqueName(dto.name);
    return this.persistCreate(dto);
  }

  async update(uid: string, dto: UpdateServiceRequestDto): Promise<Service> {
    const service = await this.findByUid(uid);
    if (dto.name && dto.name !== service.name) {
      await this.assertUniqueName(dto.name);
    }
    return this.persistUpdate(service, dto);
  }

  async delete(uid: string): Promise<void> {
    const service = await this.findByUid(uid);
    await this.persistDelete(service);
  }

  async findByUid(uid: string): Promise<Service> {
    const service = await this.servicesRepository.findByUid(uid);
    if (!service) throw new NotFoundException(`Service "${uid}" not found`);
    return service;
  }

  async list(query: ListServicesRequestDto): Promise<[Service[], number]> {
    return this.servicesRepository.findPaginated(query);
  }

  @Transactional()
  private async persistCreate(dto: CreateServiceRequestDto): Promise<Service> {
    const repo = this.servicesRepository.getRepository();
    return repo.save(repo.create({ ...dto }));
  }

  @Transactional()
  private async persistUpdate(service: Service, dto: UpdateServiceRequestDto): Promise<Service> {
    return this.servicesRepository.getRepository().save({ ...service, ...dto });
  }

  @Transactional()
  private async persistDelete(service: Service): Promise<void> {
    await this.servicesRepository.getRepository().remove(service);
  }

  private async assertUniqueName(name: string): Promise<void> {
    const existing = await this.servicesRepository.findByName(name);
    if (existing) throw new ConflictException(`Service with name "${name}" already exists`);
  }
}

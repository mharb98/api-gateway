import { Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '../../../common/database/transactional';
import { Service } from '../../../data-access/entities/service.entity';
import { ServiceInstance } from '../../../data-access/entities/service-instance.entity';
import { ServiceInstancesRepository } from '../../../data-access/repositories/service-instances.repository';
import { ServicesRepository } from '../../../data-access/repositories/services.repository';
import { RouteLoaderService } from '../../../routing/services/route-loader.service';
import { CreateServiceInstanceRequestDto } from './v1/dto/request/create-service-instance.request.dto';
import { ListServiceInstancesRequestDto } from './v1/dto/request/list-service-instances.request.dto';
import { UpdateServiceInstanceRequestDto } from './v1/dto/request/update-service-instance.request.dto';

@Injectable()
export class ServiceInstancesService {
  constructor(
    private readonly instancesRepository: ServiceInstancesRepository,
    private readonly servicesRepository: ServicesRepository,
    private readonly routeLoaderService: RouteLoaderService,
  ) {}

  async create(dto: CreateServiceInstanceRequestDto): Promise<ServiceInstance> {
    const service = await this.resolveService(dto.serviceUid);
    const instance = await this.persistCreate(dto, service.id);
    if (instance.isHealthy) await this.routeLoaderService.reload();
    return this.loadWithService(instance.uid);
  }

  async update(uid: string, dto: UpdateServiceInstanceRequestDto): Promise<ServiceInstance> {
    const instance = await this.loadWithService(uid);
    let serviceId = instance.serviceId;
    if (dto.serviceUid !== undefined) {
      const service = await this.resolveService(dto.serviceUid);
      serviceId = service.id;
    }
    const { serviceUid: _serviceUid, ...rest } = dto;
    await this.persistUpdate(instance, { ...rest, serviceId });
    await this.routeLoaderService.reload();
    return this.loadWithService(uid);
  }

  async delete(uid: string): Promise<void> {
    const instance = await this.findByUid(uid);
    await this.persistDelete(instance);
    await this.routeLoaderService.reload();
  }

  async findByUid(uid: string): Promise<ServiceInstance> {
    return this.loadWithService(uid);
  }

  async list(query: ListServiceInstancesRequestDto): Promise<[ServiceInstance[], number]> {
    let serviceId: number | undefined;
    if (query.serviceUid) {
      const service = await this.resolveService(query.serviceUid);
      serviceId = service.id;
    }
    return this.instancesRepository.findPaginated({ ...query, serviceId });
  }

  @Transactional()
  private async persistCreate(
    dto: CreateServiceInstanceRequestDto,
    serviceId: number,
  ): Promise<ServiceInstance> {
    const repo = this.instancesRepository.getRepository();
    const { serviceUid: _serviceUid, ...rest } = dto;
    return repo.save(repo.create({ ...rest, serviceId }));
  }

  @Transactional()
  private async persistUpdate(
    instance: ServiceInstance,
    data: Partial<ServiceInstance>,
  ): Promise<ServiceInstance> {
    return this.instancesRepository.getRepository().save({ ...instance, ...data });
  }

  @Transactional()
  private async persistDelete(instance: ServiceInstance): Promise<void> {
    await this.instancesRepository.getRepository().remove(instance);
  }

  private async loadWithService(uid: string): Promise<ServiceInstance> {
    const instance = await this.instancesRepository.getRepository().findOne({
      where: { uid },
      relations: { service: true },
    });
    if (!instance) throw new NotFoundException(`ServiceInstance "${uid}" not found`);
    return instance;
  }

  private async resolveService(serviceUid: string): Promise<Service> {
    const service = await this.servicesRepository.findByUid(serviceUid);
    if (!service) throw new NotFoundException(`Service "${serviceUid}" not found`);
    return service;
  }
}

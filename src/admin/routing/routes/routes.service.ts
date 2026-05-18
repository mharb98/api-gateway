import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '../../../common/database/transactional';
import { Route } from '../../../data-access/entities/route.entity';
import { Service } from '../../../data-access/entities/service.entity';
import { RoutesRepository } from '../../../data-access/repositories/routes.repository';
import { ServicesRepository } from '../../../data-access/repositories/services.repository';
import { RouteLoaderService } from '../../../routing/services/route-loader.service';
import { CreateRouteRequestDto } from './v1/dto/request/create-route.request.dto';
import { ListRoutesRequestDto } from './v1/dto/request/list-routes.request.dto';
import { UpdateRouteRequestDto } from './v1/dto/request/update-route.request.dto';

@Injectable()
export class RoutesService {
  constructor(
    private readonly routesRepository: RoutesRepository,
    private readonly servicesRepository: ServicesRepository,
    private readonly routeLoaderService: RouteLoaderService,
  ) {}

  async create(dto: CreateRouteRequestDto): Promise<Route> {
    const service = await this.resolveService(dto.serviceUid);

    this.assertValidPathPattern(dto.pathPattern);
    
    const route = await this.persistCreate(dto, service.id);
    
    await this.routeLoaderService.reload();
    
    return this.loadWithService(route.uid);
  }

  async update(uid: string, dto: UpdateRouteRequestDto): Promise<Route> {
    const route = await this.loadWithService(uid);

    let serviceId = route.serviceId;
    
    if (dto.serviceUid !== undefined) {
      const service = await this.resolveService(dto.serviceUid);
      
      serviceId = service.id;
    }
    
    if (dto.pathPattern !== undefined) {
      this.assertValidPathPattern(dto.pathPattern);
    }
    
    const { serviceUid: _serviceUid, ...rest } = dto;
    
    await this.persistUpdate(route, { ...rest, serviceId });
    
    await this.routeLoaderService.reload();
    
    return this.loadWithService(uid);
  }

  async delete(uid: string): Promise<void> {
    const route = await this.findByUid(uid);
 
    await this.persistDelete(route);
 
    await this.routeLoaderService.reload();
  }

  async findByUid(uid: string): Promise<Route> {
    return this.loadWithService(uid);
  }

  async list(query: ListRoutesRequestDto): Promise<[Route[], number]> {
    let serviceId: number | undefined;
   
    if (query.serviceUid) {
      const service = await this.resolveService(query.serviceUid);
   
      serviceId = service.id;
    }
   
    return this.routesRepository.findPaginated({ ...query, serviceId });
  }

  @Transactional()
  private async persistCreate(dto: CreateRouteRequestDto, serviceId: number): Promise<Route> {
    const repo = this.routesRepository.getRepository();
  
    const { serviceUid: _serviceUid, ...rest } = dto;
  
    return repo.save(repo.create({ ...rest, serviceId }));
  }

  @Transactional()
  private async persistUpdate(route: Route, data: Partial<Route>): Promise<Route> {
    return this.routesRepository.getRepository().save({ ...route, ...data });
  }

  @Transactional()
  private async persistDelete(route: Route): Promise<void> {
    await this.routesRepository.getRepository().remove(route);
  }

  private async loadWithService(uid: string): Promise<Route> {
    const route = await this.routesRepository.getRepository().findOne({
      where: { uid },
      relations: { service: true },
    });
  
    if (!route) throw new NotFoundException(`Route "${uid}" not found`);
  
    return route;
  }

  private async resolveService(serviceUid: string): Promise<Service> {
    const service = await this.servicesRepository.findByUid(serviceUid);
    
    if (!service) throw new NotFoundException(`Service "${serviceUid}" not found`);
    
    return service;
  }

  private assertValidPathPattern(pattern: string): void {
    if (!pattern.includes('*')) return;
    
    if (!pattern.endsWith('/*') || pattern.indexOf('*') !== pattern.lastIndexOf('*')) {
      throw new BadRequestException(
        'Wildcard (*) must be the terminal segment of the path, e.g. "/prefix/*"',
      );
    }
  }
}

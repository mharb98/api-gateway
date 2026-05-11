import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceInstancesService } from '../service-instances.service';
import { CreateServiceInstanceRequestDto } from './dto/request/create-service-instance.request.dto';
import { ListServiceInstancesRequestDto } from './dto/request/list-service-instances.request.dto';
import { UpdateServiceInstanceRequestDto } from './dto/request/update-service-instance.request.dto';
import { ListServiceInstancesResponseDto } from './dto/response/list-service-instances.response.dto';
import { ServiceInstanceResponseDto } from './dto/response/service-instance.response.dto';

@ApiTags('Admin - Service Instances')
@Controller('admin/v1/service-instances')
export class ServiceInstancesController {
  constructor(private readonly serviceInstancesService: ServiceInstancesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a service instance',
    description:
      'Adds an upstream instance to a service. If healthy, reloads the routing cache.',
  })
  @ApiCreatedResponse({ type: ServiceInstanceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiNotFoundResponse({ description: 'Referenced service not found' })
  async create(
    @Body() dto: CreateServiceInstanceRequestDto,
  ): Promise<ServiceInstanceResponseDto> {
    const instance = await this.serviceInstancesService.create(dto);
    return ServiceInstanceResponseDto.from(instance);
  }

  @Get()
  @ApiOperation({
    summary: 'List service instances',
    description: 'Returns a paginated list of instances with optional filters.',
  })
  @ApiOkResponse({ type: ListServiceInstancesResponseDto })
  async list(
    @Query() query: ListServiceInstancesRequestDto,
  ): Promise<ListServiceInstancesResponseDto> {
    const [instances, total] = await this.serviceInstancesService.list(query);
    return ListServiceInstancesResponseDto.from(instances, total, query.page, query.limit);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a service instance by UID' })
  @ApiOkResponse({ type: ServiceInstanceResponseDto })
  @ApiNotFoundResponse({ description: 'ServiceInstance not found' })
  async findByUid(@Param('uid', ParseUUIDPipe) uid: string): Promise<ServiceInstanceResponseDto> {
    const instance = await this.serviceInstancesService.findByUid(uid);
    return ServiceInstanceResponseDto.from(instance);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Update a service instance',
    description: 'Partially updates an instance and reloads the routing cache.',
  })
  @ApiOkResponse({ type: ServiceInstanceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiNotFoundResponse({ description: 'ServiceInstance or referenced service not found' })
  async update(
    @Param('uid', ParseUUIDPipe) uid: string,
    @Body() dto: UpdateServiceInstanceRequestDto,
  ): Promise<ServiceInstanceResponseDto> {
    const instance = await this.serviceInstancesService.update(uid, dto);
    return ServiceInstanceResponseDto.from(instance);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a service instance',
    description: 'Deletes the instance and reloads the routing cache.',
  })
  @ApiNoContentResponse({ description: 'ServiceInstance deleted successfully' })
  @ApiNotFoundResponse({ description: 'ServiceInstance not found' })
  async delete(@Param('uid', ParseUUIDPipe) uid: string): Promise<void> {
    await this.serviceInstancesService.delete(uid);
  }
}

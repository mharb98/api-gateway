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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ServicesService } from '../services.service';
import { CreateServiceRequestDto } from './dto/request/create-service.request.dto';
import { ListServicesRequestDto } from './dto/request/list-services.request.dto';
import { UpdateServiceRequestDto } from './dto/request/update-service.request.dto';
import { ListServicesResponseDto } from './dto/response/list-services.response.dto';
import { ServiceResponseDto } from './dto/response/service.response.dto';

@ApiTags('Admin - Services')
@Controller('admin/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a service',
    description: 'Registers a new upstream service. Name must be unique.',
  })
  @ApiCreatedResponse({ type: ServiceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiConflictResponse({ description: 'Service name already exists' })
  async create(@Body() dto: CreateServiceRequestDto): Promise<ServiceResponseDto> {
    const service = await this.servicesService.create(dto);
    return ServiceResponseDto.from(service);
  }

  @Get()
  @ApiOperation({ summary: 'List services', description: 'Returns a paginated list of services with optional filters.' })
  @ApiOkResponse({ type: ListServicesResponseDto })
  async list(@Query() query: ListServicesRequestDto): Promise<ListServicesResponseDto> {
    const [services, total] = await this.servicesService.list(query);
    return ListServicesResponseDto.from(services, total, query.page, query.limit);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a service by UID' })
  @ApiOkResponse({ type: ServiceResponseDto })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async findByUid(@Param('uid', ParseUUIDPipe) uid: string): Promise<ServiceResponseDto> {
    const service = await this.servicesService.findByUid(uid);
    return ServiceResponseDto.from(service);
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Update a service' })
  @ApiOkResponse({ type: ServiceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiConflictResponse({ description: 'Service name already taken' })
  async update(
    @Param('uid', ParseUUIDPipe) uid: string,
    @Body() dto: UpdateServiceRequestDto,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesService.update(uid, dto);
    return ServiceResponseDto.from(service);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a service',
    description: 'Removes a service and all its routes and instances (cascade).',
  })
  @ApiNoContentResponse({ description: 'Service deleted successfully' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async delete(@Param('uid', ParseUUIDPipe) uid: string): Promise<void> {
    await this.servicesService.delete(uid);
  }
}

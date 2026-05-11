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
import { RoutesService } from '../routes.service';
import { CreateRouteRequestDto } from './dto/request/create-route.request.dto';
import { ListRoutesRequestDto } from './dto/request/list-routes.request.dto';
import { UpdateRouteRequestDto } from './dto/request/update-route.request.dto';
import { ListRoutesResponseDto } from './dto/response/list-routes.response.dto';
import { RouteResponseDto } from './dto/response/route.response.dto';

@ApiTags('Admin - Routes')
@Controller('admin/v1/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a route',
    description:
      'Registers a new route and immediately reloads the in-memory routing table.',
  })
  @ApiCreatedResponse({ type: RouteResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid path pattern or request body' })
  @ApiNotFoundResponse({ description: 'Referenced service not found' })
  async create(@Body() dto: CreateRouteRequestDto): Promise<RouteResponseDto> {
    const route = await this.routesService.create(dto);
    return RouteResponseDto.from(route);
  }

  @Get()
  @ApiOperation({ summary: 'List routes', description: 'Returns a paginated list of routes with optional filters.' })
  @ApiOkResponse({ type: ListRoutesResponseDto })
  async list(@Query() query: ListRoutesRequestDto): Promise<ListRoutesResponseDto> {
    const [routes, total] = await this.routesService.list(query);
    return ListRoutesResponseDto.from(routes, total, query.page, query.limit);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a route by UID' })
  @ApiOkResponse({ type: RouteResponseDto })
  @ApiNotFoundResponse({ description: 'Route not found' })
  async findByUid(@Param('uid', ParseUUIDPipe) uid: string): Promise<RouteResponseDto> {
    const route = await this.routesService.findByUid(uid);
    return RouteResponseDto.from(route);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Update a route',
    description: 'Partially updates a route and reloads the routing table.',
  })
  @ApiOkResponse({ type: RouteResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid path pattern or request body' })
  @ApiNotFoundResponse({ description: 'Route or referenced service not found' })
  async update(
    @Param('uid', ParseUUIDPipe) uid: string,
    @Body() dto: UpdateRouteRequestDto,
  ): Promise<RouteResponseDto> {
    const route = await this.routesService.update(uid, dto);
    return RouteResponseDto.from(route);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a route',
    description: 'Removes a route and reloads the routing table.',
  })
  @ApiNoContentResponse({ description: 'Route deleted successfully' })
  @ApiNotFoundResponse({ description: 'Route not found' })
  async delete(@Param('uid', ParseUUIDPipe) uid: string): Promise<void> {
    await this.routesService.delete(uid);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Route, HttpMethod } from '../../../../../../data-access/entities/route.entity';

export class RouteResponseDto {
  @ApiProperty({ description: 'Public unique identifier' })
  uid: string;

  @ApiProperty({ description: 'UID of the upstream service' })
  serviceUid: string;

  @ApiProperty({ nullable: true, description: 'Hostname matcher' })
  host: string | null;

  @ApiProperty({ description: 'Path pattern', example: '/users/:id' })
  pathPattern: string;

  @ApiProperty({ enum: HttpMethod, nullable: true, description: 'HTTP method — null matches all' })
  method: HttpMethod | null;

  @ApiProperty({ description: 'Whether the route prefix is stripped before forwarding' })
  stripPrefix: boolean;

  @ApiProperty({ description: 'Match priority' })
  priority: number;

  @ApiProperty({ description: 'Whether the route is active' })
  isEnabled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static from(route: Route): RouteResponseDto {
    const dto = new RouteResponseDto();
    dto.uid = route.uid;
    dto.serviceUid = route.service?.uid ?? '';
    dto.host = route.host;
    dto.pathPattern = route.pathPattern;
    dto.method = route.method;
    dto.stripPrefix = route.stripPrefix;
    dto.priority = route.priority;
    dto.isEnabled = route.isEnabled;
    dto.createdAt = route.createdAt;
    dto.updatedAt = route.updatedAt;
    return dto;
  }
}

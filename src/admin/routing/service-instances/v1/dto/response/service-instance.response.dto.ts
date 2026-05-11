import { ApiProperty } from '@nestjs/swagger';
import { ServiceInstance } from '../../../../../../data-access/entities/service-instance.entity';

export class ServiceInstanceResponseDto {
  @ApiProperty({ description: 'Public unique identifier' })
  uid: string;

  @ApiProperty({ description: 'UID of the parent service' })
  serviceUid: string;

  @ApiProperty({ description: 'Hostname or IP address', example: 'localhost' })
  host: string;

  @ApiProperty({ description: 'Port number', example: 3001 })
  port: number;

  @ApiProperty({ description: 'Load-balancing weight', example: 1 })
  weight: number;

  @ApiProperty({ description: 'Whether this instance is healthy' })
  isHealthy: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static from(instance: ServiceInstance): ServiceInstanceResponseDto {
    const dto = new ServiceInstanceResponseDto();
    dto.uid = instance.uid;
    dto.serviceUid = instance.service?.uid ?? '';
    dto.host = instance.host;
    dto.port = instance.port;
    dto.weight = instance.weight;
    dto.isHealthy = instance.isHealthy;
    dto.createdAt = instance.createdAt;
    dto.updatedAt = instance.updatedAt;
    return dto;
  }
}

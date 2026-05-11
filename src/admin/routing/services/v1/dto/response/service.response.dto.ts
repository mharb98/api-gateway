import { ApiProperty } from '@nestjs/swagger';
import { Service, ServiceProtocol } from '../../../../../../data-access/entities/service.entity';

export class ServiceResponseDto {
  @ApiProperty({ description: 'Public unique identifier' })
  uid: string;

  @ApiProperty({ description: 'Unique service name', example: 'user-service' })
  name: string;

  @ApiProperty({ enum: ServiceProtocol, description: 'Upstream protocol' })
  protocol: ServiceProtocol;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static from(service: Service): ServiceResponseDto {
    const dto = new ServiceResponseDto();
    dto.uid = service.uid;
    dto.name = service.name;
    dto.protocol = service.protocol;
    dto.createdAt = service.createdAt;
    dto.updatedAt = service.updatedAt;
    return dto;
  }
}

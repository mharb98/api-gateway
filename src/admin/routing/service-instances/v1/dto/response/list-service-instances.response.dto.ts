import { ApiProperty } from '@nestjs/swagger';
import { ServiceInstance } from '../../../../../../data-access/entities/service-instance.entity';
import { ServiceInstanceResponseDto } from './service-instance.response.dto';

export class ListServiceInstancesResponseDto {
  @ApiProperty({ type: () => [ServiceInstanceResponseDto] })
  data: ServiceInstanceResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  static from(
    instances: ServiceInstance[],
    total: number,
    page: number,
    limit: number,
  ): ListServiceInstancesResponseDto {
    const dto = new ListServiceInstancesResponseDto();
    dto.data = instances.map(ServiceInstanceResponseDto.from);
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}

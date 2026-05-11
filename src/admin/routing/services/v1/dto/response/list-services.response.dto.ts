import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../../../data-access/entities/service.entity';
import { ServiceResponseDto } from './service.response.dto';

export class ListServicesResponseDto {
  @ApiProperty({ type: () => [ServiceResponseDto] })
  data: ServiceResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  static from(
    services: Service[],
    total: number,
    page: number,
    limit: number,
  ): ListServicesResponseDto {
    const dto = new ListServicesResponseDto();
    dto.data = services.map(ServiceResponseDto.from);
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}

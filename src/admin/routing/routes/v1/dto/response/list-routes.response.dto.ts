import { ApiProperty } from '@nestjs/swagger';
import { Route } from '../../../../../../data-access/entities/route.entity';
import { RouteResponseDto } from './route.response.dto';

export class ListRoutesResponseDto {
  @ApiProperty({ type: () => [RouteResponseDto] })
  data: RouteResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  static from(
    routes: Route[],
    total: number,
    page: number,
    limit: number,
  ): ListRoutesResponseDto {
    const dto = new ListRoutesResponseDto();
    dto.data = routes.map(RouteResponseDto.from);
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}

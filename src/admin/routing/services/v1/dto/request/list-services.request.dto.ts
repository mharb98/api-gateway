import { EnumField, StringField } from '../../../../../../common/decorators/dtos';
import { PaginationDto } from '../../../../../../common/dtos/pagination.dto';
import { SortOrder } from '../../../../../../common/dtos/filter.dto';
import { ServiceProtocol } from '../../../../../../data-access/entities/service.entity';

export enum ServicesSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  PROTOCOL = 'protocol',
}

export class ListServicesRequestDto extends PaginationDto {
  @StringField({ required: false, trim: true, description: 'Search by service name (case-insensitive)' })
  search?: string;

  @EnumField(ServiceProtocol, { required: false, description: 'Filter by protocol' })
  protocol?: ServiceProtocol;

  @EnumField(ServicesSortBy, {
    required: false,
    default: ServicesSortBy.CREATED_AT,
    description: 'Field to sort by',
  })
  sortBy?: ServicesSortBy;

  @EnumField(SortOrder, {
    required: false,
    default: SortOrder.DESC,
    description: 'Sort direction',
  })
  order?: SortOrder;
}

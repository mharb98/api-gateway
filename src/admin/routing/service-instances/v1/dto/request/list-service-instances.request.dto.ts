import { BooleanField, EnumField, UUIDField } from '../../../../../../common/decorators/dtos';
import { PaginationDto } from '../../../../../../common/dtos/pagination.dto';
import { SortOrder } from '../../../../../../common/dtos/filter.dto';

export enum InstancesSortBy {
  PORT = 'port',
  CREATED_AT = 'createdAt',
  WEIGHT = 'weight',
}

export class ListServiceInstancesRequestDto extends PaginationDto {
  @UUIDField({ required: false, description: 'Filter by service UID' })
  serviceUid?: string;

  @BooleanField({ required: false, description: 'Filter by health status' })
  isHealthy?: boolean;

  @EnumField(InstancesSortBy, {
    required: false,
    default: InstancesSortBy.CREATED_AT,
    description: 'Field to sort by',
  })
  sortBy?: InstancesSortBy;

  @EnumField(SortOrder, {
    required: false,
    default: SortOrder.DESC,
    description: 'Sort direction',
  })
  order?: SortOrder;
}

import { EnumField, BooleanField, UUIDField } from '../../../../../../common/decorators/dtos';
import { PaginationDto } from '../../../../../../common/dtos/pagination.dto';
import { SortOrder } from '../../../../../../common/dtos/filter.dto';
import { HttpMethod } from '../../../../../../data-access/entities/route.entity';

export enum RoutesSortBy {
  PRIORITY = 'priority',
  CREATED_AT = 'createdAt',
  PATH = 'pathPattern',
}

export class ListRoutesRequestDto extends PaginationDto {
  @UUIDField({ required: false, description: 'Filter routes by service UID' })
  serviceUid?: string;

  @EnumField(HttpMethod, {
    required: false,
    nullable: true,
    description: 'Filter by HTTP method',
  })
  method?: HttpMethod | null;

  @BooleanField({ required: false, description: 'Filter by enabled status' })
  isEnabled?: boolean;

  @EnumField(RoutesSortBy, {
    required: false,
    default: RoutesSortBy.PRIORITY,
    description: 'Field to sort by',
  })
  sortBy?: RoutesSortBy;

  @EnumField(SortOrder, {
    required: false,
    default: SortOrder.DESC,
    description: 'Sort direction',
  })
  order?: SortOrder;
}

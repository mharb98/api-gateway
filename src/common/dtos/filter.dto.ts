import { StringField, DateField, EnumField } from '../decorators/dtos/index';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FilterDto {
  @StringField({
    required: false,
    trim: true,
    description: 'Search query string',
    example: 'john',
  })
  search?: string;

  @StringField({
    required: false,
    description: 'Field to sort by',
    example: 'createdAt',
  })
  sortBy?: string;

  @EnumField(SortOrder, {
    required: false,
    description: 'Sort direction',
    example: SortOrder.ASC,
  })
  order?: SortOrder;

  @DateField({
    required: false,
    description: 'Filter records from this date (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
  })
  from?: Date;

  @DateField({
    required: false,
    description: 'Filter records up to this date (ISO 8601)',
    example: '2025-12-31T23:59:59.999Z',
  })
  to?: Date;
}

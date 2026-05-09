import { NumberField } from '../decorators/dtos/index';

export class PaginationDto {
  @NumberField({
    required: false,
    integer: true,
    min: 1,
    default: 1,
    description: 'Page number (1-based)',
    example: 1,
  })
  page: number = 1;

  @NumberField({
    required: false,
    integer: true,
    min: 1,
    max: 100,
    default: 20,
    description: 'Number of items per page',
    example: 20,
  })
  limit: number = 20;
}

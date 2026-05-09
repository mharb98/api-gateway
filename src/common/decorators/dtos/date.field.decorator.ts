import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
import type { DateFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators, buildApiProperty, each } from './helpers/decorator.helpers';

export function DateField(options: DateFieldOptions = {}): PropertyDecorator {
  const {
    required = true,
    nullable = false,
    isArray = false,
    description,
    example,
    default: defaultValue,
  } = options;

  return applyDecorators(
    ...buildBaseDecorators({ required, nullable, isArray, default: defaultValue }),
    buildApiProperty(
      { required, nullable, isArray, description, example, default: defaultValue },
      isArray ? [Date] : Date,
    ),
    Type(() => Date),
    IsDate(each(isArray)),
  );
}

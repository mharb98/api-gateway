import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import type { BooleanFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators, buildApiProperty, each } from './helpers/decorator.helpers';

export function BooleanField(options: BooleanFieldOptions = {}): PropertyDecorator {
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
      isArray ? [Boolean] : Boolean,
    ),
    Type(() => Boolean),
    IsBoolean(each(isArray)),
  );
}

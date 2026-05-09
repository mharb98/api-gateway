import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, IsNegative, Min, Max } from 'class-validator';
import type { NumberFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators, buildApiProperty, each } from './helpers/decorator.helpers';

export function NumberField(options: NumberFieldOptions = {}): PropertyDecorator {
  const {
    required = true,
    nullable = false,
    isArray = false,
    min,
    max,
    integer = false,
    positive = false,
    negative = false,
    description,
    example,
    default: defaultValue,
  } = options;

  const decorators: PropertyDecorator[] = [
    ...buildBaseDecorators({ required, nullable, isArray, default: defaultValue }),
    buildApiProperty(
      { required, nullable, isArray, description, example, default: defaultValue },
      isArray ? [Number] : Number,
    ),
    Type(() => Number),
    integer ? IsInt(each(isArray)) : IsNumber({}, each(isArray)),
  ];

  if (positive) decorators.push(IsPositive(each(isArray)));
  if (negative) decorators.push(IsNegative(each(isArray)));
  if (min !== undefined) decorators.push(Min(min, each(isArray)));
  if (max !== undefined) decorators.push(Max(max, each(isArray)));

  return applyDecorators(...decorators);
}

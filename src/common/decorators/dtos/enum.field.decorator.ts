import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import type { EnumFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators, each } from './helpers/decorator.helpers';

export function EnumField<T extends object>(
  enumType: T,
  options: EnumFieldOptions = {},
): PropertyDecorator {
  const {
    required = true,
    nullable = false,
    isArray = false,
    description,
    example,
    default: defaultValue,
  } = options;

  const enumValues = Object.values(enumType);
  const apiOpts: Parameters<typeof ApiProperty>[0] = {
    enum: enumType,
    isArray,
    required,
    nullable,
  };
  if (description !== undefined) apiOpts.description = description;
  if (example !== undefined) apiOpts.example = example;
  else if (enumValues.length > 0) apiOpts.example = enumValues[0];
  if (defaultValue !== undefined) apiOpts.default = defaultValue;

  return applyDecorators(
    ...buildBaseDecorators({ required, nullable, isArray, default: defaultValue }),
    ApiProperty(apiOpts),
    IsEnum(enumType, each(isArray)),
  );
}

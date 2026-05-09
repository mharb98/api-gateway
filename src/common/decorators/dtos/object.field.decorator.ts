import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import type { ObjectFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators } from './helpers/decorator.helpers';

type ClassConstructor<T = object> = new (...args: unknown[]) => T;

export function ObjectField(
  typeFn: () => ClassConstructor,
  options: ObjectFieldOptions = {},
): PropertyDecorator {
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
    ApiProperty({
      type: typeFn,
      isArray,
      required,
      nullable,
      ...(description !== undefined ? { description } : {}),
      ...(example !== undefined ? { example } : {}),
      ...(defaultValue !== undefined ? { default: defaultValue } : {}),
    }),
    Type(typeFn),
    ValidateNested({ each: isArray }),
  );
}

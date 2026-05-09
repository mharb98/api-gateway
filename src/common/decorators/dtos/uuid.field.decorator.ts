import { applyDecorators } from '@nestjs/common';
import { IsUUID } from 'class-validator';

type UUIDVersion = '3' | '4' | '5' | 'all' | 3 | 4 | 5;
import type { UUIDFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators, buildApiProperty, each } from './helpers/decorator.helpers';

export function UUIDField(options: UUIDFieldOptions = {}): PropertyDecorator {
  const {
    required = true,
    nullable = false,
    isArray = false,
    version = '4',
    description,
    example,
    default: defaultValue,
  } = options;

  return applyDecorators(
    ...buildBaseDecorators({ required, nullable, isArray, default: defaultValue }),
    buildApiProperty(
      {
        required,
        nullable,
        isArray,
        description,
        example: example ?? '550e8400-e29b-41d4-a716-446655440000',
        default: defaultValue,
      },
      isArray ? [String] : String,
    ),
    IsUUID(version as UUIDVersion, each(isArray)),
  );
}

import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import type { EmailFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators, buildApiProperty, each } from './helpers/decorator.helpers';

export function EmailField(options: EmailFieldOptions = {}): PropertyDecorator {
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
      {
        required,
        nullable,
        isArray,
        description,
        example: example ?? 'user@example.com',
        default: defaultValue,
      },
      isArray ? [String] : String,
    ),
    IsString(each(isArray)),
    IsEmail({}, each(isArray)),
  );
}

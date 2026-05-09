import { applyDecorators } from '@nestjs/common';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import type { StringFieldOptions } from './interfaces/field-options.interface';
import { buildBaseDecorators, buildApiProperty, each } from './helpers/decorator.helpers';

export function StringField(options: StringFieldOptions = {}): PropertyDecorator {
  const {
    required = true,
    nullable = false,
    isArray = false,
    minLength,
    maxLength,
    pattern,
    trim,
    toLowerCase,
    toUpperCase,
    description,
    example,
    default: defaultValue,
  } = options;

  const decorators: PropertyDecorator[] = [
    ...buildBaseDecorators({ required, nullable, isArray, default: defaultValue }),
    buildApiProperty(
      { required, nullable, isArray, description, example, default: defaultValue },
      isArray ? [String] : String,
    ),
    IsString(each(isArray)),
  ];

  if (minLength !== undefined) decorators.push(MinLength(minLength, each(isArray)));
  if (maxLength !== undefined) decorators.push(MaxLength(maxLength, each(isArray)));
  if (pattern !== undefined) decorators.push(Matches(pattern, each(isArray)));

  if (trim) {
    decorators.push(
      Transform(({ value }: TransformFnParams) =>
        isArray
          ? Array.isArray(value)
            ? value.map((v: unknown) => (typeof v === 'string' ? v.trim() : v))
            : value
          : typeof value === 'string'
            ? value.trim()
            : value,
      ),
    );
  }

  if (toLowerCase) {
    decorators.push(
      Transform(({ value }: TransformFnParams) =>
        isArray
          ? Array.isArray(value)
            ? value.map((v: unknown) => (typeof v === 'string' ? v.toLowerCase() : v))
            : value
          : typeof value === 'string'
            ? value.toLowerCase()
            : value,
      ),
    );
  }

  if (toUpperCase) {
    decorators.push(
      Transform(({ value }: TransformFnParams) =>
        isArray
          ? Array.isArray(value)
            ? value.map((v: unknown) => (typeof v === 'string' ? v.toUpperCase() : v))
            : value
          : typeof value === 'string'
            ? value.toUpperCase()
            : value,
      ),
    );
  }

  return applyDecorators(...decorators);
}

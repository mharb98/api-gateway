import { Transform, type TransformFnParams } from 'class-transformer';
import { IsArray, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import type { BaseFieldOptions } from '../interfaces/field-options.interface';

export function each(isArray: boolean): { each?: true } {
  return isArray ? { each: true } : {};
}

export function buildBaseDecorators(
  options: Pick<BaseFieldOptions, 'required' | 'nullable' | 'isArray' | 'default'>,
): PropertyDecorator[] {
  const { required = true, nullable = false, isArray = false, default: defaultValue } = options;
  const decorators: PropertyDecorator[] = [];

  if (!required) {
    decorators.push(IsOptional());
  } else if (required && nullable) {
    decorators.push(ValidateIf((_obj: object, value: unknown) => value !== null));
  }

  if (isArray) decorators.push(IsArray());

  if (defaultValue !== undefined) {
    decorators.push(
      Transform(({ value }: TransformFnParams) =>
        value !== undefined && value !== null ? value : defaultValue,
      ),
    );
  }

  return decorators;
}

export function buildApiProperty(
  options: BaseFieldOptions,
  typeInfo: ApiPropertyOptions['type'],
): PropertyDecorator {
  const {
    required = true,
    nullable = false,
    isArray = false,
    description,
    example,
    default: defaultValue,
  } = options;

  const opts = { type: typeInfo, required, nullable, isArray } as ApiPropertyOptions;
  if (description !== undefined) opts.description = description;
  if (example !== undefined) opts.example = example;
  if (defaultValue !== undefined) opts.default = defaultValue;

  return ApiProperty(opts);
}

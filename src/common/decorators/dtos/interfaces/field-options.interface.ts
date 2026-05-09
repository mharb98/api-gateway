export interface BaseFieldOptions {
  required?: boolean;
  nullable?: boolean;
  isArray?: boolean;
  description?: string;
  example?: unknown;
  default?: unknown;
}

export interface StringFieldOptions extends BaseFieldOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
}

export interface NumberFieldOptions extends BaseFieldOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
}

export interface BooleanFieldOptions extends BaseFieldOptions {}
export interface DateFieldOptions extends BaseFieldOptions {}

export interface UUIDFieldOptions extends BaseFieldOptions {
  version?: '3' | '4' | '5' | 'all';
}

export interface EmailFieldOptions extends BaseFieldOptions {}
export interface EnumFieldOptions extends BaseFieldOptions {}
export interface ObjectFieldOptions extends BaseFieldOptions {}

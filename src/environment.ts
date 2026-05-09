import 'dotenv/config';

export function Variable(envVarName: string, fallback?: string): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    const value = process.env[envVarName] ?? fallback;

    if (value === undefined) {
      throw new Error(
        `Missing required environment variable "${envVarName}". Set it in .env or provide a fallback.`,
      );
    }

    Object.defineProperty(target, propertyKey, {
      get: () => value,
      enumerable: true,
      configurable: true,
    });
  };
}

export class Environment {
  @Variable('PORT', '3000')
  static readonly PORT: string;

  @Variable('NODE_ENV', 'development')
  static readonly NODE_ENV: string;

  @Variable('DB_HOST', 'localhost')
  static readonly DB_HOST: string;

  @Variable('DB_PORT', '5432')
  static readonly DB_PORT: string;

  @Variable('DB_USERNAME', 'postgres')
  static readonly DB_USERNAME: string;

  @Variable('DB_PASSWORD')
  static readonly DB_PASSWORD: string;

  @Variable('DB_NAME', 'api_gateway')
  static readonly DB_NAME: string;
}

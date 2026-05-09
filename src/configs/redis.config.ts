import { Environment } from '../environment';

export const redisConfig = {
  host: Environment.REDIS_HOST,
  port: parseInt(Environment.REDIS_PORT, 10),
  ...(Environment.REDIS_PASSWORD ? { password: Environment.REDIS_PASSWORD } : {}),
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
};

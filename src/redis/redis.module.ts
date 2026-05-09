import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';
import { redisConfig } from '../configs/redis.config';
import { AppLogger, LogSeverity } from '../common/logger';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const client = new Redis(redisConfig);

        client.on('connect', () =>
          AppLogger.info({ title: 'Redis', message: 'Connection established' }),
        );
        client.on('error', (err: Error) =>
          AppLogger.error({
            title: 'Redis',
            severity: LogSeverity.HIGH,
            exception: err,
          }),
        );

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}

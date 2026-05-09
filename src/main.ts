import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Environment } from './environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Environment.PORT);
}
bootstrap();

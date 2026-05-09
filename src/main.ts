import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Environment } from './environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway REST documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(Environment.PORT);

  console.log(`Server is running on port ${Environment.PORT}`);
  console.log(`Swagger docs available at http://localhost:${Environment.PORT}/api/docs`);
}
bootstrap();

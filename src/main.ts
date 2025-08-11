import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('URL Shortener')
    .setDescription('Authentication service (JWT) + URL Shortener endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000')
    .build();

  // No `include` so ALL controllers are included
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();

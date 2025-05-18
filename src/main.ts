import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set up global prefix to match the API spec
  app.setGlobalPrefix('api');
  
  // Set up validation for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Weather Forecast API')
    .setDescription('Weather API application that allows users to subscribe to weather updates for their city')
    .setVersion('1.0')
    .addTag('weather', 'Weather forecast operations')
    .addTag('subscription', 'Subscription management operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
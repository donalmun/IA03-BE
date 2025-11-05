import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const clientOrigins = process.env.CORS_ORIGIN;

  if (!clientOrigins) {
    throw new Error('CORS_ORIGIN is not defined in the environment variables.');
  }

  // Tách chuỗi thành một mảng các origin
  const whitelist = clientOrigins.split(',');

  const corsOptions = {
    origin: whitelist, // Sử dụng mảng các origin được phép
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.enableCors(corsOptions);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Accepting requests from origins: ${whitelist.join(', ')}`);
}
bootstrap();

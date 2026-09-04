import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  try {
    console.log('🚀 Starting Civora NestJS application...');
    const app = await NestFactory.create(AppModule);

    // Security
    app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(cookieParser());

    // CORS - Allow frontend domains (Vercel, localhost, etc.)
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    // Global prefix with root and health excluded
    app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'health'],
    });

    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Civora API running on http://localhost:${port}/api/v1`);
  } catch (error) {
    console.error('❌ Failed to start Civora API:', error);
    process.exit(1);
  }
}

bootstrap();

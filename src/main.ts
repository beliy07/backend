import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CoreModule } from './core/core.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(CoreModule, {
    rawBody: true,
  });

  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors();

  await app.listen(config.getOrThrow<number>('APP_PORT') ?? 3000);
}

bootstrap();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const uiOrigin = process.env.UI_ORIGIN || 'http://localhost:3001';
  app.enableCors({
    origin: uiOrigin,
    credentials: true,
  });

  app.use(cookieParser());

  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) throw new Error('SESSION_SECRET is required');

  app.use(
    session({
      name: 'life_session',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
    }),
  );

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`personal-erp api listening on http://0.0.0.0:${port}`);
}

bootstrap();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RedisStore = require('connect-redis').default ?? require('connect-redis');
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

  // Needed when running behind nginx/HTTPS termination so secure cookies work correctly
  (app as any).set('trust proxy', 1);

  // Use Redis session store so sessions survive API restarts
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) => console.warn('Redis session error:', err));
  await redisClient.connect();

  app.use(
    session({
      name: 'life_session',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redisClient }),
      cookie: {
        httpOnly: true,
        // UI is on a different site (life.kisorbiswal.com) than API (life-api.kisorbiswal.com),
        // so we must allow cross-site cookies.
        sameSite: isProd ? 'none' : 'lax',
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

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { EventsController } from './events.controller';
import { EventsActionsController } from './events.actions.controller';
import { EventsTagsController } from './events.tags.controller';
import { TagsController } from './tags.controller';
import { FeedController } from './feed.controller';
import { BoardsController } from './boards.controller';
import { BoardsReorderController } from './boards.reorder.controller';
import { AuthController } from './auth.controller';
import { AuthDevController } from './auth.dev.controller';
import { GoogleStrategy } from './google.strategy';
import { TelegramModule } from './telegram.module';
import { HealthModule } from './health/health.module';
import { SessionAuthGuard } from './auth.guard';

@Module({
  imports: [PassportModule.register({ session: false }), TelegramModule, HealthModule],
  controllers: [HealthController, AuthController, AuthDevController, EventsController, EventsActionsController, EventsTagsController, TagsController, BoardsController, BoardsReorderController, FeedController],
  providers: [
    PrismaService,
    GoogleStrategy,
    // Global guard — every route requires auth unless decorated @Public()
    { provide: APP_GUARD, useClass: SessionAuthGuard },
  ],
})
export class AppModule {}

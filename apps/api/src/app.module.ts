import { Module } from '@nestjs/common';
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
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [PassportModule.register({ session: false })],
  controllers: [HealthController, AuthController, EventsController, EventsActionsController, EventsTagsController, TagsController, BoardsController, BoardsReorderController, FeedController],
  providers: [PrismaService, GoogleStrategy],
})
export class AppModule {}

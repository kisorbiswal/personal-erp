import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { EventsController } from './events.controller';
import { TagsController } from './tags.controller';
import { BoardsController } from './boards.controller';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [PassportModule.register({ session: false })],
  controllers: [HealthController, AuthController, EventsController, TagsController, BoardsController],
  providers: [PrismaService, GoogleStrategy],
})
export class AppModule {}

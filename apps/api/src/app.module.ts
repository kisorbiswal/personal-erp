import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { EventsController } from './events.controller';
import { TagsController } from './tags.controller';

@Module({
  imports: [],
  controllers: [HealthController, EventsController, TagsController],
  providers: [PrismaService],
})
export class AppModule {}

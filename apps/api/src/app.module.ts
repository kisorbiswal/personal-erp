import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { PrismaService } from './prisma.service.js';
import { EventsController } from './events.controller.js';
import { TagsController } from './tags.controller.js';

@Module({
  imports: [],
  controllers: [HealthController, EventsController, TagsController],
  providers: [PrismaService],
})
export class AppModule {}

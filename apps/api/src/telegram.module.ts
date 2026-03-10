import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { OllamaService } from './ollama.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [TelegramService, OllamaService, PrismaService],
})
export class TelegramModule {}

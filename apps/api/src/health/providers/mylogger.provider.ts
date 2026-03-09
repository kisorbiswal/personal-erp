import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MyLoggerProvider {
  private readonly log = new Logger(MyLoggerProvider.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Fetch all events tagged "weight" for this user, parse numeric value from content.
   * Content formats seen: "70.3kg", "70.3", "70.7 Belly becomes prominent..."
   */
  async fetchWeightRecords(userId: string): Promise<Array<{ occurredAt: Date; value: number }>> {
    const tags = await this.prisma.tag.findMany({
      where: { userId, name: { in: ['weight', 'Weight'] } },
      select: { id: true },
    });
    if (tags.length === 0) return [];

    const tagIds = tags.map((t) => t.id);

    const eventTags = await this.prisma.eventTag.findMany({
      where: { tagId: { in: tagIds } },
      select: { eventId: true },
    });
    const eventIds = eventTags.map((et) => et.eventId);
    if (eventIds.length === 0) return [];

    const events = await this.prisma.event.findMany({
      where: { id: { in: eventIds }, userId, deletedAt: null },
      select: { content: true, occurredAt: true },
      orderBy: { occurredAt: 'asc' },
    });

    const results: Array<{ occurredAt: Date; value: number }> = [];
    for (const ev of events) {
      const match = ev.content?.match(/^(\d+\.?\d*)/);
      if (!match) continue;
      const value = parseFloat(match[1]);
      if (value > 20 && value < 400) {
        results.push({ occurredAt: new Date(ev.occurredAt), value });
      }
    }

    this.log.log(`MyLogger: found ${results.length} valid weight records for user ${userId}`);
    return results;
  }

  extractMetricValues(dp: { id: string; userId: string; occurredAt: Date; payload: any }) {
    return [
      { userId: dp.userId, dataPointId: dp.id, dataType: 'weight-scale', field: 'value_kg', valueNum: dp.payload.value_kg ?? null, unit: 'kg', occurredAt: dp.occurredAt },
    ].filter((m) => m.valueNum != null);
  }
}

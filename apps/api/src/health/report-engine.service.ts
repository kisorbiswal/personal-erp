import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const providerCapabilities: Record<string, string[]> = {
  fitbit: ['sleep-tracker', 'weight-scale'],
};

interface ReportSlot {
  slot: string;
  dataType: string;
  fields: string[];
  aggregation: string;
  optional: boolean;
}

interface ResolvedSlot {
  resolved: boolean;
  sourceId: string | null;
  provider: string | null;
}

@Injectable()
export class ReportEngineService {
  constructor(private prisma: PrismaService) {}

  /**
   * For each required slot in the template, find which DataSource provides it.
   */
  async resolveSlots(
    userId: string,
    template: { definition: any },
  ): Promise<Record<string, ResolvedSlot>> {
    const slots: ReportSlot[] = template.definition.requires || [];
    const sources = await this.prisma.dataSource.findMany({
      where: { userId },
    });

    const result: Record<string, ResolvedSlot> = {};

    for (const slot of slots) {
      let resolved = false;
      let sourceId: string | null = null;
      let provider: string | null = null;

      for (const src of sources) {
        const caps = providerCapabilities[src.provider] || [];
        if (caps.includes(slot.dataType)) {
          resolved = true;
          sourceId = src.id;
          provider = src.provider;
          break;
        }
      }

      result[slot.slot] = { resolved, sourceId, provider };
    }

    return result;
  }

  /**
   * Query MetricValues grouped by date for chart rendering.
   */
  async getChartData(
    userId: string,
    template: { definition: any },
    dateRange: { start: Date; end: Date },
  ): Promise<{ labels: string[]; series: Record<string, (number | null)[]> }> {
    const slots: ReportSlot[] = template.definition.requires || [];

    // Collect all dates and series data
    const dateMap = new Map<string, Record<string, number | null>>();

    for (const slot of slots) {
      const field = slot.fields[0]; // primary field for chart
      const aggregation = slot.aggregation;

      const metrics = await this.prisma.metricValue.findMany({
        where: {
          userId,
          dataType: slot.dataType,
          field,
          occurredAt: { gte: dateRange.start, lte: dateRange.end },
        },
        orderBy: { occurredAt: 'asc' },
      });

      // Group by date
      const byDate = new Map<string, number[]>();
      for (const m of metrics) {
        if (m.valueNum == null) continue;
        const dateKey = m.occurredAt.toISOString().split('T')[0];
        if (!byDate.has(dateKey)) byDate.set(dateKey, []);
        byDate.get(dateKey)!.push(m.valueNum);
      }

      // Aggregate
      for (const [dateKey, values] of byDate) {
        if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
        const entry = dateMap.get(dateKey)!;

        if (aggregation === 'daily_latest') {
          entry[slot.slot] = values[values.length - 1];
        } else {
          // daily: sum or first value (for sleep duration, it's the value itself per day)
          entry[slot.slot] = values[0];
        }
      }
    }

    // Sort dates and build output
    const labels = Array.from(dateMap.keys()).sort();
    const series: Record<string, (number | null)[]> = {};

    for (const slot of slots) {
      series[slot.slot] = labels.map((d) => dateMap.get(d)?.[slot.slot] ?? null);
    }

    return { labels, series };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const providerCapabilities: Record<string, string[]> = {
  fitbit:         ['sleep-tracker', 'weight-scale'],
  mylogger:       ['weight-scale'],
  'apple-health': ['weight-scale'],
};

interface ReportSlot {
  slot: string;
  dataType: string;
  provider?: string;   // optional: pin to a specific provider
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
   * For each required slot, find the DataSource that provides it.
   * If slot.provider is set, only match that provider.
   */
  async resolveSlots(
    userId: string,
    template: { definition: any },
  ): Promise<Record<string, ResolvedSlot>> {
    const slots: ReportSlot[] = template.definition.requires || [];
    const sources = await this.prisma.dataSource.findMany({ where: { userId } });

    const result: Record<string, ResolvedSlot> = {};
    for (const slot of slots) {
      let resolved = false;
      let sourceId: string | null = null;
      let provider: string | null = null;

      for (const src of sources) {
        // If slot pins a provider, skip non-matching sources
        if (slot.provider && src.provider !== slot.provider) continue;
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
   * Query MetricValues per slot, grouped by date or ISO week.
   * When slot.provider is set, filter MetricValues by that provider's DataSource.
   * aggregation modes: daily | daily_latest | weekly_avg | weekly_latest
   */
  async getChartData(
    userId: string,
    template: { definition: any },
    dateRange: { start: Date | null; end: Date },
  ): Promise<{ labels: string[]; series: Record<string, (number | null)[]> }> {
    const slots: ReportSlot[] = template.definition.requires || [];
    const useWeekly = slots.some((s) => s.aggregation?.startsWith('weekly'));

    // Resolve each slot's sourceId when provider-pinned
    const sources = await this.prisma.dataSource.findMany({ where: { userId } });
    const sourceByProvider: Record<string, string> = {};
    for (const src of sources) sourceByProvider[src.provider] = src.id;

    // Weekly bucket key = Monday's date (YYYY-MM-DD) — human readable, sorts correctly
    const bucketKey = (date: Date): string => {
      if (!useWeekly) return date.toISOString().split('T')[0];
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const day = d.getUTCDay(); // 0=Sun
      d.setUTCDate(d.getUTCDate() - ((day + 6) % 7)); // roll back to Monday
      return d.toISOString().split('T')[0];
    };

    // IQR outlier bounds: rejects values outside Q1−k·IQR … Q3+k·IQR
    const iqrBounds = (values: number[], k = 2.5): [number, number] => {
      if (values.length < 4) return [-Infinity, Infinity];
      const s = [...values].sort((a, b) => a - b);
      const q1 = s[Math.floor(s.length * 0.25)];
      const q3 = s[Math.floor(s.length * 0.75)];
      const iqr = q3 - q1;
      return [q1 - k * iqr, q3 + k * iqr];
    };

    const bucketMap = new Map<string, Record<string, number[]>>();

    for (const slot of slots) {
      const field = slot.fields[0];
      const whereDate: any = { lte: dateRange.end };
      if (dateRange.start) whereDate.gte = dateRange.start;

      const where: any = { userId, dataType: slot.dataType, field, occurredAt: whereDate };
      if (slot.provider) {
        const srcId = sourceByProvider[slot.provider];
        if (!srcId) continue;
        where.dataPoint = { sourceId: srcId };
      }

      const metrics = await this.prisma.metricValue.findMany({
        where,
        orderBy: { occurredAt: 'asc' },
      });

      // Compute IQR bounds from the full dataset for this slot
      const allVals = metrics.map((m) => m.valueNum).filter((v): v is number => v != null);
      const [lo, hi] = iqrBounds(allVals);

      for (const m of metrics) {
        if (m.valueNum == null) continue;
        // Skip statistical outliers (e.g. 132kg when normal range is 65-80kg)
        if (m.valueNum < lo || m.valueNum > hi) continue;
        const key = bucketKey(m.occurredAt);
        if (!bucketMap.has(key)) bucketMap.set(key, {});
        const entry = bucketMap.get(key)!;
        if (!entry[slot.slot]) entry[slot.slot] = [];
        entry[slot.slot].push(m.valueNum);
      }
    }

    const labels = Array.from(bucketMap.keys()).sort();
    const series: Record<string, (number | null)[]> = {};

    for (const slot of slots) {
      const agg = slot.aggregation ?? 'daily';
      series[slot.slot] = labels.map((key) => {
        const values = bucketMap.get(key)?.[slot.slot];
        if (!values || values.length === 0) return null;
        if (agg === 'daily_latest' || agg === 'weekly_latest') return values[values.length - 1];
        const sum = values.reduce((a, b) => a + b, 0);
        return Math.round((sum / values.length) * 10) / 10;
      });
    }

    return { labels, series };
  }
}

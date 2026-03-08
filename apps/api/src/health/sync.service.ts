import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CryptoService } from './crypto.service';
import { FitbitProvider } from './providers/fitbit.provider';

// Fitbit's earliest supported date for history
const FITBIT_HISTORY_START = '2010-01-01';

// How often to run background sync (default 6 hours)
const SYNC_INTERVAL_MS = parseInt(process.env.HEALTH_SYNC_INTERVAL_HOURS || '6', 10) * 60 * 60 * 1000;

interface SyncCursor {
  sleepNextUrl: string | null;     // next page URL (null = start from sleepAfterDate)
  sleepAfterDate: string;          // resume date for sleep
  weightNextUrl: string | null;    // next page URL for weight
  weightAfterDate: string;         // resume date for weight
  sleepDone: boolean;              // full history sweep complete
  weightDone: boolean;
}

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly log = new Logger(SyncService.name);
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
    private fitbit: FitbitProvider,
  ) {}

  async onModuleInit() {
    // Reset any sources stuck in "syncing" state from a previous crashed run
    const stuck = await this.prisma.dataSource.updateMany({
      where: { syncStatus: 'syncing' },
      data: { syncStatus: 'idle', syncError: 'Reset after server restart' },
    });
    if (stuck.count > 0) {
      this.log.warn(`Reset ${stuck.count} stuck syncing source(s) to idle`);
    }

    // Start background scheduler
    this.log.log(`Background sync scheduled every ${SYNC_INTERVAL_MS / 3600000}h`);
    this.syncTimer = setInterval(() => this.runScheduledSync(), SYNC_INTERVAL_MS);

    // Run one sync pass shortly after startup (30s delay to let server fully boot)
    setTimeout(() => this.runScheduledSync(), 30_000);
  }

  private async runScheduledSync() {
    const sources = await this.prisma.dataSource.findMany({
      where: { syncStatus: { not: 'syncing' } },
    });
    for (const source of sources) {
      try {
        await this.syncSource(source.id);
      } catch (e: any) {
        this.log.error(`Scheduled sync failed for ${source.id}: ${e.message}`);
      }
      // Brief pause between sources to spread API calls
      await this.sleep(2000);
    }
  }

  async syncSource(sourceId: string): Promise<void> {
    const source = await this.prisma.dataSource.findUniqueOrThrow({ where: { id: sourceId } });

    // Don't double-sync
    if (source.syncStatus === 'syncing') {
      this.log.warn(`Source ${sourceId} already syncing, skipping`);
      return;
    }

    await this.prisma.dataSource.update({
      where: { id: sourceId },
      data: { syncStatus: 'syncing', syncError: null },
    });

    try {
      let { accessToken, refreshToken, expiresAt } = this.decryptCredentials(source.credentials as any);

      // Refresh token if expired
      if (new Date(expiresAt) <= new Date()) {
        this.log.log(`Refreshing expired token for source ${sourceId}`);
        const refreshed = await this.fitbit.refreshAccessToken(refreshToken);
        accessToken = refreshed.accessToken;
        refreshToken = refreshed.refreshToken;
        expiresAt = refreshed.expiresAt;
        await this.prisma.dataSource.update({
          where: { id: sourceId },
          data: { credentials: this.encryptCredentials({ accessToken, refreshToken, expiresAt }) },
        });
      }

      // Load or initialise sync cursor
      const configRaw = (source.config as any) || {};
      const cursor: SyncCursor = {
        sleepNextUrl: configRaw.sleepNextUrl ?? null,
        sleepAfterDate: configRaw.sleepAfterDate ?? FITBIT_HISTORY_START,
        weightNextUrl: configRaw.weightNextUrl ?? null,
        weightAfterDate: configRaw.weightAfterDate ?? FITBIT_HISTORY_START,
        sleepDone: configRaw.sleepDone ?? false,
        weightDone: configRaw.weightDone ?? false,
      };

      let sleepCount = 0, weightCount = 0;

      // ── Sleep sync ──────────────────────────────────────────────────────
      if (!cursor.sleepDone) {
        let pageUrl: string | undefined = cursor.sleepNextUrl ?? undefined;

        while (true) {
          const page = await this.fitbit.fetchSleepPage(
            accessToken, pageUrl, cursor.sleepAfterDate,
          );

          await this.processItems(source.id, source.userId, page.items, 'sleep-tracker', (item) => ({
            occurredAt: new Date(item.startTime),
            payload: item,
          }));
          sleepCount += page.items.length;

          // Save cursor after each page — crash-safe
          cursor.sleepNextUrl = page.nextUrl;
          if (!page.nextUrl) { cursor.sleepDone = true; }
          await this.saveCursor(sourceId, cursor);

          if (!page.nextUrl) break;
          pageUrl = page.nextUrl;

          await this.fitbit.interPageDelay(page.rateLimitRemaining, page.rateLimitResetSecs);
        }
      }

      // ── Weight sync ─────────────────────────────────────────────────────
      if (!cursor.weightDone) {
        let pageUrl: string | undefined = cursor.weightNextUrl ?? undefined;

        while (true) {
          const page = await this.fitbit.fetchWeightPage(
            accessToken, pageUrl, cursor.weightAfterDate,
          );

          await this.processItems(source.id, source.userId, page.items, 'weight-scale', (item) => ({
            occurredAt: new Date(`${item.date}T${item.time}`),
            payload: item,
          }));
          weightCount += page.items.length;

          cursor.weightNextUrl = page.nextUrl;
          if (!page.nextUrl) { cursor.weightDone = true; }
          await this.saveCursor(sourceId, cursor);

          if (!page.nextUrl) break;
          pageUrl = page.nextUrl;

          await this.fitbit.interPageDelay(page.rateLimitRemaining, page.rateLimitResetSecs);
        }
      }

      // Full history done — future syncs increment from today
      const today = new Date().toISOString().split('T')[0];
      const nextCursor: SyncCursor = {
        sleepNextUrl: null,
        sleepAfterDate: today,
        weightNextUrl: null,
        weightAfterDate: today,
        sleepDone: false,  // allow incremental syncs going forward
        weightDone: false,
      };

      await this.prisma.dataSource.update({
        where: { id: sourceId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'idle',
          config: nextCursor as any,
        },
      });

      this.log.log(`Sync complete for ${sourceId}: ${sleepCount} sleep, ${weightCount} weight records`);
    } catch (err: any) {
      this.log.error(`Sync failed for ${sourceId}: ${err.message}`);
      await this.prisma.dataSource.update({
        where: { id: sourceId },
        data: { syncStatus: 'error', syncError: err.message },
      });
    }
  }

  /** Save cursor to DB — called after every page so we can resume after crash */
  private async saveCursor(sourceId: string, cursor: SyncCursor) {
    await this.prisma.dataSource.update({
      where: { id: sourceId },
      data: { config: cursor as any },
    });
  }

  private async processItems(
    sourceId: string,
    userId: string,
    items: any[],
    dataType: string,
    mapItem: (item: any) => { occurredAt: Date; payload: any },
  ): Promise<void> {
    for (const item of items) {
      const { occurredAt, payload } = mapItem(item);

      // Upsert by (sourceId, occurredAt, dataType) — idempotent on re-run
      const existing = await this.prisma.dataPoint.findFirst({
        where: { sourceId, occurredAt, dataType },
      });

      let dp: any;
      if (existing) {
        dp = await this.prisma.dataPoint.update({ where: { id: existing.id }, data: { payload } });
      } else {
        dp = await this.prisma.dataPoint.create({ data: { sourceId, userId, occurredAt, dataType, payload } });
      }

      // Re-extract MetricValues
      await this.prisma.metricValue.deleteMany({ where: { dataPointId: dp.id } });
      const metrics = this.fitbit.extractMetricValues({ dataType, payload, id: dp.id, userId, occurredAt });
      if (metrics.length > 0) {
        await this.prisma.metricValue.createMany({ data: metrics });
      }
    }
  }

  private decryptCredentials(creds: any) {
    const json = JSON.parse(this.crypto.decrypt(creds as string));
    return {
      accessToken: json.accessToken as string,
      refreshToken: json.refreshToken as string,
      expiresAt: new Date(json.expiresAt) as Date,
    };
  }

  encryptCredentials(creds: { accessToken: string; refreshToken: string; expiresAt: Date }): string {
    return this.crypto.encrypt(JSON.stringify(creds));
  }

  private sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CryptoService } from './crypto.service';
import { FitbitProvider } from './providers/fitbit.provider';

@Injectable()
export class SyncService {
  private readonly log = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
    private fitbit: FitbitProvider,
  ) {}

  async syncSource(sourceId: string): Promise<void> {
    const source = await this.prisma.dataSource.findUniqueOrThrow({ where: { id: sourceId } });

    await this.prisma.dataSource.update({
      where: { id: sourceId },
      data: { syncStatus: 'syncing', syncError: null },
    });

    try {
      // Decrypt credentials
      const creds = this.decryptCredentials(source.credentials as any);

      // Refresh token if expired
      let { accessToken, refreshToken, expiresAt } = creds;
      if (new Date(expiresAt) <= new Date()) {
        this.log.log(`Refreshing expired token for source ${sourceId}`);
        const refreshed = await this.fitbit.refreshAccessToken(refreshToken);
        accessToken = refreshed.accessToken;
        refreshToken = refreshed.refreshToken;
        expiresAt = refreshed.expiresAt;

        // Update encrypted credentials
        await this.prisma.dataSource.update({
          where: { id: sourceId },
          data: {
            credentials: this.encryptCredentials({ accessToken, refreshToken, expiresAt }),
          },
        });
      }

      // Determine start date
      const backfillDays = parseInt(process.env.HEALTH_SYNC_BACKFILL_DAYS || '90', 10);
      const afterDate = source.lastSyncAt
        ? this.formatDate(source.lastSyncAt)
        : this.formatDate(new Date(Date.now() - backfillDays * 24 * 60 * 60 * 1000));

      // Fetch and process sleep data
      const sleepItems = await this.fitbit.fetchSleepData(accessToken, afterDate);
      await this.processItems(source.id, source.userId, sleepItems, 'sleep-tracker', (item) => ({
        occurredAt: new Date(item.startTime),
        payload: item,
      }));

      // Fetch and process weight data
      const weightItems = await this.fitbit.fetchWeightData(accessToken, afterDate);
      await this.processItems(source.id, source.userId, weightItems, 'weight-scale', (item) => ({
        occurredAt: new Date(`${item.date}T${item.time}`),
        payload: item,
      }));

      await this.prisma.dataSource.update({
        where: { id: sourceId },
        data: { lastSyncAt: new Date(), syncStatus: 'idle' },
      });

      this.log.log(`Sync complete for source ${sourceId}: ${sleepItems.length} sleep, ${weightItems.length} weight`);
    } catch (err: any) {
      this.log.error(`Sync failed for source ${sourceId}: ${err.message}`);
      await this.prisma.dataSource.update({
        where: { id: sourceId },
        data: { syncStatus: 'error', syncError: err.message },
      });
    }
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

      // Upsert DataPoint (avoid duplicates by sourceId+occurredAt+dataType)
      const existing = await this.prisma.dataPoint.findFirst({
        where: { sourceId, occurredAt, dataType },
      });

      let dp: any;
      if (existing) {
        dp = await this.prisma.dataPoint.update({
          where: { id: existing.id },
          data: { payload },
        });
      } else {
        dp = await this.prisma.dataPoint.create({
          data: { sourceId, userId, occurredAt, dataType, payload },
        });
      }

      // Delete old MetricValues for this DataPoint and re-extract
      await this.prisma.metricValue.deleteMany({ where: { dataPointId: dp.id } });

      const metrics = this.fitbit.extractMetricValues({
        dataType,
        payload,
        id: dp.id,
        userId,
        occurredAt,
      });

      if (metrics.length > 0) {
        await this.prisma.metricValue.createMany({ data: metrics });
      }
    }
  }

  private decryptCredentials(creds: any): {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  } {
    // creds is stored as encrypted JSON string
    const json = JSON.parse(this.crypto.decrypt(creds as string));
    return {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      expiresAt: new Date(json.expiresAt),
    };
  }

  encryptCredentials(creds: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }): string {
    return this.crypto.encrypt(JSON.stringify(creds));
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}

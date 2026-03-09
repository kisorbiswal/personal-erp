import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth.guard';
import { PrismaService } from '../prisma.service';
import { FitbitProvider } from './providers/fitbit.provider';
import { SyncService } from './sync.service';
import { Public } from '../public.decorator';

@Controller('health/sources')
@UseGuards(SessionAuthGuard)
export class SourcesController {
  constructor(
    private prisma: PrismaService,
    private fitbit: FitbitProvider,
    private sync: SyncService,
  ) {}

  /** List user's connected DataSources (without credentials) */
  @Get()
  async list(@Req() req: any) {
    const sources = await this.prisma.dataSource.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });

    const HISTORY_START = new Date('2010-01-01').getTime();
    const now = Date.now();

    return Promise.all(
      sources.map(async ({ credentials, config, ...rest }) => {
        const [dataPointCount, newest] = await Promise.all([
          this.prisma.dataPoint.count({ where: { sourceId: rest.id } }),
          this.prisma.dataPoint.findFirst({
            where: { sourceId: rest.id },
            orderBy: { occurredAt: 'desc' },
            select: { occurredAt: true },
          }),
        ]);

        let syncProgress: number | null = null;
        if (rest.syncStatus === 'syncing' && newest) {
          const cur = new Date(newest.occurredAt).getTime();
          syncProgress = Math.min(99, Math.round(((cur - HISTORY_START) / (now - HISTORY_START)) * 100));
        }
        if (rest.syncStatus === 'idle' && dataPointCount > 0) {
          syncProgress = 100;
        }

        return { ...rest, dataPointCount, syncProgress };
      }),
    );
  }

  /** List available providers with connection status */
  @Get('providers')
  async providers(@Req() req: any) {
    const sources = await this.prisma.dataSource.findMany({
      where: { userId: req.user.userId },
    });
    const fitbitSource = sources.find((s) => s.provider === 'fitbit');
    const myloggerSource = sources.find((s) => s.provider === 'mylogger');
    return [
      {
        provider: 'fitbit',
        label: 'Fitbit',
        description: 'Sync sleep, weight, and activity via Fitbit OAuth',
        connected: !!fitbitSource,
        lastSyncAt: fitbitSource?.lastSyncAt ?? null,
        authType: 'oauth',
      },
      {
        provider: 'mylogger',
        label: 'MyLogger (this app)',
        description: 'Import weight entries you\'ve logged in the boards with the "weight" tag',
        connected: !!myloggerSource,
        lastSyncAt: myloggerSource?.lastSyncAt ?? null,
        authType: 'internal',
      },
    ];
  }

  /** Initiate Fitbit OAuth — returns { authUrl } */
  @Get('fitbit/connect')
  connect(@Req() req: any) {
    const authUrl = this.fitbit.generateAuthUrl(req.user.userId);
    return { authUrl };
  }

  /** Fitbit OAuth callback — exchanges code, stores tokens, triggers sync, redirects */
  @Get('fitbit/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: any,
  ) {
    const uiOrigin = process.env.UI_ORIGIN || 'http://localhost:3001';

    const pkce = this.fitbit.getPkceData(state);
    if (!pkce) {
      return res.redirect(`${uiOrigin}/health/sources?error=invalid_state`);
    }

    try {
      const tokens = await this.fitbit.handleCallback(code, pkce.codeVerifier);

      // Encrypt and store
      const encrypted = this.sync.encryptCredentials(tokens);
      const source = await this.prisma.dataSource.upsert({
        where: { userId_provider: { userId: pkce.userId, provider: 'fitbit' } },
        create: {
          userId: pkce.userId,
          provider: 'fitbit',
          label: 'Fitbit',
          credentials: encrypted,
        },
        update: {
          credentials: encrypted,
          syncStatus: 'idle',
          syncError: null,
        },
      });

      // Trigger sync in background (don't await)
      this.sync.syncSource(source.id).catch(() => {});

      return res.redirect(`${uiOrigin}/health/sources?connected=fitbit`);
    } catch (err: any) {
      return res.redirect(`${uiOrigin}/health/sources?error=oauth_failed`);
    }
  }

  /** Connect MyLogger (internal — no OAuth, just creates/upserts a DataSource) */
  @Post('mylogger/connect')
  async connectMyLogger(@Req() req: any) {
    const userId = req.user.userId;
    const existing = await this.prisma.dataSource.findFirst({ where: { userId, provider: 'mylogger' } });
    if (existing) return { sourceId: existing.id, alreadyConnected: true };

    const source = await this.prisma.dataSource.create({
      data: { userId, provider: 'mylogger', label: 'MyLogger', credentials: {}, syncStatus: 'idle' },
    });

    // Kick off initial sync immediately
    this.sync.syncSource(source.id).catch(() => {});
    return { sourceId: source.id, alreadyConnected: false };
  }

  /** Manual sync trigger */
  @Post(':id/sync')
  async triggerSync(@Req() req: any, @Param('id') id: string) {
    const source = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException();
    if (source.userId !== req.user.userId) throw new ForbiddenException();

    // Fire and forget
    this.sync.syncSource(id).catch(() => {});
    return { ok: true };
  }

  /** Disconnect source — cascades to DataPoints/MetricValues */
  @Delete(':id')
  async disconnect(@Req() req: any, @Param('id') id: string) {
    const source = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException();
    if (source.userId !== req.user.userId) throw new ForbiddenException();

    await this.prisma.dataSource.delete({ where: { id } });
    return { ok: true };
  }

  /** Paginated raw DataPoints for a source */
  @Get(':id/data')
  async data(
    @Req() req: any,
    @Param('id') id: string,
    @Query('dataType') dataType?: string,
    @Query('limit') limitStr?: string,
    @Query('page') pageStr?: string,
  ) {
    const source = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException();
    if (source.userId !== req.user.userId) throw new ForbiddenException();

    const limit = Math.min(parseInt(limitStr || '50', 10) || 50, 200);
    const page = parseInt(pageStr || '0', 10) || 0;

    const where: any = { sourceId: id };
    if (dataType) where.dataType = dataType;

    const [items, total] = await Promise.all([
      this.prisma.dataPoint.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: page * limit,
      }),
      this.prisma.dataPoint.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}

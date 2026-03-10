import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CryptoService } from './crypto.service';
import { FitbitProvider } from './providers/fitbit.provider';
import { MyLoggerProvider } from './providers/mylogger.provider';
import { AppleHealthProvider } from './providers/apple-health.provider';
import { SyncService } from './sync.service';
import { ReportEngineService } from './report-engine.service';
import { SourcesController } from './sources.controller';
import { ReportsController } from './reports.controller';

@Module({
  controllers: [SourcesController, ReportsController],
  providers: [
    PrismaService,
    CryptoService,
    FitbitProvider,
    MyLoggerProvider,
    AppleHealthProvider,
    SyncService,
    ReportEngineService,
  ],
})
export class HealthModule {}

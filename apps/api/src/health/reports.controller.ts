import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  ForbiddenException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth.guard';
import { PrismaService } from '../prisma.service';
import { ReportEngineService } from './report-engine.service';

@Controller('health/reports')
@UseGuards(SessionAuthGuard)
export class ReportsController {
  constructor(
    private prisma: PrismaService,
    private reportEngine: ReportEngineService,
  ) {}

  /** List all report templates */
  @Get('templates')
  async templates() {
    return this.prisma.reportTemplate.findMany({ orderBy: { createdAt: 'asc' } });
  }

  /** Single template */
  @Get('templates/:id')
  async template(@Param('id') id: string) {
    const t = await this.prisma.reportTemplate.findUnique({ where: { id } });
    if (!t) throw new NotFoundException();
    return t;
  }

  /** User's installed reports with template joined */
  @Get('installed')
  async installed(@Req() req: any) {
    return this.prisma.installedReport.findMany({
      where: { userId: req.user.userId },
      include: { template: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Install a report — upsert */
  @Post('install')
  async install(@Req() req: any, @Body() body: { templateId: string }) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id: body.templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.installedReport.upsert({
      where: {
        userId_templateId: {
          userId: req.user.userId,
          templateId: body.templateId,
        },
      },
      create: {
        userId: req.user.userId,
        templateId: body.templateId,
      },
      update: {},
      include: { template: true },
    });
  }

  /** Uninstall a report */
  @Delete('installed/:id')
  async uninstall(@Req() req: any, @Param('id') id: string) {
    const report = await this.prisma.installedReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException();
    if (report.userId !== req.user.userId) throw new ForbiddenException();

    await this.prisma.installedReport.delete({ where: { id } });
    return { ok: true };
  }

  /** Report data: resolved slots + chart data */
  @Get('installed/:id/data')
  async data(
    @Req() req: any,
    @Param('id') id: string,
    @Query('days') daysStr?: string,
  ) {
    const report = await this.prisma.installedReport.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!report) throw new NotFoundException();
    if (report.userId !== req.user.userId) throw new ForbiddenException();

    const days = parseInt(daysStr || '90', 10);
    const end = new Date();
    const start = days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

    const [slots, chartData] = await Promise.all([
      this.reportEngine.resolveSlots(req.user.userId, report.template),
      this.reportEngine.getChartData(req.user.userId, report.template, { start, end }),
    ]);

    // Build charts keyed by chart id from template definition
    const charts: Record<string, any> = {};
    const templateDef = (report.template.definition as any) ?? {};
    const chartDefs: any[] = templateDef.charts || [];
    for (const def of chartDefs) {
      charts[def.id] = chartData;
    }

    // Merge definition fields (charts, requires, etc.) into top-level report object
    // so the frontend can access report.charts, report.name, etc. uniformly
    const { definition, ...templateBase } = report.template as any;
    return {
      report: { ...templateBase, ...templateDef },
      slots,
      charts,
    };
  }
}

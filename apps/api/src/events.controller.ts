import { SessionAuthGuard } from './auth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('/events')
@UseGuards(SessionAuthGuard)
export class EventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('workspaceId') workspaceId?: string,
    @Query('tag') tag?: string,
    @Query('q') q?: string,
    @Query('limit') limitRaw?: string,
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(Number(limitRaw ?? 50) || 50, 1), 200);

    // default workspace: first one
    const wsId = workspaceId ?? (await this.prisma.workspace.findFirst({ select: { id: true } }))?.id;
    if (!wsId) return { items: [], nextCursor: null };

    const where: any = { workspaceId: wsId };

    if (q) {
      where.content = { contains: q, mode: 'insensitive' };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
            workspaceId: wsId,
          },
        },
      };
    }

    const items = await this.prisma.event.findMany({
      where,
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return {
      items: page.map((e: any) => ({
        id: e.id as string,
        occurredAt: e.occurredAt as Date,
        content: e.content as string,
        source: e.source as string | null,
        sourceRef: e.sourceRef as string | null,
        tags: (e.tags as any[]).map((t: any) => t.tag.name as string),
      })),
      nextCursor,
    };
  }
}

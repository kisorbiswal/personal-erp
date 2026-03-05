import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionAuthGuard } from './auth.guard';

@Controller('/feed')
@UseGuards(SessionAuthGuard)
export class FeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Req() req: any,
    @Query('limit') limitRaw?: string,
    @Query('cursor') cursor?: string,
    @Query('includeDone') includeDoneRaw?: string,
  ) {
    const userId = req.user.userId as string;
    const limit = Math.min(Math.max(Number(limitRaw ?? 50) || 50, 1), 200);
    const includeDone = includeDoneRaw === 'true' || includeDoneRaw === '1';

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (!includeDone) {
      where.NOT = [
        {
          tags: {
            some: {
              tag: {
                userId,
                name: 'done',
              },
            },
          },
        },
      ];
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
        tags: { include: { tag: true } },
      },
    });

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return {
      items: page.map((e: any) => ({
        id: e.id,
        occurredAt: e.occurredAt,
        content: e.content,
        tags: (e.tags as any[]).map((t: any) => t.tag.name),
      })),
      nextCursor,
    };
  }
}

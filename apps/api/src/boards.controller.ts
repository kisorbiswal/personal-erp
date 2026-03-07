import { SessionAuthGuard } from './auth.guard';
import { Body, Controller, Get, Param, Post, Patch, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';

type BoardSectionQuery = {
  tagsAny?: string[];
  tagsMatch?: 'any' | 'all';
  tagsNot?: string[];
  q?: string;
  limit?: number;
  sort?: 'occurredAtDesc' | 'occurredAtAsc';
  staleDays?: number; // filter items older than N days (based on occurredAt)
  pinnedOnly?: boolean;
  includeDone?: boolean;
};

type BoardConfigV1 = {
  version: 1;

  // Preferred naming: boards are collections of columns
  columns?: Array<{
    id: string;
    title: string;
    query: BoardSectionQuery;
    render: { type: 'list' | 'kanban' | 'chart' };
  }>;

  // Backward compat (older configs)
  sections?: Array<{
    id: string;
    title: string;
    query: BoardSectionQuery;
    render: { type: 'list' | 'kanban' | 'chart' };
  }>;
};

@Controller('/boards')
@UseGuards(SessionAuthGuard)
export class BoardsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any) {
    const userId = req.user.userId as string;

    const boards = await this.prisma.board.findMany({
      where: { userId },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, updatedAt: true },
    });

    return { items: boards };
  }

  @Get('/:id')
  async get(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId as string;

    const board = await this.prisma.board.findFirst({ where: { id, userId } });
    if (!board) return { error: 'not_found' };
    return { id: board.id, name: board.name, config: board.config, updatedAt: board.updatedAt };
  }

  @Post()
  async create(@Req() req: any, @Body() body: { name: string; config?: BoardConfigV1 }) {
    const userId = req.user.userId as string;

    const config: BoardConfigV1 =
      body.config ??
      ({
        version: 1,
        // Default: start with one empty column so user can immediately pick tags.
        columns: [
          {
            id: `col:${Date.now()}`,
            title: '',
            query: { tagsAny: [], tagsMatch: 'any', includeDone: false, limit: 50 },
            render: { type: 'list' },
          },
        ],
      } satisfies BoardConfigV1);

    const created = await this.prisma.board.create({
      data: {
        userId,
        name: body.name,
        config,
      },
      select: { id: true, name: true, config: true },
    });

    return created;
  }


  @Patch('/:id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; config?: BoardConfigV1 },
  ) {
    const userId = req.user.userId as string;

    const board = await this.prisma.board.findFirst({ where: { id, userId } });
    if (!board) return { error: 'not_found' };

    const updated = await this.prisma.board.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        config: body.config ?? undefined,
      },
      select: { id: true, name: true, config: true, updatedAt: true },
    });

    return updated;
  }

  @Post('/:id/run')
  async run(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { includeDone?: boolean; cursors?: Record<string, string> } = {},
  ) {
    const userId = req.user.userId as string;

    const board = await this.prisma.board.findFirst({ where: { id, userId } });
    if (!board) return { error: 'not_found' };

    const config = board.config as BoardConfigV1;
    const columns = config.columns ?? config.sections ?? [];

    // Fetch pinned events once (so sections can reuse)
    const pins = await this.prisma.boardPin.findMany({
      where: { boardId: board.id },
      select: { eventId: true },
    });
    const pinnedEventIds = new Set(pins.map((p) => p.eventId));

    const results = [] as any[];

    for (const section of columns) {
      const limit = Math.min(Math.max(section.query?.limit ?? 50, 1), 200);

      const where: any = {
        userId: board.userId,
        deletedAt: null,
      };

      // Always hide done items by default unless explicitly included
      const includeDoneOverride = body?.includeDone === true;
      const hideDone = includeDoneOverride ? false : (section.query?.includeDone ? false : true);

      // Compute hidden-done count for this section (so UI can show "X hidden")
      let hiddenDoneCount = 0;
      if (hideDone) {
        const doneOnlyWhere: any = {
          userId: board.userId,
          deletedAt: null,
          // must have done tag
          tags: {
            some: {
              tag: { userId: board.userId, name: 'done' },
            },
          },
        };

        // apply the same filters as this section (except for the NOT done filter)
        if (section.query?.q) {
          doneOnlyWhere.content = { contains: section.query.q, mode: 'insensitive' };
        }
        if (section.query?.staleDays && section.query.staleDays > 0) {
          const cutoff = new Date(Date.now() - section.query.staleDays * 24 * 60 * 60 * 1000);
          doneOnlyWhere.occurredAt = { lt: cutoff };
        }
        if (section.query?.pinnedOnly) {
          doneOnlyWhere.id = { in: [...pinnedEventIds] };
        }
        if (section.query?.tagsNot?.length) {
          doneOnlyWhere.NOT = (doneOnlyWhere.NOT ?? []).concat([
            {
              tags: {
                some: {
                  tag: {
                    userId: board.userId,
                    name: { in: section.query.tagsNot },
                  },
                },
              },
            },
          ]);
        }
        if (section.query?.tagsAny?.length) {
          const match = section.query?.tagsMatch ?? 'any';
          const tags = section.query.tagsAny;
          if (match === 'all') {
            doneOnlyWhere.AND = (doneOnlyWhere.AND ?? []).concat(
              tags.map((t) => ({
                tags: {
                  some: {
                    tag: { userId: board.userId, name: t },
                  },
                },
              })),
            );
          } else {
            doneOnlyWhere.AND = (doneOnlyWhere.AND ?? []).concat([
              {
                tags: {
                  some: {
                    tag: {
                      userId: board.userId,
                      name: { in: tags },
                    },
                  },
                },
              },
            ]);
          }
        }

        hiddenDoneCount = await this.prisma.event.count({ where: doneOnlyWhere });

        // hide done in actual item query
        where.NOT = (where.NOT ?? []).concat([
          {
            tags: {
              some: {
                tag: { userId: board.userId, name: 'done' },
              },
            },
          },
        ]);
      }

      if (section.query?.q) {
        where.content = { contains: section.query.q, mode: 'insensitive' };
      }

      if (section.query?.staleDays && section.query.staleDays > 0) {
        const cutoff = new Date(Date.now() - section.query.staleDays * 24 * 60 * 60 * 1000);
        where.occurredAt = { lt: cutoff };
      }

      if (section.query?.pinnedOnly) {
        where.id = { in: [...pinnedEventIds] };
      }

      if (section.query?.tagsNot?.length) {
        where.NOT = (where.NOT ?? []).concat([
          {
            tags: {
              some: {
                tag: {
                  userId: board.userId,
                  name: { in: section.query.tagsNot },
                },
              },
            },
          },
        ]);
      }

      if (section.query?.tagsAny?.length) {
        const match = section.query?.tagsMatch ?? 'any';
        const tags = section.query.tagsAny;
        if (match === 'all') {
          where.AND = (where.AND ?? []).concat(
            tags.map((t) => ({
              tags: {
                some: {
                  tag: {
                    userId: board.userId,
                    name: t,
                  },
                },
              },
            })),
          );
        } else {
          where.tags = {
            some: {
              tag: {
                userId: board.userId,
                name: { in: tags },
              },
            },
          };
        }
      }

      const sortDesc = (section.query?.sort ?? 'occurredAtDesc') !== 'occurredAtAsc';
      const orderBy: any = sortDesc
        ? [{ occurredAt: 'desc' }, { id: 'desc' }]
        : [{ occurredAt: 'asc' }, { id: 'asc' }];

      // Apply cursor-based pagination if provided
      const cursorStr = body?.cursors?.[section.id];
      if (cursorStr) {
        try {
          const decoded = Buffer.from(cursorStr, 'base64').toString('utf-8');
          // Format: "2024-01-01T12:30:00.000Z:cuid123"
          // Date ends with Z, then colon, then id
          const zColonIdx = decoded.indexOf('Z:');
          if (zColonIdx !== -1) {
            const cursorOccurredAt = new Date(decoded.substring(0, zColonIdx + 1));
            const cursorId = decoded.substring(zColonIdx + 2);

            if (sortDesc) {
              // For DESC: items where occurredAt < cursor OR (occurredAt == cursor AND id < cursorId)
              where.AND = (where.AND ?? []).concat([
                {
                  OR: [
                    { occurredAt: { lt: cursorOccurredAt } },
                    {
                      AND: [
                        { occurredAt: { equals: cursorOccurredAt } },
                        { id: { lt: cursorId } },
                      ],
                    },
                  ],
                },
              ]);
            } else {
              // For ASC: items where occurredAt > cursor OR (occurredAt == cursor AND id > cursorId)
              where.AND = (where.AND ?? []).concat([
                {
                  OR: [
                    { occurredAt: { gt: cursorOccurredAt } },
                    {
                      AND: [
                        { occurredAt: { equals: cursorOccurredAt } },
                        { id: { gt: cursorId } },
                      ],
                    },
                  ],
                },
              ]);
            }
          }
        } catch {
          // Invalid cursor — ignore
        }
      }

      const items = await this.prisma.event.findMany({
        where,
        orderBy,
        take: limit,
        include: {
          tags: { include: { tag: true } },
        },
      });

      // Build nextCursor from last item (null if fewer items than limit returned)
      let nextCursor: string | null = null;
      if (items.length >= limit) {
        const last = items[items.length - 1];
        const raw = `${(last.occurredAt as Date).toISOString()}:${last.id}`;
        nextCursor = Buffer.from(raw).toString('base64');
      }

      results.push({
        id: section.id,
        title: section.title,
        render: section.render,
        hiddenDoneCount,
        nextCursor,
        items: items.map((e: any) => ({
          id: e.id,
          occurredAt: e.occurredAt,
          content: e.content,
          tags: (e.tags as any[]).map((t: any) => t.tag.name),
          pinned: pinnedEventIds.has(e.id),
        })),
      });
    }

    return {
      board: { id: board.id, name: board.name },
      sections: results,
    };
  }

  @Post('/:id/pins')
  async pin(@Param('id') boardId: string, @Body() body: { eventId: string }) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return { error: 'not_found' };

    const pin = await this.prisma.boardPin.upsert({
      where: { boardId_eventId: { boardId, eventId: body.eventId } },
      update: {},
      create: { boardId, eventId: body.eventId },
    });

    return { ok: true, pin };
  }

  @Post('/:id/unpins')
  async unpin(@Param('id') boardId: string, @Body() body: { eventId: string }) {
    await this.prisma.boardPin.deleteMany({ where: { boardId, eventId: body.eventId } });
    return { ok: true };
  }
}

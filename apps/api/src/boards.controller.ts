import { SessionAuthGuard } from './auth.guard';
import { Body, Controller, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';

type BoardSectionQuery = {
  tagsAny?: string[];
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
  sections: Array<{
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
  async list() {
    const wsId = (await this.prisma.workspace.findFirst({ select: { id: true } }))?.id;
    if (!wsId) return { items: [] };

    const boards = await this.prisma.board.findMany({
      where: { workspaceId: wsId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, updatedAt: true },
    });

    return { items: boards };
  }

  @Get('/:id')
  async get(@Param('id') id: string) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) return { error: 'not_found' };
    return { id: board.id, name: board.name, config: board.config, updatedAt: board.updatedAt };
  }

  @Post()
  async create(@Body() body: { name: string; config?: BoardConfigV1 }) {
    const wsId = (await this.prisma.workspace.findFirst({ select: { id: true } }))?.id;
    if (!wsId) return { error: 'no_workspace' };

    const config: BoardConfigV1 =
      body.config ??
      ({
        version: 1,
        sections: [],
      } satisfies BoardConfigV1);

    const created = await this.prisma.board.create({
      data: {
        workspaceId: wsId,
        name: body.name,
        config,
      },
      select: { id: true, name: true, config: true },
    });

    return created;
  }


  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; config?: BoardConfigV1 },
  ) {
    const board = await this.prisma.board.findUnique({ where: { id } });
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
  async run(@Param('id') id: string) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) return { error: 'not_found' };

    const config = board.config as BoardConfigV1;
    const sections = config.sections ?? [];

    // Fetch pinned events once (so sections can reuse)
    const pins = await this.prisma.boardPin.findMany({
      where: { boardId: board.id },
      select: { eventId: true },
    });
    const pinnedEventIds = new Set(pins.map((p) => p.eventId));

    const results = [] as any[];

    for (const section of sections) {
      const limit = Math.min(Math.max(section.query?.limit ?? 50, 1), 200);

      const where: any = {
        workspaceId: board.workspaceId,
      };

      // Always hide done items by default unless explicitly included
      const hideDone = section.query?.includeDone ? false : true;
      if (hideDone) {
        where.NOT = (where.NOT ?? []).concat([
          {
            tags: {
              some: {
                tag: { workspaceId: board.workspaceId, name: 'done' },
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
                  workspaceId: board.workspaceId,
                  name: { in: section.query.tagsNot },
                },
              },
            },
          },
        ]);
      }

      if (section.query?.tagsAny?.length) {
        where.tags = {
          some: {
            tag: {
              workspaceId: board.workspaceId,
              name: { in: section.query.tagsAny },
            },
          },
        };
      }

      const orderBy: any =
        section.query?.sort === 'occurredAtAsc'
          ? [{ occurredAt: 'asc' }, { id: 'asc' }]
          : [{ occurredAt: 'desc' }, { id: 'desc' }];

      const items = await this.prisma.event.findMany({
        where,
        orderBy,
        take: limit,
        include: {
          tags: { include: { tag: true } },
        },
      });

      results.push({
        id: section.id,
        title: section.title,
        render: section.render,
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

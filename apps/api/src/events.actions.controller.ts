import { Body, Controller, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionAuthGuard } from './auth.guard';

@Controller('/events')
@UseGuards(SessionAuthGuard)
export class EventsActionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { content: string; occurredAt?: string; tags?: string[] },
  ) {
    const userId = req.user.userId as string;

    const content = (body.content || '').trim();
    if (!content) return { error: 'content_required' };

    const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();
    const tagNames = Array.from(
      new Set((body.tags || []).map((t) => String(t || '').trim().toLowerCase()).filter(Boolean)),
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const ev = await tx.event.create({
        data: {
          userId,
          occurredAt,
          content,
          source: 'ui',
          sourceRef: null,
        },
        select: { id: true, occurredAt: true, content: true },
      });

      if (tagNames.length) {
        for (const name of tagNames) {
          const tag = await tx.tag.upsert({
            where: { userId_name: { userId, name } },
            update: {},
            create: { userId, name },
            select: { id: true, name: true },
          });

          await tx.eventTag.create({
            data: { eventId: ev.id, tagId: tag.id },
          }).catch(() => undefined);
        }
      }

      return ev;
    });

    return { ok: true, event: created };
  }

  @Patch('/:id')
  async updateContent(@Req() req: any, @Param('id') id: string, @Body() body: { content: string }) {
    const userId = req.user.userId as string;

    const updated = await this.prisma.event.updateMany({
      where: { id, userId },
      data: { content: body.content },
    });

    if (updated.count === 0) return { error: 'not_found' };

    const ev = await this.prisma.event.findFirst({ where: { id, userId }, select: { id: true, content: true, occurredAt: true } });
    return ev;
  }

  @Post('/bulk/delete')
  async bulkDelete(@Req() req: any, @Body() body: { eventIds: string[] }) {
    const userId = req.user.userId as string;
    const res = await this.prisma.event.updateMany({
      where: { userId, id: { in: body.eventIds || [] } },
      data: { deletedAt: new Date() },
    });
    return { ok: true, deleted: res.count };
  }

  @Post('/bulk/restore')
  async bulkRestore(@Req() req: any, @Body() body: { eventIds: string[] }) {
    const userId = req.user.userId as string;
    const res = await this.prisma.event.updateMany({
      where: { userId, id: { in: body.eventIds || [] } },
      data: { deletedAt: null },
    });
    return { ok: true, restored: res.count };
  }

  @Post('/bulk/hard-delete')
  async bulkHardDelete(@Req() req: any, @Body() body: { eventIds: string[] }) {
    const userId = req.user.userId as string;
    const ids = body.eventIds || [];
    if (!ids.length) return { ok: true, deleted: 0 };

    // Verify all events belong to this user before hard deleting
    const owned = await this.prisma.event.findMany({
      where: { userId, id: { in: ids } },
      select: { id: true },
    });
    const ownedIds = owned.map((e) => e.id);

    // Delete EventTags first (FK constraint)
    await this.prisma.eventTag.deleteMany({ where: { eventId: { in: ownedIds } } });

    // Hard delete
    const res = await this.prisma.event.deleteMany({ where: { id: { in: ownedIds } } });

    return { ok: true, deleted: res.count };
  }

  @Post('/bulk/tags/add')
  async bulkAddTag(@Req() req: any, @Body() body: { eventIds: string[]; tag: string }) {
    const userId = req.user.userId as string;

    const tagName = (body.tag || '').trim().toLowerCase();
    if (!tagName) return { error: 'tag_required' };

    const tag = await this.prisma.tag.upsert({
      where: { userId_name: { userId, name: tagName } },
      update: {},
      create: { userId, name: tagName },
    });

    const eventIds = body.eventIds || [];

    let added = 0;
    for (const eventId of eventIds) {
      // Enforce ownership
      const ev = await this.prisma.event.findFirst({ where: { id: eventId, userId }, select: { id: true } });
      if (!ev) continue;

      try {
        await this.prisma.eventTag.create({ data: { eventId, tagId: tag.id } });
        added++;
      } catch {
        // ignore duplicates
      }
    }

    return { ok: true, added };
  }

  @Post('/bulk/tags/remove')
  async bulkRemoveTag(@Req() req: any, @Body() body: { eventIds: string[]; tag: string }) {
    const userId = req.user.userId as string;

    const tagName = (body.tag || '').trim().toLowerCase();
    if (!tagName) return { error: 'tag_required' };

    const tag = await this.prisma.tag.findUnique({
      where: { userId_name: { userId, name: tagName } },
      select: { id: true },
    });
    if (!tag) return { ok: true, removed: 0 };

    const ownedEventIds = (
      await this.prisma.event.findMany({
        where: { userId, id: { in: body.eventIds || [] } },
        select: { id: true },
      })
    ).map((e) => e.id);

    const res = await this.prisma.eventTag.deleteMany({
      where: { tagId: tag.id, eventId: { in: ownedEventIds } },
    });

    return { ok: true, removed: res.count };
  }
}

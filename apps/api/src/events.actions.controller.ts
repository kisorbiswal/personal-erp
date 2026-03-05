import { Body, Controller, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionAuthGuard } from './auth.guard';

@Controller('/events')
@UseGuards(SessionAuthGuard)
export class EventsActionsController {
  constructor(private readonly prisma: PrismaService) {}

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

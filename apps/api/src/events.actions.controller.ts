import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionAuthGuard } from './auth.guard';

@Controller('/events')
@UseGuards(SessionAuthGuard)
export class EventsActionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('/:id')
  async updateContent(@Param('id') id: string, @Body() body: { content: string }) {
    const updated = await this.prisma.event.update({
      where: { id },
      data: { content: body.content },
      select: { id: true, content: true, occurredAt: true },
    });
    return updated;
  }

  @Post('/bulk/delete')
  async bulkDelete(@Body() body: { eventIds: string[] }) {
    const res = await this.prisma.event.updateMany({
      where: { id: { in: body.eventIds || [] } },
      data: { deletedAt: new Date() },
    });
    return { ok: true, deleted: res.count };
  }

  @Post('/bulk/restore')
  async bulkRestore(@Body() body: { eventIds: string[] }) {
    const res = await this.prisma.event.updateMany({
      where: { id: { in: body.eventIds || [] } },
      data: { deletedAt: null },
    });
    return { ok: true, restored: res.count };
  }

  @Post('/bulk/tags/add')
  async bulkAddTag(@Body() body: { eventIds: string[]; tag: string }) {
    const ws = await this.prisma.workspace.findFirst({ select: { id: true } });
    if (!ws) return { error: 'no_workspace' };

    const tag = await this.prisma.tag.upsert({
      where: { workspaceId_name: { workspaceId: ws.id, name: body.tag } },
      update: {},
      create: { workspaceId: ws.id, name: body.tag },
    });

    let added = 0;
    for (const eventId of body.eventIds || []) {
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
  async bulkRemoveTag(@Body() body: { eventIds: string[]; tag: string }) {
    const ws = await this.prisma.workspace.findFirst({ select: { id: true } });
    if (!ws) return { error: 'no_workspace' };

    const tag = await this.prisma.tag.findUnique({
      where: { workspaceId_name: { workspaceId: ws.id, name: body.tag } },
      select: { id: true },
    });
    if (!tag) return { ok: true, removed: 0 };

    const res = await this.prisma.eventTag.deleteMany({
      where: { tagId: tag.id, eventId: { in: body.eventIds || [] } },
    });

    return { ok: true, removed: res.count };
  }
}

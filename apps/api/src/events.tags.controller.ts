import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionAuthGuard } from './auth.guard';

@Controller('/events')
@UseGuards(SessionAuthGuard)
export class EventsTagsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/:id/tags/add')
  async addTag(@Param('id') id: string, @Body() body: { tag: string }) {
    const ws = await this.prisma.workspace.findFirst({ select: { id: true } });
    if (!ws) return { error: 'no_workspace' };

    const tagName = (body.tag || '').trim().toLowerCase();
    if (!tagName) return { error: 'tag_required' };

    const ev = await this.prisma.event.findUnique({ where: { id }, select: { id: true, deletedAt: true } });
    if (!ev || ev.deletedAt) return { error: 'not_found' };

    const tag = await this.prisma.tag.upsert({
      where: { workspaceId_name: { workspaceId: ws.id, name: tagName } },
      update: {},
      create: { workspaceId: ws.id, name: tagName },
    });

    try {
      await this.prisma.eventTag.create({ data: { eventId: id, tagId: tag.id } });
    } catch {
      // ignore duplicates
    }

    return { ok: true, tag: tagName };
  }

  @Post('/:id/tags/remove')
  async removeTag(@Param('id') id: string, @Body() body: { tag: string }) {
    const ws = await this.prisma.workspace.findFirst({ select: { id: true } });
    if (!ws) return { error: 'no_workspace' };

    const tagName = (body.tag || '').trim().toLowerCase();
    if (!tagName) return { error: 'tag_required' };

    const tag = await this.prisma.tag.findUnique({
      where: { workspaceId_name: { workspaceId: ws.id, name: tagName } },
      select: { id: true },
    });
    if (!tag) return { ok: true, removed: 0 };

    const res = await this.prisma.eventTag.deleteMany({ where: { eventId: id, tagId: tag.id } });
    return { ok: true, removed: res.count, tag: tagName };
  }
}

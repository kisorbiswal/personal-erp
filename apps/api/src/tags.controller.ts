import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('/tags')
export class TagsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('workspaceId') workspaceId?: string, @Query('limit') limitRaw?: string) {
    const limit = Math.min(Math.max(Number(limitRaw ?? 200) || 200, 1), 2000);
    const wsId = workspaceId ?? (await this.prisma.workspace.findFirst({ select: { id: true } }))?.id;
    if (!wsId) return { items: [] };

    const tags = await this.prisma.tag.findMany({
      where: { workspaceId: wsId },
      orderBy: { name: 'asc' },
      take: limit,
      include: { _count: { select: { eventTags: true } } },
    });

    return {
      items: tags.map((t: any) => ({ id: t.id as string, name: t.name as string, count: t._count.eventTags as number })),
    };
  }
}

import { SessionAuthGuard } from './auth.guard';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('/tags')
@UseGuards(SessionAuthGuard)
export class TagsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any, @Query('limit') limitRaw?: string) {
    const userId = req.user.userId as string;
    const limit = Math.min(Math.max(Number(limitRaw ?? 200) || 200, 1), 2000);

    const tags = await this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      take: limit,
      include: { _count: { select: { eventTags: true } } },
    });

    return {
      items: tags.map((t: any) => ({ id: t.id as string, name: t.name as string, count: t._count.eventTags as number })),
    };
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionAuthGuard } from './auth.guard';

@Controller('/boards')
@UseGuards(SessionAuthGuard)
export class BoardsReorderController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/reorder')
  async reorder(@Body() body: { ids: string[] }) {
    const wsId = (await this.prisma.workspace.findFirst({ select: { id: true } }))?.id;
    if (!wsId) return { error: 'no_workspace' };

    const ids = body.ids || [];
    // set position = index
    for (let i = 0; i < ids.length; i++) {
      await this.prisma.board.updateMany({
        where: { id: ids[i], workspaceId: wsId },
        data: { position: i },
      });
    }

    return { ok: true };
  }
}

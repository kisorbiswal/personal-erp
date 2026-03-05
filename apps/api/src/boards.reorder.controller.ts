import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionAuthGuard } from './auth.guard';

@Controller('/boards')
@UseGuards(SessionAuthGuard)
export class BoardsReorderController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/reorder')
  async reorder(@Req() req: any, @Body() body: { ids: string[] }) {
    const userId = req.user.userId as string;

    const ids = body.ids || [];
    // set position = index
    for (let i = 0; i < ids.length; i++) {
      await this.prisma.board.updateMany({
        where: { id: ids[i], userId },
        data: { position: i },
      });
    }

    return { ok: true };
  }
}

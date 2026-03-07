import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import TelegramBot = require('node-telegram-bot-api');
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from './prisma.service';

const APP_USER_ID = 'ebab9ce0-ce1a-4718-aecf-8111abbb4a3b';

interface ListState {
  tag: string | null;  // null means "all tags"
  offset: number;
  // ids from the last list (for done/delete)
  ids: string[];
}

function getBotToken(): string {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;

  // Fallback: read from project root .env
  // dist/telegram.service.js → 3 levels up → project root
  const envPath = path.join(__dirname, '..', '..', '..', '.env');
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^TELEGRAM_BOT_TOKEN=(.+)$/m);
      if (match) return match[1].trim();
    }
  } catch {
    // ignore
  }
  return '';
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;

  // Per-user last list state
  private userListState = new Map<string, ListState>();

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const token = getBotToken();
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — Telegram bot disabled');
      return;
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.logger.log('Telegram bot started (long-polling)');

    this.bot!.on('message', (msg: TelegramBot.Message) => {
      this.handleMessage(msg).catch((err: unknown) => {
        this.logger.error('Error handling Telegram message', err);
      });
    });

    this.bot!.on('polling_error', (err: Error) => {
      this.logger.error('Polling error', err.message);
    });
  }

  onModuleDestroy() {
    if (this.bot) {
      this.bot.stopPolling().catch(() => {});
      this.bot = null;
    }
  }

  private reply(chatId: number, text: string, html = false) {
    return this.bot?.sendMessage(chatId, text, html ? { parse_mode: 'HTML' } : {});
  }

  private static escHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private async handleMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const userId = String(msg.from?.id ?? chatId);
    const raw = (msg.text || '').trim();

    if (!raw) return;

    // /help or /start
    if (/^\/?(help|start)$/i.test(raw)) {
      await this.reply(
        chatId,
        `<b>MyLoggerBot commands:</b>\n• <code>tag: info text</code> — add event with tag\n• <code>L tag</code> or <code>/l tag</code> — list last 10 events with tag\n• <code>L</code> — list last 10 events (any tag)\n• <code>/moreN</code> — next page from offset N (e.g. /more10)\n• <code>tags</code> — list all tags with counts\n• <code>done 1,2</code> — mark items 1,2 from last list as done\n• <code>delete 1,2</code> — soft-delete items 1,2 from last list\n• <code>undo</code> — delete most recently created event`,
        true,
      );
      return;
    }

    // tag: info text
    const addMatch = raw.match(/^([^:]+):\s+(.+)$/s);
    if (addMatch) {
      const tag = addMatch[1].trim().toLowerCase();
      const content = addMatch[2].trim();
      await this.createEvent(chatId, userId, tag, content);
      return;
    }

    // L tag or /l tag or L (no tag)
    const listMatch = raw.match(/^\/?(l)\s+(.+)$/i) || raw.match(/^\/?(l)$/i);
    if (listMatch) {
      const tag = listMatch[2]?.trim().toLowerCase() || null;
      await this.listEvents(chatId, userId, tag, 0);
      return;
    }

    // /moreN
    const moreMatch = raw.match(/^\/more(\d+)$/i);
    if (moreMatch) {
      const offset = parseInt(moreMatch[1], 10);
      const state = this.userListState.get(userId);
      const tag = state?.tag ?? null;
      await this.listEvents(chatId, userId, tag, offset);
      return;
    }

    // tags
    if (/^tags?$/i.test(raw)) {
      await this.listTags(chatId);
      return;
    }

    // done 1,2
    const doneMatch = raw.match(/^done\s+([\d,\s]+)$/i);
    if (doneMatch) {
      const nums = doneMatch[1].split(',').map((n: string) => parseInt(n.trim(), 10)).filter((n: number) => !isNaN(n));
      await this.markDone(chatId, userId, nums);
      return;
    }

    // delete 1,2
    const delMatch = raw.match(/^delete\s+([\d,\s]+)$/i);
    if (delMatch) {
      const nums = delMatch[1].split(',').map((n: string) => parseInt(n.trim(), 10)).filter((n: number) => !isNaN(n));
      await this.deleteItems(chatId, userId, nums);
      return;
    }

    // undo
    if (/^undo$/i.test(raw)) {
      await this.undo(chatId, userId);
      return;
    }

    // Unrecognized — show hint
    await this.reply(chatId, 'Unknown command. Send /help for usage.');
  }

  private async createEvent(chatId: number, userId: string, tag: string, content: string) {
    // Get or create the tag
    const tagRecord = await this.prisma.tag.upsert({
      where: { userId_name: { userId: APP_USER_ID, name: tag } },
      create: { userId: APP_USER_ID, name: tag },
      update: {},
    });

    const event = await this.prisma.event.create({
      data: {
        userId: APP_USER_ID,
        content,
        occurredAt: new Date(),
        source: 'telegram',
        sourceRef: String(userId),
        tags: {
          create: [{ tagId: tagRecord.id }],
        },
      },
    });

    await this.reply(chatId, `You successfully added: ${content} to '${tag}'.`);
  }

  private async listEvents(chatId: number, userId: string, tag: string | null, offset: number) {
    const limit = 10;

    const where: any = {
      userId: APP_USER_ID,
      deletedAt: null,
    };

    if (tag) {
      where.tags = {
        some: { tag: { userId: APP_USER_ID, name: tag } },
      };
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: offset,
      include: { tags: { include: { tag: true } } },
    });

    if (events.length === 0) {
      await this.reply(chatId, tag ? `No events found for tag '${tag}'.` : 'No events found.');
      return;
    }

    // Save state for /more and done/delete
    const ids = events.map((e) => e.id);
    this.userListState.set(userId, { tag, offset, ids });

    const header = tag ? `Fetching info with tag '${tag}':` : 'Fetching recent events:';
    const lines = events.map((e, i) => `${offset + i + 1}. ${e.content}`);
    const nextOffset = offset + events.length;
    const footer = events.length >= limit ? `Click /more${nextOffset} to get more.` : '';

    const text = [header, ...lines, footer].filter(Boolean).join('\n');
    await this.reply(chatId, text);
  }

  private async listTags(chatId: number) {
    const tags = await this.prisma.tag.findMany({
      where: { userId: APP_USER_ID },
      include: {
        _count: { select: { eventTags: true } },
      },
      orderBy: { eventTags: { _count: 'desc' } },
    });

    if (!tags.length) {
      await this.reply(chatId, 'No tags yet.');
      return;
    }

    const lines = tags
      .filter((t) => (t._count?.eventTags ?? 0) > 0)
      .slice(0, 50)
      .map((t, i) => `${i + 1}. ${t.name} (${t._count?.eventTags ?? 0})`);

    await this.reply(chatId, lines.join('\n') || 'No tags with events.');
  }

  private async markDone(chatId: number, userId: string, nums: number[]) {
    const state = this.userListState.get(userId);
    if (!state || !state.ids.length) {
      await this.reply(chatId, 'No recent list to reference. Run L first.');
      return;
    }

    const doneTag = await this.prisma.tag.upsert({
      where: { userId_name: { userId: APP_USER_ID, name: 'done' } },
      create: { userId: APP_USER_ID, name: 'done' },
      update: {},
    });

    let count = 0;
    for (const num of nums) {
      const idx = num - 1 - state.offset;
      if (idx < 0 || idx >= state.ids.length) continue;
      const eventId = state.ids[idx];
      await this.prisma.eventTag.upsert({
        where: { eventId_tagId: { eventId, tagId: doneTag.id } },
        create: { eventId, tagId: doneTag.id },
        update: {},
      });
      count++;
    }

    await this.reply(chatId, `Marked ${count} item(s) as done.`);
  }

  private async deleteItems(chatId: number, userId: string, nums: number[]) {
    const state = this.userListState.get(userId);
    if (!state || !state.ids.length) {
      await this.reply(chatId, 'No recent list to reference. Run L first.');
      return;
    }

    let count = 0;
    for (const num of nums) {
      const idx = num - 1 - state.offset;
      if (idx < 0 || idx >= state.ids.length) continue;
      const eventId = state.ids[idx];
      await this.prisma.event.update({
        where: { id: eventId },
        data: { deletedAt: new Date() },
      });
      count++;
    }

    await this.reply(chatId, `Deleted ${count} item(s).`);
  }

  private async undo(chatId: number, userId: string) {
    // Find the most recently created event (not yet deleted)
    const event = await this.prisma.event.findFirst({
      where: { userId: APP_USER_ID, deletedAt: null },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (!event) {
      await this.reply(chatId, 'Nothing to undo.');
      return;
    }

    await this.prisma.event.update({
      where: { id: event.id },
      data: { deletedAt: new Date() },
    });

    await this.reply(chatId, `Deleted: "${event.content}"`);
  }
}

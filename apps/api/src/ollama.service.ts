import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const APP_USER_ID = 'ebab9ce0-ce1a-4718-aecf-8111abbb4a3b';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'llama3.2:3b';

  constructor(private readonly prisma: PrismaService) {}

  async autoTag(content: string): Promise<string[]> {
    // Fetch user's tags ordered by usage
    const tags = await this.prisma.tag.findMany({
      where: { userId: APP_USER_ID },
      include: { _count: { select: { eventTags: true } } },
      orderBy: { eventTags: { _count: 'desc' } },
      take: 40,
    });

    if (!tags.length) return ['inbox'];

    const tagList = tags.map(t => t.name).join(', ');

    // Fetch a few recent examples from top tags so the model understands context
    const topTags = tags.slice(0, 8);
    const exampleLines: string[] = [];
    for (const tag of topTags) {
      const events = await this.prisma.event.findMany({
        where: {
          userId: APP_USER_ID,
          deletedAt: null,
          tags: { some: { tagId: tag.id } },
        },
        orderBy: { occurredAt: 'desc' },
        take: 3,
        select: { content: true },
      });
      if (events.length) {
        const samples = events.map(e => `"${e.content.replace(/\n/g, ' ').slice(0, 80)}"`).join(', ');
        exampleLines.push(`${tag.name}: ${samples}`);
      }
    }

    const prompt = `You are a personal journal tagger. Assign 1-3 relevant tags to the new entry below.

Available tags: ${tagList}

Examples from the user's existing entries:
${exampleLines.join('\n')}

New entry: "${content.replace(/\n/g, ' ').slice(0, 300)}"

Rules:
- Reply with ONLY tag names, comma-separated (e.g. "food, expense")
- Choose ONLY from the available tags list
- If nothing fits, reply with: inbox
- Do not explain or add any other text`;

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: { temperature: 0.1, num_predict: 20 },
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

      const data = await res.json() as { response?: string };
      const raw = (data.response || '').trim().toLowerCase();

      // Parse comma-separated tags, validate against known list
      const tagSet = new Set(tags.map(t => t.name));
      const returned = raw
        .split(/[,\s]+/)
        .map(t => t.trim().replace(/[^a-z0-9_-]/g, ''))
        .filter(t => t.length > 0 && tagSet.has(t));

      if (returned.length > 0) return [...new Set(returned)].slice(0, 3);

      this.logger.warn(`Ollama returned no valid tags for: "${content.slice(0, 50)}"`);
      return this.ruleBasedTag(content);
    } catch (err: any) {
      this.logger.warn(`Ollama unavailable (${err.message}), using rule-based fallback`);
      return this.ruleBasedTag(content);
    }
  }

  /** Fast rule-based fallback when Ollama is down */
  private ruleBasedTag(content: string): string[] {
    const lower = content.toLowerCase();
    const tags: string[] = [];
    if (/[₹$€£]|\brs\b|\brunee|\binr\b|\bpaid\b|\bbought\b|\bprice\b|\bspent\b/.test(lower)) tags.push('expense');
    if (/\d+\.?\d*\s*kg|\bweight\b|\bweighed\b/.test(lower)) tags.push('weight');
    if (/\beat\b|\blunch\b|\bdinner\b|\bbreakfast\b|\bfood\b|\brestaurant\b|\bcafe\b|\bsnack\b/.test(lower)) tags.push('food');
    if (/\bmeeting\b|\bcall\b|\bwork\b|\boffice\b|\bproject\b|\bstandup\b/.test(lower)) tags.push('work');
    if (/https?:\/\//.test(lower)) tags.push('link');
    if (/\bsleep\b|\bslept\b|\bwoke\b|\bnap\b/.test(lower)) tags.push('sleep');
    return tags.length > 0 ? tags : ['inbox'];
  }
}

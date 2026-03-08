import { Controller, Get } from '@nestjs/common';
import { Public } from './public.decorator';

@Public()
@Controller('/health')
export class HealthController {
  @Get()
  health() {
    const sha = (process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'unknown';

    // Use epoch ms so callers can render in their own local time.
    const builtAtMs = (() => {
      const raw = process.env.BUILD_TIME || process.env.VERCEL_BUILD_TIME || process.env.NEXT_PUBLIC_BUILD_TIME;
      const t = raw ? Date.parse(raw) : NaN;
      return Number.isFinite(t) ? t : Date.now();
    })();

    return { ok: true, sha, builtAtMs };
  }
}

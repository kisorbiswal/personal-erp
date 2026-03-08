import { Controller, Post, Req } from '@nestjs/common';
import { Public } from './public.decorator';

@Public()
@Controller('/auth')
export class AuthDevController {
  @Post('/dev-login')
  async devLogin(@Req() req: any) {
    // Only enable in non-production when explicitly configured.
    if (process.env.NODE_ENV === 'production') return { error: 'disabled' };
    if (process.env.DEV_LOGIN_ENABLED !== '1') return { error: 'disabled' };

    req.session.user = {
      userId: 'dev-user',
      email: 'dev@local',
      name: 'Dev User',
    };

    return { ok: true, user: req.session.user };
  }
}

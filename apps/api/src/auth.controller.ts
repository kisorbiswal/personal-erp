import { Controller, ExecutionContext, Get, Injectable, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';

// Custom callback guard: redirects to /?error=access_denied instead of throwing 500
@Injectable()
class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, _info: any, ctx: ExecutionContext) {
    if (err || !user) {
      const res = ctx.switchToHttp().getResponse();
      const uiOrigin = process.env.UI_ORIGIN || 'http://localhost:3001';
      res.redirect(`${uiOrigin}/?error=access_denied`);
      return null;
    }
    return user;
  }
}

@Public()   // All auth routes are public — they establish the session
@Controller('/auth')
export class AuthController {
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirects to google
  }

  @Get('/google/callback')
  @UseGuards(GoogleCallbackGuard)
  async googleCallback(@Req() req: any, @Res() res: any) {
    const uiOrigin = process.env.UI_ORIGIN || 'http://localhost:3001';
    // req.user is null if GoogleCallbackGuard already redirected (access denied)
    if (!req.user) return;
    req.session.user = req.user;
    return res.redirect(uiOrigin);
  }

  @Get('/me')
  async me(@Req() req: any) {
    return { user: req.session?.user ?? null };
  }

  @Get('/logout')
  async logout(@Req() req: any, @Res() res: any) {
    const uiOrigin = process.env.UI_ORIGIN || 'http://localhost:3001';
    req.session?.destroy(() => {
      res.clearCookie('life_session');
      res.redirect(uiOrigin);
    });
  }
}

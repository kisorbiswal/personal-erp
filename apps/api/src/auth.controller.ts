import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('/auth')
export class AuthController {
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirects to google
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const uiOrigin = process.env.UI_ORIGIN || 'http://localhost:3001';
    // passport strategy put user on req.user
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

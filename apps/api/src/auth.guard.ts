import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { SessionUser } from './auth.types';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest() as any;
    const user = (req.session?.user ?? null) as SessionUser | null;
    if (!user) throw new UnauthorizedException('not_authenticated');

    // Global safety switch: when enabled, only the owner email can access any
    // authenticated routes. This intentionally blocks other users even from
    // their own data.
    const panicLock = (process.env.PANIC_LOCK || '').toLowerCase();
    const isLocked = panicLock === '1' || panicLock === 'true' || panicLock === 'on';
    const ownerEmail = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
    if (isLocked && ownerEmail && (user.email || '').toLowerCase() !== ownerEmail) {
      throw new ForbiddenException('panic_locked');
    }

    req.user = user;
    return true;
  }
}

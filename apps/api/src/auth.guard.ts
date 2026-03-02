import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { SessionUser } from './auth.types';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest() as any;
    const user = (req.session?.user ?? null) as SessionUser | null;
    if (!user) throw new UnauthorizedException('not_authenticated');
    req.user = user;
    return true;
  }
}

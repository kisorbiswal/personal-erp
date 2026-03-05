import { SessionUser } from './auth.types';

export function requireSessionUser(req: any): SessionUser {
  const u = req?.session?.user as SessionUser | undefined;
  if (!u?.userId) throw new Error('not_authenticated');
  return u;
}

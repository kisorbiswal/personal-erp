import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { PrismaService } from './prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_ORIGIN || 'http://localhost:4000'}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error('Google profile missing email');

    const name = profile.displayName;

    const user = await this.prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });

    // Ensure workspace membership exists (single-workspace for now)
    const ws = await this.prisma.workspace.findFirst({ select: { id: true } });
    if (ws) {
      await this.prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId: ws.id, userId: user.id } },
        update: {},
        create: { workspaceId: ws.id, userId: user.id, role: 'OWNER' },
      });
    }

    return { userId: user.id, email: user.email, name: user.name };
  }
}

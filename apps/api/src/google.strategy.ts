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

    // Personal-only default: ensure user has at least one board.
    const boardCount = await this.prisma.board.count({ where: { userId: user.id } });
    if (boardCount === 0) {
      await this.prisma.board.create({
        data: {
          userId: user.id,
          name: 'Board 1',
          position: 0,
          config: {
            version: 1,
            columns: [
              {
                id: `col:${Date.now()}`,
                title: '',
                query: { tagsAny: [], tagsMatch: 'any', includeDone: false, limit: 50 },
                render: { type: 'list' },
              },
            ],
          },
        },
      });
    }

    return { userId: user.id, email: user.email, name: user.name };
  }
}

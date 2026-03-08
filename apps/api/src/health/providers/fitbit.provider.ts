import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';
const FITBIT_API_BASE = 'https://api.fitbit.com';
const CALLBACK_URL = 'https://life-api.kisorbiswal.com/health/sources/fitbit/callback';
const SCOPES = 'sleep weight';

// Fitbit personal app: 150 requests/hour
const INTER_PAGE_DELAY_MS = 800; // ~75 req/min → well under 150/hour
const RATE_LIMIT_BUFFER = 10;   // slow down when < 10 calls remaining

// In-memory PKCE store keyed by state param
const pkceStore = new Map<string, { codeVerifier: string; userId: string }>();

export interface FitbitPageResult {
  items: any[];
  nextUrl: string | null;
  rateLimitRemaining: number;
  rateLimitResetSecs: number;
}

@Injectable()
export class FitbitProvider {
  private readonly log = new Logger(FitbitProvider.name);

  private get clientId(): string { return process.env.FITBIT_CLIENT_ID || ''; }
  private get clientSecret(): string { return process.env.FITBIT_CLIENT_SECRET || ''; }

  generateAuthUrl(userId: string): string {
    const state = randomBytes(16).toString('hex');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    pkceStore.set(state, { codeVerifier, userId });
    setTimeout(() => pkceStore.delete(state), 10 * 60 * 1000);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: CALLBACK_URL,
      scope: SCOPES,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${FITBIT_AUTH_URL}?${params.toString()}`;
  }

  getPkceData(state: string): { codeVerifier: string; userId: string } | undefined {
    const data = pkceStore.get(state);
    if (data) pkceStore.delete(state);
    return data;
  }

  async handleCallback(code: string, codeVerifier: string) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: CALLBACK_URL,
      client_id: this.clientId,
      code_verifier: codeVerifier,
    });
    const res = await fetch(FITBIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`Fitbit token exchange failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    });
    const res = await fetch(FITBIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`Fitbit token refresh failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /** Fetch a single page of sleep data. Returns items + next URL for cursor-based pagination. */
  async fetchSleepPage(accessToken: string, url?: string, afterDate?: string): Promise<FitbitPageResult> {
    const reqUrl = url ?? `${FITBIT_API_BASE}/1.2/user/-/sleep/list.json?afterDate=${afterDate}&sort=asc&offset=0&limit=100`;
    return this.fetchPage(accessToken, reqUrl, (data) => data.sleep || [], (data) => data.pagination?.next ?? null);
  }

  /** Fetch a single page of weight data. */
  async fetchWeightPage(accessToken: string, url?: string, afterDate?: string): Promise<FitbitPageResult> {
    const reqUrl = url ?? `${FITBIT_API_BASE}/1/user/-/body/log/weight/list.json?afterDate=${afterDate}&sort=asc&offset=0&limit=100`;
    return this.fetchPage(accessToken, reqUrl, (data) => data.weight || [], (data) => data.pagination?.next ?? null);
  }

  private async fetchPage(
    accessToken: string,
    url: string,
    extractItems: (d: any) => any[],
    extractNext: (d: any) => string | null,
  ): Promise<FitbitPageResult> {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const remaining = parseInt(res.headers.get('fitbit-rate-limit-remaining') ?? '999', 10);
    const resetSecs = parseInt(res.headers.get('fitbit-rate-limit-reset') ?? '0', 10);

    if (res.status === 429) {
      const waitSecs = resetSecs + 5;
      this.log.warn(`Fitbit rate limited. Waiting ${waitSecs}s...`);
      await this.sleep(waitSecs * 1000);
      return this.fetchPage(accessToken, url, extractItems, extractNext); // retry after wait
    }

    if (!res.ok) throw new Error(`Fitbit API error: ${res.status} ${await res.text()}`);

    const data = await res.json();
    return {
      items: extractItems(data),
      nextUrl: extractNext(data),
      rateLimitRemaining: remaining,
      rateLimitResetSecs: resetSecs,
    };
  }

  /** Delay between paginated requests, respecting rate limit headers. */
  async interPageDelay(rateLimitRemaining: number, rateLimitResetSecs: number): Promise<void> {
    if (rateLimitRemaining < RATE_LIMIT_BUFFER) {
      const waitMs = (rateLimitResetSecs + 5) * 1000;
      this.log.warn(`Rate limit low (${rateLimitRemaining} remaining). Waiting ${waitMs / 1000}s until reset.`);
      await this.sleep(waitMs);
    } else {
      await this.sleep(INTER_PAGE_DELAY_MS);
    }
  }

  extractMetricValues(dataPoint: {
    dataType: string; payload: any; id: string; userId: string; occurredAt: Date;
  }) {
    const { dataType, payload, id: dataPointId, userId, occurredAt } = dataPoint;
    const base = { userId, dataPointId, dataType, occurredAt };

    if (dataType === 'sleep-tracker') {
      return [
        { ...base, field: 'duration_min', valueNum: payload.minutesAsleep ?? null, unit: 'min' },
        { ...base, field: 'start_time', valueDt: payload.startTime ? new Date(payload.startTime) : null },
        { ...base, field: 'end_time', valueDt: payload.endTime ? new Date(payload.endTime) : null },
        { ...base, field: 'efficiency', valueNum: payload.efficiency ?? null, unit: '%' },
      ].filter(m => (m as any).valueNum != null || (m as any).valueDt != null);
    }

    if (dataType === 'weight-scale') {
      return [
        { ...base, field: 'value_kg', valueNum: payload.weight ?? null, unit: 'kg' },
      ].filter(m => (m as any).valueNum != null);
    }

    return [];
  }

  private sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
}

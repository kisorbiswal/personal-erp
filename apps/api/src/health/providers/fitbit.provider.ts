import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';
const FITBIT_API_BASE = 'https://api.fitbit.com';
const CALLBACK_URL = 'https://life-api.kisorbiswal.com/health/sources/fitbit/callback';
const SCOPES = 'sleep weight';

// In-memory PKCE store keyed by state param
const pkceStore = new Map<string, { codeVerifier: string; userId: string }>();

@Injectable()
export class FitbitProvider {
  private readonly log = new Logger(FitbitProvider.name);

  private get clientId(): string {
    return process.env.FITBIT_CLIENT_ID || '';
  }
  private get clientSecret(): string {
    return process.env.FITBIT_CLIENT_SECRET || '';
  }

  generateAuthUrl(userId: string): string {
    const state = randomBytes(16).toString('hex');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

    pkceStore.set(state, { codeVerifier, userId });
    // Clean up after 10 minutes
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

  async handleCallback(
    code: string,
    codeVerifier: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
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

    if (!res.ok) {
      const text = await res.text();
      this.log.error(`Fitbit token exchange failed: ${res.status} ${text}`);
      throw new Error(`Fitbit token exchange failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
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

    if (!res.ok) {
      const text = await res.text();
      this.log.error(`Fitbit token refresh failed: ${res.status} ${text}`);
      throw new Error(`Fitbit token refresh failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async fetchSleepData(accessToken: string, afterDate: string): Promise<any[]> {
    const url = `${FITBIT_API_BASE}/1.2/user/-/sleep/list.json?afterDate=${afterDate}&sort=asc&offset=0&limit=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Fitbit sleep fetch failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.sleep || [];
  }

  async fetchWeightData(accessToken: string, afterDate: string): Promise<any[]> {
    const url = `${FITBIT_API_BASE}/1/user/-/body/log/weight/list.json?afterDate=${afterDate}&sort=asc&offset=0&limit=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Fitbit weight fetch failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.weight || [];
  }

  extractMetricValues(
    dataPoint: { dataType: string; payload: any; id: string; userId: string; occurredAt: Date },
  ): Array<{
    userId: string;
    dataPointId: string;
    dataType: string;
    field: string;
    valueNum?: number | null;
    valueStr?: string | null;
    valueDt?: Date | null;
    unit?: string | null;
    occurredAt: Date;
  }> {
    const { dataType, payload, id: dataPointId, userId, occurredAt } = dataPoint;
    const base = { userId, dataPointId, dataType, occurredAt };

    if (dataType === 'sleep-tracker') {
      return [
        { ...base, field: 'duration_min', valueNum: payload.minutesAsleep, unit: 'min' },
        { ...base, field: 'start_time', valueDt: new Date(payload.startTime), unit: null },
        { ...base, field: 'end_time', valueDt: new Date(payload.endTime), unit: null },
        { ...base, field: 'efficiency', valueNum: payload.efficiency, unit: '%' },
      ];
    }

    if (dataType === 'weight-scale') {
      return [
        { ...base, field: 'value_kg', valueNum: payload.weight, unit: 'kg' },
      ];
    }

    return [];
  }
}

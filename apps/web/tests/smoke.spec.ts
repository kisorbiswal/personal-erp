import { test, expect } from '@playwright/test';

test('homepage loads (not stuck) and shows boards after dev-login', async ({ page, request }) => {
  const api = process.env.API_BASE_URL || 'http://localhost:4000';

  // establish session cookie for this test context
  const devLogin = await request.post(`${api}/auth/dev-login`);
  expect(devLogin.ok()).toBeTruthy();

  await page.goto('/');

  // should not be stuck on Loading forever
  await expect(page.getByText('Loading...')).toHaveCount(0, { timeout: 20_000 });

  await expect(page.getByRole('heading', { name: 'Boards' })).toBeVisible({ timeout: 20_000 });
});

test('/api/build returns build info (sha + builtAt)', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/api/build`);
  expect(res.ok()).toBeTruthy();
  const j = await res.json();
  expect(j.sha).toBeTruthy();
  expect(j.builtAt).toBeTruthy();
  expect(j.builtAt).not.toBe('unknown');
});

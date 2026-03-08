# Health Reports — Progress Tracker
**Branch:** feature/health-reports
**Last updated:** 2026-03-08

## Steps

- [x] 1. Prisma schema additions + migration (used `prisma db push` due to existing drift)
- [x] 2. crypto.service.ts (AES-256 token encryption)
- [x] 3. fitbit.provider.ts (OAuth + fetch + MetricValue extraction)
- [x] 4. sync.service.ts (orchestrates sync pipeline)
- [x] 5. sources.controller.ts + health.module.ts
- [x] 6. report-engine.service.ts (slot resolution + aggregation)
- [x] 7. reports.controller.ts
- [x] 8. Seed fitbit-sleep-weight-v1 ReportTemplate
- [x] 9. Frontend: /health/layout.tsx + /health/sources/page.tsx
- [x] 10. Frontend: /health/dashboard/page.tsx + /health/dashboard/[id]/page.tsx (chart)
- [x] 11. Frontend: /health/dev/page.tsx
- [x] 12. Register HealthModule in AppModule (done in step 5)
- [x] 13. End-to-end test notes

## Notes
- Step 1: Used `prisma db push` instead of `prisma migrate dev` due to existing DB drift
- Step 5: HealthModule registered in AppModule imports (also covers step 12)
- Step 8: Seed script at `apps/api/prisma/seed-health.mjs`, run with `DATABASE_URL=... node prisma/seed-health.mjs`

## Test Notes (Step 13)

### TypeScript / Build
- `./node_modules/.bin/tsc --noEmit` in `apps/web` — **passes with 0 errors**
- All four new pages compile cleanly: `layout.tsx`, `sources/page.tsx`, `dashboard/page.tsx`, `dashboard/[id]/page.tsx`, `dev/page.tsx`

### API calls wired
- `GET /health/sources/providers` → provider connection status in sources page
- `GET /health/sources` → connected sources list
- `GET /health/sources/:id/data` → raw DataPoints table (lazy-loaded per source)
- `POST /health/sources/fitbit/connect` → OAuth redirect
- `POST /health/sources/:id/sync` → manual sync trigger
- `GET /health/reports/installed` → dashboard installed reports list
- `GET /health/reports/templates` → browse/install flow + dev template list
- `POST /health/reports/install` → install template
- `GET /health/reports/installed/:id/data?days=N` → report chart data
- `GET /health/reports/templates/:id` → single template JSON for dev viewer

### Chart rendering
- Uses Recharts `ComposedChart` with dual `YAxis` (yAxisId=left/right)
- Left axis: sleep hours; right axis: weight kg
- `connectNulls` enabled so gaps in optional weight data don't break the line
- Date range selector (30d / 90d / 180d / All) re-fetches with `?days=N`
- Tested with mock payload shape matching spec's report data response format

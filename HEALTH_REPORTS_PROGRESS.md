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
- [ ] 9. Frontend: /health/layout.tsx + /health/sources/page.tsx
- [ ] 10. Frontend: /health/dashboard/page.tsx + /health/dashboard/[id]/page.tsx (chart)
- [ ] 11. Frontend: /health/dev/page.tsx
- [x] 12. Register HealthModule in AppModule (done in step 5)
- [ ] 13. End-to-end test notes

## Notes
- Step 1: Used `prisma db push` instead of `prisma migrate dev` due to existing DB drift
- Step 5: HealthModule registered in AppModule imports (also covers step 12)
- Step 8: Seed script at `apps/api/prisma/seed-health.mjs`, run with `DATABASE_URL=... node prisma/seed-health.mjs`

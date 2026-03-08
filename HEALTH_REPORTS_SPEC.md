# Health Reports — Phase 1 Spec
**Branch:** `feature/health-reports`
**Repo:** `/home/butu/.openclaw/workspace/personal-erp`
**Status:** IN PROGRESS — check `HEALTH_REPORTS_PROGRESS.md` for current state

---

## Goal
Add a separate "Health" section to the Personal ERP that:
1. Lets users connect data sources (Fitbit via OAuth in Phase 1)
2. Shows raw synced data in a simple table
3. Renders installed reports (Phase 1: Sleep & Weight Correlation chart)
4. Has a Dev area for viewing/editing report template JSON

## Architecture Overview

### Three Registries
1. **Provider Registry** — TypeScript classes, one per source (Fitbit, Google Fit, etc.)
   - Each provider declares what data types it produces: `sleep-tracker`, `weight-scale`
   - Each provider handles OAuth and data fetching
2. **Data Type Registry** — canonical slugs with field schemas
   - `sleep-tracker`: `{ start: datetime, end: datetime, duration_min: number, stages?: [...] }`
   - `weight-scale`: `{ value_kg: number }`
   - `step-counter`: `{ count: number }`
3. **Report Template Registry** — JSON definitions (seeded in DB)
   - Declares required slots → data types → fields
   - Defines visualizations

### Data Flow
```
User connects Fitbit (OAuth)
→ DataSource row created (userId, provider="fitbit", tokens encrypted)
→ Sync job runs: fetches Fitbit API → stores raw DataPoints (JSONB)
→ Connector maps DataPoints → MetricValues (typed, normalized)
→ Report queries MetricValues for rendering
```

---

## Database Schema (Prisma additions to schema.prisma)

Add to `/home/butu/.openclaw/workspace/personal-erp/apps/api/prisma/schema.prisma`:

```prisma
model DataSource {
  id           String      @id @default(uuid())
  userId       String
  provider     String      // e.g. "fitbit", "google-fit", "apple-health"
  label        String      // user-visible name e.g. "My Fitbit"
  credentials  Json        // encrypted OAuth tokens: { accessToken, refreshToken, expiresAt }
  config       Json        @default("{}")
  lastSyncAt   DateTime?
  syncStatus   String      @default("idle") // idle | syncing | error
  syncError    String?
  createdAt    DateTime    @default(now())
  user         User        @relation(fields: [userId], references: [id])
  dataPoints   DataPoint[]

  @@unique([userId, provider])  // one connection per provider per user
}

model DataPoint {
  id           String      @id @default(uuid())
  sourceId     String
  userId       String
  occurredAt   DateTime
  dataType     String      // "sleep-tracker", "weight-scale", "step-counter"
  payload      Json        // raw API response slice (as-received)
  createdAt    DateTime    @default(now())
  source       DataSource  @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  metricValues MetricValue[]

  @@index([userId, dataType, occurredAt])
  @@index([sourceId, occurredAt])
}

model MetricValue {
  id           String      @id @default(uuid())
  userId       String
  dataPointId  String
  dataType     String      // same as DataPoint.dataType
  field        String      // e.g. "duration_min", "value_kg", "start_time"
  valueNum     Float?      // numeric value (if applicable)
  valueStr     String?     // string value (if applicable)
  valueDt      DateTime?   // datetime value (if applicable)
  unit         String?     // "kg", "min", etc.
  occurredAt   DateTime    // denormalized from DataPoint for fast querying
  createdAt    DateTime    @default(now())
  dataPoint    DataPoint   @relation(fields: [dataPointId], references: [id], onDelete: Cascade)

  @@index([userId, dataType, field, occurredAt])
}

model ReportTemplate {
  id           String      @id  // e.g. "fitbit-sleep-weight-v1"
  name         String
  description  String      @default("")
  author       String      @default("system")
  version      String      @default("1.0.0")
  extendsId    String?     // for report inheritance
  definition   Json        // full report JSON (see Report Template Format below)
  isBuiltIn    Boolean     @default(false)
  createdAt    DateTime    @default(now())
  installs     InstalledReport[]
}

model InstalledReport {
  id           String         @id @default(uuid())
  userId       String
  templateId   String
  config       Json           @default("{}")  // user overrides
  createdAt    DateTime       @default(now())
  user         User           @relation(fields: [userId], references: [id])
  template     ReportTemplate @relation(fields: [templateId], references: [id])

  @@unique([userId, templateId])
}
```

Also add relations to User model:
```prisma
  dataSources     DataSource[]
  installedReports InstalledReport[]
```

---

## Report Template Format

```json
{
  "id": "fitbit-sleep-weight-v1",
  "name": "Sleep & Weight Correlation",
  "description": "Correlates nightly sleep duration with morning weight over time",
  "author": "system",
  "version": "1.0.0",
  "requires": [
    {
      "slot": "sleep",
      "dataType": "sleep-tracker",
      "fields": ["duration_min", "start_time", "end_time"],
      "aggregation": "daily",
      "optional": false
    },
    {
      "slot": "weight",
      "dataType": "weight-scale",
      "fields": ["value_kg"],
      "aggregation": "daily_latest",
      "optional": true
    }
  ],
  "charts": [
    {
      "id": "main-timeline",
      "type": "dual-axis-line",
      "title": "Sleep Duration vs Weight",
      "xAxis": { "field": "date", "label": "Date" },
      "series": [
        {
          "slot": "sleep",
          "field": "duration_min",
          "label": "Sleep (hours)",
          "transform": "div60",
          "axis": "left",
          "color": "#6366f1",
          "unit": "h"
        },
        {
          "slot": "weight",
          "field": "value_kg",
          "label": "Weight (kg)",
          "axis": "right",
          "color": "#f59e0b",
          "unit": "kg"
        }
      ]
    }
  ]
}
```

---

## Provider: Fitbit

**OAuth scopes needed:** `sleep weight`

**OAuth flow:**
- App registers callback: `https://life-api.kisorbiswal.com/health/sources/fitbit/callback`
- PKCE flow (Fitbit supports it)
- Tokens stored in `DataSource.credentials` as JSON (encrypt with AES-256 using `ENCRYPTION_KEY` env var)

**Fitbit API endpoints used:**
- Sleep: `GET https://api.fitbit.com/1.2/user/-/sleep/list.json?afterDate={date}&sort=asc&offset=0&limit=100`
- Weight: `GET https://api.fitbit.com/1/user/-/body/log/weight/list.json?afterDate={date}&sort=asc&offset=0&limit=100`

**Sleep DataPoint payload** (raw from Fitbit, store as-is):
```json
{
  "logId": 123,
  "startTime": "2024-01-15T00:43:00.000",
  "endTime": "2024-01-15T07:12:00.000",
  "duration": 23340000,
  "minutesAsleep": 389,
  "efficiency": 91,
  "levels": { "summary": { "deep": {"minutes": 62}, "light": {"minutes": 212}, "rem": {"minutes": 94}, "wake": {"minutes": 21} } }
}
```

**Sleep MetricValues extracted:**
- `field: "duration_min"`, `valueNum: 389`
- `field: "start_time"`, `valueDt: 2024-01-15T00:43:00`
- `field: "end_time"`, `valueDt: 2024-01-15T07:12:00`
- `field: "efficiency"`, `valueNum: 91`

**Weight DataPoint payload:**
```json
{ "logId": 456, "date": "2024-01-15", "time": "08:12:00", "weight": 73.5, "bmi": 22.1 }
```

**Weight MetricValues extracted:**
- `field: "value_kg"`, `valueNum: 73.5`

---

## Env Vars Required

Add to `.env` in API:
```
FITBIT_CLIENT_ID=xxx
FITBIT_CLIENT_SECRET=xxx
ENCRYPTION_KEY=32-char-random-string-for-aes256
HEALTH_SYNC_BACKFILL_DAYS=90
```

Add to Fitbit Developer portal:
- App type: Personal
- Redirect URI: `https://life-api.kisorbiswal.com/health/sources/fitbit/callback`

---

## API Endpoints (NestJS)

### Health Sources Controller (`/health/sources`)
```
GET  /health/sources                  — list user's connected sources
GET  /health/sources/providers        — list available providers (fitbit, etc.) with connection status
POST /health/sources/fitbit/connect   — initiate Fitbit OAuth (returns redirect URL)
GET  /health/sources/fitbit/callback  — OAuth callback (exchanges code, stores tokens, triggers sync)
POST /health/sources/:id/sync         — manual sync trigger
DELETE /health/sources/:id            — disconnect source (deletes DataPoints + MetricValues too)
GET  /health/sources/:id/data         — paginated raw DataPoints for a source (table preview)
```

### Health Reports Controller (`/health/reports`)
```
GET  /health/reports/templates        — list all ReportTemplates
GET  /health/reports/templates/:id    — single template JSON
GET  /health/reports/installed        — user's installed reports
POST /health/reports/install          — body: { templateId } — installs a report for the user
DELETE /health/reports/installed/:id  — uninstall
GET  /health/reports/installed/:id/data — render data for report (resolved slots + chart data)
```

### Report Data Response Format
```json
{
  "report": { ...template... },
  "slots": {
    "sleep": { "resolved": true, "sourceId": "...", "provider": "fitbit" },
    "weight": { "resolved": true, "sourceId": "...", "provider": "fitbit" }
  },
  "charts": {
    "main-timeline": {
      "labels": ["2024-01-15", "2024-01-16", ...],
      "series": {
        "sleep": [6.5, 7.2, 5.8, ...],
        "weight": [73.5, 73.2, null, ...]
      }
    }
  }
}
```

---

## Frontend Pages

### Layout
New root layout at `/health/layout.tsx` — separate nav from boards:
```
[← Boards] [Sources] [Dashboard] [Dev]
```

### Pages
1. **`/health/sources`** — provider cards (Fitbit: connected/not), sync status, last sync time
   - "Connect Fitbit" button → redirects to OAuth
   - After connected: show raw data table (date | type | key fields)
   - Manual "Sync now" button

2. **`/health/dashboard`** — installed reports as cards, "Browse templates" button
   - Each card shows report name, last updated, "View" button

3. **`/health/dashboard/[id]`** — rendered report
   - Slot status bar: ✓ Sleep (Fitbit) ✓ Weight (Fitbit)
   - Chart (Recharts `ComposedChart` with two Y axes)
   - Date range filter (last 30 / 90 / 180 days / all)

4. **`/health/dev`** — report template JSON viewer/editor
   - List templates, click to see raw JSON
   - "Fork" button (copies JSON, opens editor)
   - JSON editor (simple textarea for Phase 1, monaco-editor later)
   - "Preview with my data" button

---

## Chart Library
Use **Recharts** — install: `pnpm --filter @personal-erp/web add recharts`

For the dual-axis line chart use `ComposedChart` with two `YAxis` (yAxisId="left", yAxisId="right").

---

## File Structure to Create

```
apps/api/src/
  health/
    health.module.ts
    sources.controller.ts
    reports.controller.ts
    sync.service.ts           — background sync, token refresh
    report-engine.service.ts  — slot resolution, data aggregation
    crypto.service.ts         — AES-256 encrypt/decrypt for tokens
    providers/
      fitbit.provider.ts      — OAuth + API fetching + MetricValue extraction
      provider.interface.ts   — IHealthProvider interface

apps/api/prisma/
  migrations/YYYYMMDD_health_tables/ — new migration

apps/web/app/health/
  layout.tsx                  — health section nav
  sources/
    page.tsx                  — source management
  dashboard/
    page.tsx                  — installed reports list
    [id]/
      page.tsx                — rendered report
  dev/
    page.tsx                  — template JSON viewer/editor
```

---

## Seed Data (run after migration)

Insert the `fitbit-sleep-weight-v1` template into `ReportTemplate` table.
Auto-install it for all existing users.

---

## Implementation Order

1. Prisma schema + migration
2. `crypto.service.ts` (token encryption)
3. `fitbit.provider.ts` (OAuth flow + token exchange + data fetch + MetricValue extraction)
4. `sync.service.ts` (orchestrates fetch → store DataPoints → extract MetricValues)
5. `sources.controller.ts` (connect, callback, sync, list, data preview)
6. `report-engine.service.ts` (slot resolution + data aggregation for charts)
7. `reports.controller.ts`
8. Seed `fitbit-sleep-weight-v1` template
9. Frontend: `/health/sources` page
10. Frontend: `/health/dashboard` + `/health/dashboard/[id]` (chart)
11. Frontend: `/health/dev` page
12. Register HealthModule in AppModule
13. Test end-to-end

---

## Progress Checkpoint File
See `HEALTH_REPORTS_PROGRESS.md` — updated by agents after each step.
If resuming after crash: read progress file, continue from last incomplete step.

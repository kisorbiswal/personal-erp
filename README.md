# Personal ERP (MyLogger next)

Self-hosted web-first "personal ERP" built from MyLogger event capture.

## Apps
- `apps/api`: NestJS API + Prisma (Postgres)
- `apps/web`: Next.js web UI

## Core idea
Store everything as events (raw text + tags + timestamps). Build reports/views (kanban, charts) by parsing & indexing.

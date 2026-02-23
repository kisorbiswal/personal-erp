# MyLogger ↔ Logseq Sync (MVP)

Open, self-hostable sync bridge between MyLogger and a Logseq vault.

## Goals
- Keep notes in open Markdown files (Logseq vault)
- Keep fast capture in MyLogger (bot/API)
- Bi-directional sync with idempotency
- Optional OCR ingestion pipeline

## Folder layout

```text
mylogger-logseq-sync/
  docker-compose.yml
  .env.example
  schemas/
    frontmatter.schema.json
  src/
    sync_worker.py
```

## Data contract
Each synced note includes frontmatter:

```yaml
mylogger_id: 12345
mylogger_user: "117245190"
mylogger_created_at: "2026-02-23T08:00:00Z"
mylogger_updated_at: "2026-02-23T08:10:00Z"
tags: [oracle, learning]
source: mylogger
sync_version: 1
```

## Run (dev)

1. Copy env:
```bash
cp .env.example .env
```

2. Edit `.env` values.

3. Start services:
```bash
docker compose up -d
```

4. Run worker once:
```bash
docker compose run --rm sync-worker python /app/src/sync_worker.py --once
```

## Suggested vault path
Use your real Logseq vault path and mount it to `/vault` inside container.

## Conflict policy (MVP)
- Last-write-wins
- Keep audit lines in logs
- (Later) write conflict copies in note body

## Notes
- This is an MVP scaffold; API adapters should be wired in `sync_worker.py`.
- Keep vault under git for rollback safety.

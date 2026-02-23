#!/usr/bin/env python3
import argparse
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

STATE_KEY = "last_sync_iso"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def get_db(path: str):
    conn = sqlite3.connect(path)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)"
    )
    conn.commit()
    return conn


def get_state(conn, key: str, default: str = "1970-01-01T00:00:00+00:00") -> str:
    row = conn.execute("SELECT v FROM kv WHERE k=?", (key,)).fetchone()
    return row[0] if row else default


def set_state(conn, key: str, value: str):
    conn.execute("INSERT OR REPLACE INTO kv(k,v) VALUES(?,?)", (key, value))
    conn.commit()


def ensure_dirs(vault_root: Path):
    for p in [
        vault_root / "mylogger" / "inbox",
        vault_root / "mylogger" / "notes",
        vault_root / "assets" / "ocr" / "incoming",
    ]:
        p.mkdir(parents=True, exist_ok=True)


def fetch_mylogger_changes(base_url: str, token: str, user: str, since_iso: str):
    # TODO: implement with requests/httpx once MyLogger sync endpoints are finalized.
    # Return list of dicts: id, text, tags, created_at, updated_at
    print(f"[stub] fetch_mylogger_changes user={user} since={since_iso} from {base_url}")
    return []


def upsert_logseq_note(vault_root: Path, item: dict):
    # TODO: choose one-note-per-item vs monthly rollup strategy
    target = vault_root / "mylogger" / "inbox" / f"item-{item['id']}.md"
    tags = item.get("tags", [])
    fm = [
        "---",
        f"mylogger_id: {item['id']}",
        f"mylogger_user: \"{item.get('user','')}\"",
        f"mylogger_created_at: \"{item.get('created_at','')}\"",
        f"mylogger_updated_at: \"{item.get('updated_at','')}\"",
        f"tags: [{', '.join(tags)}]",
        "source: mylogger",
        "sync_version: 1",
        "---",
        "",
        item.get("text", ""),
        "",
    ]
    target.write_text("\n".join(fm), encoding="utf-8")


def scan_logseq_changes(vault_root: Path, since_iso: str):
    # TODO: implement incremental scanner by git diff or mtime
    print(f"[stub] scan_logseq_changes since={since_iso} in {vault_root}")
    return []


def push_mylogger_updates(base_url: str, token: str, updates: list):
    # TODO: implement API push
    print(f"[stub] push_mylogger_updates count={len(updates)} to {base_url}")


def run_once():
    base_url = os.getenv("MYLOGGER_BASE_URL", "").rstrip("/")
    token = os.getenv("MYLOGGER_API_TOKEN", "")
    user = os.getenv("MYLOGGER_USER", "117245190")
    vault = Path(os.getenv("LOGSEQ_VAULT_PATH", "/vault"))
    state_db = os.getenv("SYNC_STATE_DB", "/app/sync_state.db")

    if not vault.exists():
        raise SystemExit(f"Vault path not found: {vault}")

    ensure_dirs(vault)

    conn = get_db(state_db)
    since = get_state(conn, STATE_KEY)

    incoming = fetch_mylogger_changes(base_url, token, user, since)
    for item in incoming:
        upsert_logseq_note(vault, item)

    outgoing = scan_logseq_changes(vault, since)
    if outgoing:
        push_mylogger_updates(base_url, token, outgoing)

    now = utc_now_iso()
    set_state(conn, STATE_KEY, now)
    print(f"Sync complete. since={since} now={now} in={len(incoming)} out={len(outgoing)}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Run one sync pass")
    args = parser.parse_args()

    if args.once:
        run_once()
    else:
        # simple loop mode (optional)
        run_once()


if __name__ == "__main__":
    main()

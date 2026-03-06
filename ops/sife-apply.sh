#!/usr/bin/env bash
set -euo pipefail

log() { echo "[sife-apply] $*"; }

REPO_ROOT="/home/butu/.openclaw/workspace/personal-erp"
API_DIR="$REPO_ROOT/apps/api"
WEB_DIR="$REPO_ROOT/apps/web"

log "Updating repo"
cd "$REPO_ROOT"
git pull --rebase

log "Installing deps"
corepack enable >/dev/null 2>&1 || true
pnpm -r install >/dev/null

log "Build API"
cd "$API_DIR"
pnpm build >/dev/null

log "Write /etc/sife-api.env (preserve existing secrets if present)"
ENV_FILE="/etc/sife-api.env"
if [[ -f "$ENV_FILE" ]]; then
  cp -f "$ENV_FILE" "$ENV_FILE.bak.$(date -u +%Y%m%dT%H%M%SZ)"
fi

# If pm2 process exists, reuse its env; otherwise keep existing env file values.
TMP=$(mktemp)
{
  echo "NODE_ENV=production"
  echo "API_PORT=4000"
  echo "UI_ORIGIN=https://life.kisorbiswal.com"
  echo "API_ORIGIN=https://life-api.kisorbiswal.com"

  if command -v pm2 >/dev/null 2>&1 && pm2 describe personal-erp-api >/dev/null 2>&1; then
    pm2 env 0 | awk -F": " '($1=="DATABASE_URL"||$1=="SESSION_SECRET"||$1=="GOOGLE_CLIENT_ID"||$1=="GOOGLE_CLIENT_SECRET"||$1=="OWNER_EMAIL"||$1=="PANIC_LOCK"){print $1"="substr($0,index($0,$2))}'
  elif [[ -f "$ENV_FILE" ]]; then
    # Reuse existing secrets
    egrep "^(DATABASE_URL|SESSION_SECRET|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|OWNER_EMAIL|PANIC_LOCK)=" "$ENV_FILE" || true
  fi
} > "$TMP"

# Ensure required lock fields
if ! grep -q "^OWNER_EMAIL=" "$TMP"; then echo "OWNER_EMAIL=kisor.biswal@gmail.com" >> "$TMP"; fi
if ! grep -q "^PANIC_LOCK=" "$TMP"; then echo "PANIC_LOCK=0" >> "$TMP"; fi

install -m 600 -o root -g root "$TMP" "$ENV_FILE"
rm -f "$TMP"

log "Install systemd unit: sife-api"
cat > /etc/systemd/system/sife-api.service <<"UNIT"
[Unit]
Description=sife-api (Personal ERP API)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/butu/.openclaw/workspace/personal-erp/apps/api
EnvironmentFile=/etc/sife-api.env
# Optional build metadata used by /health
Environment=GIT_SHA=local
Environment=BUILD_TIME=1970-01-01T00:00:00Z
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=2
User=butu

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now sife-api

log "Stop PM2 API if present (avoid port conflicts)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 stop personal-erp-api >/dev/null 2>&1 || true
  pm2 delete personal-erp-api >/dev/null 2>&1 || true
  pm2 save >/dev/null 2>&1 || true
fi

log "Fix sife-web unit ExecStart"
sed -i 's|^ExecStart=.*|ExecStart=/home/butu/.npm-global/bin/pnpm start|g' /etc/systemd/system/sife-web.service || true
if ! grep -q "^Environment=PATH=/home/butu/.npm-global/bin" /etc/systemd/system/sife-web.service 2>/dev/null; then
  sed -i '/^\[Service\]/a Environment=PATH=/home/butu/.npm-global/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin' /etc/systemd/system/sife-web.service || true
fi
systemctl daemon-reload

log "Build web (inject sha/time for footer)"
cd "$REPO_ROOT"
export NEXT_PUBLIC_API_BASE_URL="https://life-api.kisorbiswal.com"
export NEXT_PUBLIC_GIT_SHA="$(git rev-parse --short HEAD)"
export NEXT_PUBLIC_BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cd "$WEB_DIR"
pnpm build >/dev/null

log "Restart sife-web"
systemctl restart sife-web

log "Smoke checks"
curl -sS http://127.0.0.1:3001/ >/dev/null || true
curl -sS https://life-api.kisorbiswal.com/health | head -c 200; echo
curl -sS https://life.kisorbiswal.com/api/build | head -c 200; echo

log "Done"

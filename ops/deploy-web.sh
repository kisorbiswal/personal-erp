#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/butu/.openclaw/workspace/personal-erp"

cd "$REPO_DIR"

echo "==> Updating repo"
git pull --rebase

echo "==> Installing deps"
corepack enable >/dev/null 2>&1 || true
pnpm -r install

echo "==> Building web"
export NEXT_PUBLIC_API_BASE_URL="https://life-api.kisorbiswal.com"
export NEXT_PUBLIC_GIT_SHA="$(git rev-parse --short HEAD)"
export NEXT_PUBLIC_BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
pnpm --filter @personal-erp/web build

echo "==> Restarting service"
sudo systemctl restart sife-web
sudo systemctl status sife-web --no-pager

echo "==> Done"

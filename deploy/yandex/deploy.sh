#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/demokatalog-api"
SRC_DIR="${1:-}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required"
  exit 1
fi

if [ -n "$SRC_DIR" ]; then
  if ! command -v rsync >/dev/null 2>&1; then
    echo "rsync is required when source dir is provided"
    exit 1
  fi
  if [ ! -d "$SRC_DIR" ]; then
    echo "Source dir not found: $SRC_DIR"
    exit 1
  fi
  rsync -av --delete \
    --exclude ".git" \
    --exclude ".env.local" \
    --exclude "storage" \
    --exclude "uploads" \
    "$SRC_DIR"/ "$APP_DIR"/
fi

cd "$APP_DIR"
npm ci --omit=dev

sudo cp deploy/yandex/demokatalog-api.service /etc/systemd/system/demokatalog-api.service
sudo systemctl daemon-reload
sudo systemctl enable demokatalog-api
sudo systemctl restart demokatalog-api
sudo systemctl status demokatalog-api --no-pager

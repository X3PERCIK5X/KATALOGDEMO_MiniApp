#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/demokatalog-api"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required"
  exit 1
fi

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Clone repo first into $APP_DIR"
  exit 1
fi

cd "$APP_DIR"
git fetch --all
git reset --hard origin/main
npm ci --omit=dev

sudo cp deploy/yandex/demokatalog-api.service /etc/systemd/system/demokatalog-api.service
sudo systemctl daemon-reload
sudo systemctl enable demokatalog-api
sudo systemctl restart demokatalog-api
sudo systemctl status demokatalog-api --no-pager

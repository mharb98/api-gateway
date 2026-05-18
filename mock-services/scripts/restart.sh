#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

SERVICE="${1:-}"

if [[ -n "$SERVICE" ]]; then
  echo "→ Restarting $SERVICE..."
  docker compose restart "$SERVICE"
  echo "✓ $SERVICE restarted"
else
  echo "→ Restarting all containers..."
  docker compose restart
  echo "✓ All containers restarted"
fi

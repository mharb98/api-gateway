#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

REBUILD=false
for arg in "$@"; do
  case "$arg" in
    --rebuild|-r) REBUILD=true ;;
    *) echo "Unknown flag: $arg" && exit 1 ;;
  esac
done

if $REBUILD; then
  echo "→ Rebuilding images..."
  docker compose build --no-cache
fi

echo "→ Starting gateway-lab..."
docker compose up -d --remove-orphans

echo ""
echo "✓ All containers started"
echo ""
echo "  Service     Instance    Host port"
echo "  ─────────── ─────────── ─────────"
echo "  users       users-1     http://localhost:3001"
echo "  users       users-2     http://localhost:3002"
echo "  orders      orders-1    http://localhost:3003"
echo "  orders      orders-2    http://localhost:3004"
echo "  payments    payments-1  http://localhost:3005"
echo "  payments    payments-2  http://localhost:3006"
echo ""
echo "  Docker network: gateway-lab"
echo "  Internal host pattern: <container-name>:3000"
echo ""
echo "Run 'scripts/logs.sh' to tail logs."

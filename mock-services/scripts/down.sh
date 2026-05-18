#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Stopping gateway-lab..."
docker compose down --remove-orphans
echo "✓ All containers stopped"

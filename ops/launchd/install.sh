#!/usr/bin/env bash
# Build the production bundle into its own dist dir and (re)load the launchd job.
# Usage: ops/launchd/install.sh
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
LABEL="ai.nodeagency.founderos"
PLIST_SRC="$REPO/ops/launchd/$LABEL.plist"
PLIST_DST="$HOME/Library/LaunchAgents/$LABEL.plist"

cd "$REPO"
grep -q '^FOUNDER_OS_ACCESS_TOKEN=.\{16,\}' .env.local || {
  echo "FOUNDER_OS_ACCESS_TOKEN missing or shorter than 16 chars in .env.local" >&2
  exit 1
}

NEXT_DIST_DIR=.next-prod NEXT_TELEMETRY_DISABLED=1 npm run build

mkdir -p "$HOME/Library/LaunchAgents"
cp "$PLIST_SRC" "$PLIST_DST"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
# bootout returns before the old job is fully gone; an immediate bootstrap then
# fails with "Input/output error" (seen 2026-09-11). Wait, and retry once.
sleep 3
launchctl bootstrap "gui/$(id -u)" "$PLIST_DST" || { sleep 3; launchctl bootstrap "gui/$(id -u)" "$PLIST_DST"; }
launchctl kickstart -k "gui/$(id -u)/$LABEL"

for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4100/ || true)
  if [ "$code" = "307" ]; then
    echo "up: http://127.0.0.1:4100 (redirects to /unlock)"
    exit 0
  fi
  sleep 1
done
echo "server did not answer within 30 s; see ~/Library/Logs/founderos.err.log" >&2
exit 1

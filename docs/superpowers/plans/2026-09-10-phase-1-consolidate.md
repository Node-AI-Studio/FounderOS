# Phase 1: One Branch, One Server, One URL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** End the week with a single `main` branch that contains all of our work, an always-on production server reachable over https from the phone, every page rendering in under a second when warm, and agent chat on a real model.

**Architecture:** Merge the `founder-os` branch into `main` keeping both sides of the two conflicts. Reuse the existing stale-while-revalidate cache (`lib/connectors/status-cache.ts`) for the comms feed. Run the production build from its own `NEXT_DIST_DIR` under launchd so `next dev` and `next start` never share `.next`. Put Tailscale Serve in front of port 4100 for https.

**Tech Stack:** Next.js 14, TypeScript, Vitest, launchd, Tailscale, Vercel AI Gateway.

**Spec:** `docs/roadmap.md`, section "Phase 1".

## Global Constraints

- No em dashes or en dashes in code, comments, docs, or commit messages.
- Conventional commits, subject 72 characters or fewer, no `Co-Authored-By` lines, end the body with `Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe`.
- Stage explicit paths. Never `git add -A` or `git add .`.
- `main` is protected on GitHub: a pull request with a green `verify` check (tests, typecheck, production build) and one approving review. Admin enforcement is off, so the two founders bypass the review with `gh pr merge <n> --merge --delete-branch --admin` under their personal accounts, never the retired `nodeagencyai` account and never the web UI, or the Vercel deploy stays blocked. Agent PRs (the `nodeagencyai` token is a plain member) still need the check and a human approval.
- Never force-push. Never bypass the pre-commit secret scanner.
- `npm test` and `npm run typecheck` must be green before every commit that touches code.
- Never write a secret value into a tracked file. Keys live in `.env.local` only.
- Do not kill the dev server on 4100 unless you started it.
- Test files live in `tests/`, one per module, and use `FOUNDER_OS_DB=:memory:` when they touch the DB.

---

### Task 1: Merge `founder-os` into `main`

**Files:**
- Modify: `components/Topbar.tsx` (conflict)
- Modify: `lib/connectors/index.ts` (conflict)
- Everything else merges cleanly (40 files)

**Interfaces:**
- Consumes: nothing.
- Produces: `main` containing `lib/identity.ts` (`IDENTITY.workspace`), `lib/connectors/status-cache.ts` (`createStatusCache`), `allConnectorStatuses(opts?: { fresh?: boolean })`, `invalidateConnectorStatuses()`, and the `paperclip` connector registered in `CHECKS`.

- [ ] **Step 1: Confirm a clean tree on `main` and fetch**

Run:
```bash
cd /Users/cristoforoperrone/code/node-ai/founderos
git status --short
git fetch --all --prune
git log --oneline -1 main; git log --oneline -1 founder-os
```
Expected: no modified tracked files (untracked `.devserver.log`, `.vercel/`, `ops/` are fine). `main` at `76d2a92` or later, `founder-os` at `f7f0e4c` or later.

- [ ] **Step 2: Start the merge on a branch**

`main` rejects direct pushes, so the merge commit is built on a branch and lands through a pull request.

Run:
```bash
git checkout -b merge/founder-os main
git merge --no-ff founder-os
```
Expected: `CONFLICT (content): Merge conflict in components/Topbar.tsx` and `lib/connectors/index.ts`. Nothing else.

- [ ] **Step 3: Resolve `components/Topbar.tsx`, keep the identity import**

`main` renamed the literal to `NODE AI OS`; `founder-os` reads it from `IDENTITY.workspace`. Keep the `founder-os` side. The file must end up with this import block at the top:

```tsx
'use client';

import { IDENTITY } from '@/lib/identity';
import { usePathname } from 'next/navigation';
import { Bot, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
```

and this span inside the breadcrumb:

```tsx
<span>{IDENTITY.workspace}</span>
```

Then set the workspace label so the rename from `main` is not lost. Edit `lib/identity.ts`:

```ts
/** Personal identity shared by the shell and operator views. */
export const IDENTITY = {
  firstName: 'Cristoforo',
  fullName: 'Cristoforo Perrone',
  initials: 'CP',
  workspace: 'NODE AI OS',
} as const;
```

Run: `grep -n '<<<<<<<\|>>>>>>>' components/Topbar.tsx`
Expected: no output.

- [ ] **Step 4: Resolve `lib/connectors/index.ts`, keep both the cache and Paperclip**

`main` added one import and one `CHECKS` row for Paperclip. `founder-os` removed nine connectors and wrapped the export in the status cache. Keep the `founder-os` file and add the Paperclip lines back. The import block must contain:

```ts
import { llmStatus } from '@/lib/connectors/llm';
import { paperclipStatus } from '@/lib/connectors/paperclip';
import { getBrainProvider } from '@/lib/brain';
import { runtimeEnv } from '@/lib/creds';
```

and `CHECKS` must start:

```ts
const CHECKS: [string, ConnectorStatus['kind'], () => Promise<ConnectorStatus>][] = [
  ['gbrain', 'brain', brainConnectorStatus],
  ['llm', 'orchestration', llmStatus],
  ['paperclip', 'orchestration', () => paperclipStatus(runtimeEnv())],
  ['whatsapp', 'social', whatsappStatus],
  ['attio', 'crm', attioStatus],
```

Note the `runtimeEnv()` wrapper: on `main` Paperclip was registered bare, so a URL pasted through the connect flow only took effect after a restart. `paperclipStatus(env = process.env)` accepts an env record, so this fixes it in passing.

Run: `grep -n '<<<<<<<\|>>>>>>>' lib/connectors/index.ts`
Expected: no output.

- [ ] **Step 5: Verify the merge compiles and the suite is green**

Run:
```bash
npm run typecheck && npx vitest run 2>&1 | tail -6
```
Expected: typecheck prints nothing; the last lines show every test file passing. If `tests/connector-index.test.ts` fails on the Paperclip row, it is asserting the old `main` list; update its expected ids to the twelve registered names plus `paperclip`.

- [ ] **Step 6: Commit the merge and open the pull request**

Run:
```bash
git add components/Topbar.tsx lib/connectors/index.ts lib/identity.ts
git add tests/connector-index.test.ts   # only if Step 5 changed it
git commit -m "merge: bring founder-os work onto main

Keeps IDENTITY.workspace in the topbar, the connector status cache, the
twelve Node AI connectors, and the Paperclip health check together.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin merge/founder-os
gh pr create --base main --head merge/founder-os --title "Merge founder-os work onto main" --body "$(cat <<'BODY'
## Summary

Brings the 46 commits on founder-os onto main: Cristoforo and Node AI identity, the nine previous-owner connectors unregistered, the connector status cache, the Secure-cookie fix in the unlock route, and the brain graph work. Keeps the eleven Paperclip commits already on main.

Conflicts resolved by keeping both sides: the topbar reads IDENTITY.workspace, and the connector registry keeps the cache plus the Paperclip check.

## Test plan

- [ ] npm test green (959 plus)
- [ ] npm run typecheck clean
- [ ] npm run build succeeds
- [ ] /integrations lists twelve connectors plus paperclip
- [ ] unlock works on a production build over plain http

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe
BODY
)"
```
Expected: the PR URL is printed and the `verify` check starts.

- [ ] **Step 7: Merge when the check is green**

Run:
```bash
gh pr checks merge/founder-os --watch
gh auth status   # confirm the personal account, not the org account
gh pr merge merge/founder-os --merge --delete-branch --admin
git checkout main && git pull --ff-only
```
Expected: `verify` passes, the merge lands, `git log --oneline -3 main` shows the merge commit on top.

- [ ] **Step 8: Retire the old branch**

Run:
```bash
git branch -d founder-os
git push origin --delete founder-os
```
Expected: both succeed. `git branch -a` no longer lists `founder-os`.

---

### Task 2: Document the seed flag and pin Node

**Files:**
- Modify: `.env.example` (top block)
- Modify: `README.md:23-32`
- Modify: `package.json` (`engines`)
- Modify: `.github/workflows/ci.yml:19-24` (comment only)
- Test: `tests/env-example.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing code-facing. Documentation only, guarded by a test so the docs cannot drift back.

- [ ] **Step 0: Branch**

Run: `git checkout -b docs/seed-flag-and-node main`

- [ ] **Step 1: Write the failing test**

Create `tests/env-example.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');

describe('setup documentation', () => {
  it('.env.example names the demo seed flag', () => {
    expect(read('.env.example')).toMatch(/^FOUNDER_OS_DEMO_SEED=/m);
  });

  it('README quick start names the demo seed flag', () => {
    expect(read('README.md')).toContain('FOUNDER_OS_DEMO_SEED=1');
  });

  it('README does not promise Node 18', () => {
    expect(read('README.md')).not.toContain('Node 18+');
  });

  it('package.json pins a Node range that includes the CI version', () => {
    const pkg = JSON.parse(read('package.json')) as { engines?: { node?: string } };
    expect(pkg.engines?.node).toBe('>=20 <25');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/env-example.test.ts`
Expected: FAIL. Four failures: the flag is absent from both files, the README says `Node 18+`, and `engines.node` is `20.x` or missing.

- [ ] **Step 3: Add the flag to `.env.example`**

Insert directly under the `FOUNDER_OS_ACCESS_TOKEN=` line:

```bash
# ── Demo data ────────────────────────────────────────────────────────────
# Set to 1 to seed the SQLite store with placeholder content on first run and
# show a DEMO DATA badge on every page. Leave unset once your own data is in.
# `npm run seed` always seeds, regardless of this flag.
FOUNDER_OS_DEMO_SEED=1
```

- [ ] **Step 4: Fix the README quick start**

Replace the block at `README.md:21-32` so it reads:

````markdown
## Quick start

Requires **Node 20, 22, or 24** (CI runs 22; 18 fails on a regex this app uses).
`better-sqlite3` compiles a native addon, so Xcode Command Line Tools on macOS
or `build-essential` on Linux must be present.

```bash
npm install
cp .env.example .env.local   # FOUNDER_OS_DEMO_SEED=1 is already set in the example
npm run dev                  # http://127.0.0.1:4100
```

With `FOUNDER_OS_DEMO_SEED=1` the local SQLite database is seeded with demo data
on first run, so every page is populated immediately and carries a DEMO DATA
badge. Unset it once you have live data; `npm run seed` re-seeds on demand.
````

- [ ] **Step 5: Pin the engines range**

In `package.json`, set:

```json
"engines": {
  "node": ">=20 <25"
}
```

And in `.github/workflows/ci.yml`, update the comment above `setup-node` to:

```yaml
      # Node 22 in CI. Locally 20 and 24 also work (24 compiles better-sqlite3
      # from source, which is slower but fine). 18 breaks on a regex this app uses.
```

- [ ] **Step 6: Run the test to verify it passes, then the full gate**

Run: `npx vitest run tests/env-example.test.ts && npm run typecheck && npx vitest run 2>&1 | tail -4`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add .env.example README.md package.json .github/workflows/ci.yml tests/env-example.test.ts
git commit -m "docs: name the demo seed flag and pin the Node range

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin docs/seed-flag-and-node
gh pr create --base main --fill --body "Names FOUNDER_OS_DEMO_SEED in .env.example and the README, drops the Node 18 claim, pins engines to >=20 <25. Guarded by tests/env-example.test.ts.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull --ff-only
```

---

### Task 3: Comms feed cache

**Files:**
- Create: `lib/comms-feed-cache.ts`
- Modify: `app/page.tsx:133`
- Modify: `app/comms/page.tsx:25`
- Modify: `app/api/comms/route.ts`
- Modify: `app/funnel/page.tsx:346`
- Modify: `app/api/funnel/lead-message/route.ts:23`
- Test: `tests/comms-feed-cache.test.ts`

**Interfaces:**
- Consumes: `createStatusCache<T>(run, { ttlMs, now? })` from `lib/connectors/status-cache.ts`; `gatherCommsFeed(limit: number): Promise<CommsItem[]>` from `lib/comms-feed.ts`; `CommsItem` from `lib/comms.ts`.
- Produces:
  - `createCommsFeedCache(gather: (limit: number) => Promise<CommsItem[]>, opts: { ttlMs: number; cacheLimit?: number; now?: () => number }): { read(limit?: number, o?: { fresh?: boolean }): Promise<CommsItem[]>; invalidate(): void; settle(): Promise<void> }`
  - `cachedCommsFeed(limit = 40, opts?: { fresh?: boolean }): Promise<CommsItem[]>`
  - `invalidateCommsFeed(): void`

Design note: the feed is gathered once at the widest limit any caller uses (200) and sliced per caller. `gatherCommsFeed` already sorts newest first via `mergeFeed`, so a slice of the 200 is exactly what a direct call with a smaller limit would return.

- [ ] **Step 0: Branch**

Run: `git checkout -b perf/comms-feed-cache main`

- [ ] **Step 1: Write the failing test**

Create `tests/comms-feed-cache.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createCommsFeedCache } from '@/lib/comms-feed-cache';
import type { CommsItem } from '@/lib/comms';

function item(n: number): CommsItem {
  return {
    source: 'email',
    title: `mail ${n}`,
    sender: 'someone@example.com',
    preview: '',
    ts: new Date(2026, 8, 10, 12, 0, n).toISOString(),
  };
}

function producer(total = 10) {
  const calls: number[] = [];
  let run = 0;
  return {
    calls,
    gather: async (limit: number) => {
      run += 1;
      calls.push(limit);
      // newest first, like mergeFeed
      return Array.from({ length: Math.min(total, limit) }, (_, i) => ({
        ...item(total - i),
        preview: `run ${run}`,
      }));
    },
  };
}

describe('createCommsFeedCache', () => {
  it('gathers once at the cache limit and slices per caller', async () => {
    const p = producer();
    const cache = createCommsFeedCache(p.gather, { ttlMs: 60_000, cacheLimit: 8, now: () => 0 });
    const a = await cache.read(3);
    const b = await cache.read(5);
    expect(a).toHaveLength(3);
    expect(b).toHaveLength(5);
    expect(a[0].title).toBe('mail 10');
    expect(p.calls).toEqual([8]);
  });

  it('serves the stale feed after the TTL and refreshes in the background', async () => {
    const p = producer();
    let now = 0;
    const cache = createCommsFeedCache(p.gather, { ttlMs: 60_000, now: () => now });
    await cache.read();
    now = 61_000;
    const stale = await cache.read();
    expect(stale[0].preview).toBe('run 1');
    await cache.settle();
    const fresh = await cache.read();
    expect(fresh[0].preview).toBe('run 2');
    expect(p.calls).toHaveLength(2);
  });

  it('invalidate() and { fresh: true } both force a new gather', async () => {
    const p = producer();
    const cache = createCommsFeedCache(p.gather, { ttlMs: 60_000, now: () => 0 });
    await cache.read();
    await cache.read(40, { fresh: true });
    cache.invalidate();
    await cache.read();
    expect(p.calls).toHaveLength(3);
  });

  it('keeps the last good feed when a refresh throws', async () => {
    let fail = false;
    let now = 0;
    const cache = createCommsFeedCache(
      async () => {
        if (fail) throw new Error('imap down');
        return [item(1)];
      },
      { ttlMs: 1_000, now: () => now },
    );
    await cache.read();
    fail = true;
    now = 5_000;
    expect(await cache.read()).toHaveLength(1);
    await cache.settle();
    expect(await cache.read()).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/comms-feed-cache.test.ts`
Expected: FAIL with `Cannot find module '@/lib/comms-feed-cache'`.

- [ ] **Step 3: Write the cache module**

Create `lib/comms-feed-cache.ts`:

```ts
import { createStatusCache } from '@/lib/connectors/status-cache';
import { gatherCommsFeed } from '@/lib/comms-feed';
import type { CommsItem } from '@/lib/comms';

/**
 * Stale-while-revalidate wrapper around the unified comms feed.
 *
 * Home, /comms, /funnel, and two API routes each called gatherCommsFeed() on
 * every render, and each call logs into every IMAP inbox, reads the WhatsApp
 * store, and pages Slack. Measured at 4 to 5 s per page on 2026-09-10. The
 * feed is now gathered once at the widest limit any caller uses and sliced
 * per caller; after the TTL the last result is served while a refresh runs in
 * the background. A failed refresh keeps the last good feed.
 */

type Gather = (limit: number) => Promise<CommsItem[]>;

export type CommsFeedCache = {
  read(limit?: number, opts?: { fresh?: boolean }): Promise<CommsItem[]>;
  invalidate(): void;
  settle(): Promise<void>;
};

export function createCommsFeedCache(
  gather: Gather,
  opts: { ttlMs: number; cacheLimit?: number; now?: () => number },
): CommsFeedCache {
  const cacheLimit = opts.cacheLimit ?? 200;
  const cache = createStatusCache(() => gather(cacheLimit), { ttlMs: opts.ttlMs, now: opts.now });
  return {
    async read(limit = 40, o) {
      const items = await cache.get(o);
      return items.slice(0, limit);
    },
    invalidate: () => cache.invalidate(),
    settle: () => cache.settle(),
  };
}

// One cache per server process, same TTL as the connector status cache.
const FEED_TTL_MS = 60_000;
const feedCache = createCommsFeedCache(gatherCommsFeed, { ttlMs: FEED_TTL_MS });

/** Feed for pages and routes. Pass { fresh: true } to bypass the snapshot. */
export function cachedCommsFeed(limit = 40, opts?: { fresh?: boolean }): Promise<CommsItem[]> {
  return feedCache.read(limit, opts);
}

/** Drop the snapshot, for example after an inbox is added through the connect flow. */
export function invalidateCommsFeed(): void {
  feedCache.invalidate();
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/comms-feed-cache.test.ts`
Expected: 4 PASS.

- [ ] **Step 5: Switch the five callers to the cache**

In `app/page.tsx` change the import and the call:

```ts
import { cachedCommsFeed } from '@/lib/comms-feed-cache';
// ...
    cachedCommsFeed(),
```

In `app/comms/page.tsx`:

```ts
import { cachedCommsFeed } from '@/lib/comms-feed-cache';
// ...
    cachedCommsFeed(),
```

In `app/funnel/page.tsx` at the `commsFeed = await gatherCommsFeed(200)` line:

```ts
import { cachedCommsFeed } from '@/lib/comms-feed-cache';
// ...
    commsFeed = await cachedCommsFeed(200).catch(() => null);
```

In `app/api/funnel/lead-message/route.ts`:

```ts
import { cachedCommsFeed } from '@/lib/comms-feed-cache';
// ...
    cachedCommsFeed(200).catch(() => null),
```

Replace `app/api/comms/route.ts` entirely so a client can force a live pull with `?fresh=1`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { cachedCommsFeed } from '@/lib/comms-feed-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const fresh = request.nextUrl.searchParams.get('fresh') === '1';
  const feed = await cachedCommsFeed(40, { fresh });
  return NextResponse.json({ feed });
}
```

Run: `git grep -n 'gatherCommsFeed' -- app`
Expected: no output. Only `lib/comms-feed.ts` and `lib/comms-feed-cache.ts` still mention it.

- [ ] **Step 6: Invalidate the feed when an inbox key is saved**

In `app/api/connections/connect/route.ts`, next to the existing `invalidateConnectorStatuses()` call after a successful write, add:

```ts
import { invalidateCommsFeed } from '@/lib/comms-feed-cache';
// ... after invalidateConnectorStatuses();
  invalidateCommsFeed();
```

- [ ] **Step 7: Gate**

Run: `npm run typecheck && npx vitest run 2>&1 | tail -4`
Expected: PASS. If `tests/smoke-api.test.ts` asserts the comms route reads live, it still does on the first call, so it should stay green.

- [ ] **Step 8: Measure**

With the dev server on 4100 and a session cookie in `cj`:

```bash
for i in 1 2 3; do curl -s -b cj -o /dev/null -w "comms %{time_total}s\n" http://127.0.0.1:4100/comms; done
for i in 1 2; do curl -s -b cj -o /dev/null -w "home %{time_total}s\n" http://127.0.0.1:4100/; done
```
Expected: first `/comms` several seconds, second and third under 1.0 s. Second home under 1.0 s.

- [ ] **Step 9: Commit**

```bash
git add lib/comms-feed-cache.ts tests/comms-feed-cache.test.ts app/page.tsx app/comms/page.tsx app/funnel/page.tsx app/api/comms/route.ts app/api/funnel/lead-message/route.ts app/api/connections/connect/route.ts
git commit -m "perf(comms): cache the unified feed, refresh in the background

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin perf/comms-feed-cache
gh pr create --base main --fill --body "Stale-while-revalidate cache for the unified comms feed, gathered once at limit 200 and sliced per caller. Warm /comms and home render under one second.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull --ff-only
```

---

### Task 4: Persistent production server under launchd

**Files:**
- Create: `ops/launchd/ai.nodeagency.founderos.plist`
- Create: `ops/launchd/install.sh`

**Interfaces:**
- Consumes: `NEXT_DIST_DIR` support in `next.config.mjs` (already present).
- Produces: a launchd job labelled `ai.nodeagency.founderos` serving `http://127.0.0.1:4100` from `.next-prod`.

No unit test. Verification is a curl after the job starts and again after a reboot.

- [ ] **Step 0: Branch**

Run: `git checkout -b ops/launchd-server main`

- [ ] **Step 1: Confirm the production build directory is ignored**

`.gitignore` line 3 already carries `.next-*/`, which covers `.next-prod/`.

Run: `git check-ignore -v .next-prod/`
Expected: prints the `.gitignore:3:.next-*/` rule. Nothing to change.

- [ ] **Step 2: Write the plist**

Create `ops/launchd/ai.nodeagency.founderos.plist`. Paths are absolute because launchd has no shell environment. Node lives at `/opt/homebrew/opt/node@24/bin/node` on this machine; check with `which node` and adjust.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ai.nodeagency.founderos</string>

  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/opt/node@24/bin/node</string>
    <string>/Users/cristoforoperrone/code/node-ai/founderos/node_modules/.bin/next</string>
    <string>start</string>
    <string>-H</string>
    <string>127.0.0.1</string>
    <string>-p</string>
    <string>4100</string>
  </array>

  <key>WorkingDirectory</key>
  <string>/Users/cristoforoperrone/code/node-ai/founderos</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key>
    <string>production</string>
    <key>NEXT_DIST_DIR</key>
    <string>.next-prod</string>
    <key>PATH</key>
    <string>/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>HOME</key>
    <string>/Users/cristoforoperrone</string>
  </dict>

  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>10</integer>

  <key>StandardOutPath</key>
  <string>/Users/cristoforoperrone/Library/Logs/founderos.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/cristoforoperrone/Library/Logs/founderos.err.log</string>
</dict>
</plist>
```

`next start` reads `.env.local` from the working directory, so the token and every connector key are picked up without being copied into the plist. `HOME` is set because gbrain, Obsidian, WhatsApp, and Wispr resolve paths under it.

- [ ] **Step 3: Write the install script**

Create `ops/launchd/install.sh`:

```bash
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
launchctl bootstrap "gui/$(id -u)" "$PLIST_DST"
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
```

Run: `chmod +x ops/launchd/install.sh`

- [ ] **Step 4: Stop any server you started on 4100, then install**

If this session started `npm run dev` on 4100, stop it with TaskStop (never kill another session's server). Then:

```bash
ops/launchd/install.sh
```
Expected: the build finishes, then `up: http://127.0.0.1:4100 (redirects to /unlock)`.

- [ ] **Step 5: Verify it is launchd, not a shell, holding the port**

```bash
launchctl list | grep ai.nodeagency.founderos
lsof -nP -iTCP:4100 -sTCP:LISTEN
tail -3 ~/Library/Logs/founderos.log
```
Expected: the job is listed with a PID; the listener's parent is launchd (`ps -o ppid= -p <pid>` prints `1`); the log shows `Ready`.

- [ ] **Step 6: Prove the unlock works over http on the production build**

```bash
TOK=$(grep '^FOUNDER_OS_ACCESS_TOKEN=' .env.local | cut -d= -f2)
curl -s -c cj -X POST http://127.0.0.1:4100/api/unlock -H 'content-type: application/json' -d "{\"token\":\"$TOK\"}"
curl -s -b cj -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4100/
```
Expected: `{"ok":true}` then `200`. This passes because the merged unlock route sets Secure from the request protocol, not NODE_ENV.

- [ ] **Step 7: Commit**

```bash
git add ops/launchd/ai.nodeagency.founderos.plist ops/launchd/install.sh
git commit -m "ops: run the production server under launchd

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin ops/launchd-server
gh pr create --base main --fill --body "launchd job serving the production build from .next-prod on 4100, plus an install script that builds, loads the job, and waits for the port.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull --ff-only
```

- [ ] **Step 8: Reboot test (Cristoforo, once, at a convenient moment)**

Reboot the Mac, wait one minute, then `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4100/`. Expected `307`. Tick this box only after that.

---

### Task 5: Stable https URL through Tailscale Serve

**Files:**
- Modify: `docs/roadmap.md` (record the URL in "Decisions taken")

**Interfaces:**
- Consumes: the launchd server on 4100 from Task 4.
- Produces: an https URL on the tailnet, the same for every device.

The Tailscale CLI on this Mac is `/Applications/Tailscale.app/Contents/MacOS/Tailscale`; alias it as `tailscale` below.

- [ ] **Step 1: Confirm the tailnet and HTTPS certificates are enabled**

```bash
alias tailscale=/Applications/Tailscale.app/Contents/MacOS/Tailscale
tailscale status | head -3
tailscale cert --help >/dev/null && echo "cert ok"
```
Expected: this machine listed with a `100.x` address. If `tailscale serve` later complains about HTTPS, enable "HTTPS Certificates" in the tailnet DNS settings at login.tailscale.com once.

- [ ] **Step 2: Serve port 4100 over https**

```bash
tailscale serve --bg 4100
tailscale serve status
```
Expected: a line like `https://<machine>.<tailnet>.ts.net (tailnet only) |-- / proxy http://127.0.0.1:4100`.

- [ ] **Step 3: Unlock from the phone**

Open the printed URL on the phone with Tailscale connected. Expected: redirect to `/unlock`, paste the token, land on the console. The cookie is set with Secure because the request is https.

- [ ] **Step 4: Record it**

Add to the "Decisions taken" table in `docs/roadmap.md`:

```markdown
| 2026-09-1x | Production URL is https://<machine>.<tailnet>.ts.net via Tailscale Serve on 4100. |
```

```bash
git checkout -b docs/tailnet-url main
git add docs/roadmap.md
git commit -m "docs: record the tailnet URL for the production server

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin docs/tailnet-url
gh pr create --base main --fill --body "https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull --ff-only
```

---

### Task 6: Real model on the AI Gateway

**Files:**
- Modify: `.env.local` (untracked; `LLM_MODEL` line only)

**Interfaces:**
- Consumes: `AI_GATEWAY_API_KEY` already in `.env.local`; `LLM_MODEL` read once at module load in `lib/connectors/llm.ts:46`.
- Produces: agent and Conductor chat on `anthropic/claude-sonnet-5`.

- [ ] **Step 1: Check the gateway balance**

```bash
KEY=$(grep '^AI_GATEWAY_API_KEY=' .env.local | cut -d= -f2)
curl -s https://ai-gateway.vercel.sh/v1/credits -H "Authorization: Bearer $KEY"
```
Expected: JSON with a positive `balance`. If it is zero, top up at vercel.com/nodeai-projects/~/ai (Cristoforo's action, declined the MCP purchase on 2026-09-10) and re-run.

- [ ] **Step 2: Switch the model**

In `.env.local` set:

```
LLM_MODEL=anthropic/claude-sonnet-5
```

- [ ] **Step 3: Restart the production server (module-load variable)**

```bash
ops/launchd/install.sh
```
Expected: `up:` line.

- [ ] **Step 4: Prove it**

```bash
TOK=$(grep '^FOUNDER_OS_ACCESS_TOKEN=' .env.local | cut -d= -f2)
curl -s -X POST http://127.0.0.1:4100/api/agents/conductor/chat \
  -H "Authorization: Bearer $TOK" -H 'content-type: application/json' \
  -d '{"message":"Which agent handles Stripe, and what did it last report?"}'
```
Expected: JSON with a `reply` naming `payments-pulse` or `stripe-sales`, no `error`. Then open `/integrations` and confirm the LLM tile detail names the Sonnet model.

- [ ] **Step 5: Tick 1.6 in `docs/roadmap.md` and commit**

```bash
git checkout -b docs/phase-1-done main
git add docs/roadmap.md
git commit -m "docs: phase 1 complete, chat on claude-sonnet-5

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin docs/phase-1-done
gh pr create --base main --fill --body "https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull --ff-only
```

---

## Self-review notes

- Spec coverage: roadmap items 1.1 to 1.6 map to Tasks 1 to 6 in order.
- The connect-flow invalidation in Task 3 Step 6 assumes `invalidateConnectorStatuses()` is already called in `app/api/connections/connect/route.ts` after the merge. If it is not, add both calls after the successful `upsertEnvLocal`.
- `paperclipStatus(env)` takes an env record per `lib/connectors/paperclip.ts:7`; Task 1 Step 4 relies on that signature.
- `createStatusCache` `get({ fresh })` is the only entry point used; `cacheLimit` slicing depends on `mergeFeed` sorting newest first, which `lib/comms.ts:26-31` does.

# Phase 2: Make the Data Ours Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every page of the OS shows Node AI data or an honest empty state, nothing reports connected without a network call behind it, the ManyChat webhook cannot be posted to anonymously, and a real chat records what it cost.

**Architecture:** Mostly deletion. The demo seed stays in `lib/seed.ts` as a test fixture (Vitest sets `FOUNDER_OS_DEMO_SEED=1` globally and fifteen suites build their fixtures from it), but the running app stops seeding and the local database is wiped. Connector modules that never make a network call are deleted with their tiles, tests, and funnel mappers. The catalog keeps its 44 unwired tiles (Cristoforo's 2026-09-10 decision) but they lose the Connect button that wrote keys nothing read. The brain page reads counts from `gbrain stats` through the provider method that already exists. Chat writes an `agent_runs` row carrying the gateway's token usage, priced by the existing `runCostUsd`. Bennett's ventures become Node AI's lines of business through one enum, one registry, and one classifier.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, better-sqlite3, Zod, Vitest, `react-dom/server` for component tests, launchd production server, gbrain CLI.

**Spec:** `docs/roadmap.md`, section "Phase 2: make the data ours". Task numbers below match the roadmap's 2.x numbers in the headings.

## Global Constraints

- No em dashes or en dashes in code, comments, docs, or commit messages. Existing code contains many; do not add new ones, and remove them from any line you rewrite.
- Conventional commits: the commit-msg hook accepts only `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`. Subject 72 characters or fewer, no `Co-Authored-By` lines, end the body with `Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe`.
- Stage explicit paths. Never `git add -A` or `git add .`.
- `main` is protected. Each task lands as one branch and one pull request, merged by a founder with `gh pr merge <branch> --merge --delete-branch --admin` under the personal GitHub account, never `nodeagencyai`, never the web UI. After every merge run `ops/launchd/install.sh` so the production server on 4100 picks the change up.
- Never force-push. Never bypass the pre-commit secret scanner.
- `npm test && npm run typecheck` green before every commit that touches code. The `verify` CI check also runs the production build.
- Never write a secret value into a tracked file. Keys live in `.env.local` only.
- Do not kill the server on 4100; it is the launchd production job. Preview on a different port if a dev server is needed (`PORT=4101 npm run dev`).
- Test files live in `tests/`, one per module, and use `openDb(':memory:')` or `vi.stubEnv('FOUNDER_OS_DB', ':memory:')` plus `vi.resetModules()` when they touch the DB. Route-handler tests use a tmpdir DB file because route modules read the path at first access.
- Roadmap discipline: tick a 2.x box in `docs/roadmap.md` only after its "Verify" line has actually run, in the same PR as the task.

## Decisions this plan makes (add to the roadmap decisions table as each lands)

| Task | Decision |
|---|---|
| 2.1 | `lib/seed.ts` stays as the test fixture. The running app stops seeding; the local DB is wiped after a backup. The roadmap's "no name from lib/seed.ts" criterion is met by the wipe, not by editing the fixture. |
| 2.2 | Delete the connector modules `meta-ads`, `trakyo`, `ghl`, the funnel mappers `funnel-ghl` and `funnel-trakyo`, their tests, the three catalog tiles, and the seed rows `tool-skool`, `tool-ghl`, `tool-trakyo`. `FunnelSourceSchema` keeps its `trakyo`, `meta-ads`, `ghl` values because seeded touches are labelled with them; they are labels of past touches, not connectors. |
| 2.3 | Keep the 44 unwired tiles (Cristoforo, 2026-09-10) but a tile without a `connectorId` gets no Connect button; it renders a "Not wired" pill. Delete the `SQUARE_ACCESS_TOKEN` and `WHOP_API_KEY` slots and the `tool-square`, `tool-whop` seed rows. |
| 2.4 | Venture ids become `agency`, `clientos`, `leadgenos` (labels Agency, ClientOS, LeadGenOS). ASSUMPTION for Cristoforo to confirm or overturn; the rename is one enum, one registry, one classifier, so changing the names again is cheap. The two FanBasis processor slots are deleted; Node AI takes payment through Stripe. Agent ids such as `vantage-sales` stay until phase 3 rewrites the roster. |
| 2.6 | Comments that say Alex are rewritten too, because the roadmap's grep criterion counts them. The localStorage keys change, which resets the picked theme and the conductor panel width once. |
| 2.7 | The gbrain version string is dropped from the page rather than fetched; `gbrain --help` reports 0.48.5 today and the number adds nothing. The pipeline tiles read `gbrain stats`; when the CLI is unreachable they show `n/a`, never a cached number. |
| 2.8 | Every chat turn writes an `agent_runs` row. Token fields are null when the provider returns no usage (the stub), priced with `runCostUsd` when it does. The conductor's routing call is recorded as a run of `conductor`. |

---

### Task 1 (roadmap 2.1): Turn the seed off and give empty pages an honest state

**Files:**
- Modify: `.env.local` (remove the `FOUNDER_OS_DEMO_SEED=1` line; this file is gitignored)
- Delete after backup: `data/founder-os.db`, `data/founder-os.db-wal`, `data/founder-os.db-shm` (gitignored)
- Create: `components/EmptyState.tsx`
- Modify: `app/roadmap/page.tsx`, `app/reference/page.tsx`, `app/agents/page.tsx`
- Modify: `docs/roadmap.md` (tick 2.1, add the backlog list)
- Test: `tests/empty-state.test.ts`

**Interfaces:**
- Consumes: `PageHeader` from `components/PageHeader.tsx`, `Label` from `components/terminal.tsx`.
- Produces: `EmptyState({ title, detail, next? }: { title: string; detail: string; next?: string }): JSX.Element` rendering a bordered box with `data-empty-state` on its root.

- [ ] **Step 1: Branch**

```bash
cd /Users/cristoforoperrone/code/node-ai/founderos
git checkout -b chore/seed-off main
```

- [ ] **Step 2: Write the failing component test**

Create `tests/empty-state.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  test('renders title, detail and the optional next step with a stable marker', () => {
    const markup = renderToStaticMarkup(
      createElement(EmptyState, { title: 'No roadmap items', detail: 'Nothing has been planned yet.', next: 'Add items in phase 3.' }),
    );
    expect(markup).toContain('data-empty-state');
    expect(markup).toContain('No roadmap items');
    expect(markup).toContain('Nothing has been planned yet.');
    expect(markup).toContain('Add items in phase 3.');
  });

  test('omits the next line when not given', () => {
    const markup = renderToStaticMarkup(createElement(EmptyState, { title: 'Empty', detail: 'Nothing here.' }));
    expect(markup).not.toContain('next');
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run tests/empty-state.test.ts`
Expected: FAIL, cannot resolve `@/components/EmptyState`.

- [ ] **Step 4: Create the component**

Create `components/EmptyState.tsx`:

```tsx
/**
 * Honest empty state. Shown when a table has no rows for a page, instead of a
 * blank grid. Says what is missing and, when known, what will fill it.
 */
export function EmptyState({ title, detail, next }: { title: string; detail: string; next?: string }) {
  return (
    <div data-empty-state className="rounded-lg-t border border-dashed border-os-border bg-os-surface px-[17px] py-[15px]">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-os-dim">{title}</div>
      <p className="mt-2 text-[11.5px] text-os-muted">{detail}</p>
      {next ? <p className="mt-1 font-mono text-[10px] text-os-dim">{next}</p> : null}
    </div>
  );
}
```

- [ ] **Step 5: Run the test to see it pass**

Run: `npx vitest run tests/empty-state.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Use it on the three pages that render blank**

`app/roadmap/page.tsx`: add `import { EmptyState } from '@/components/EmptyState';` and wrap the two grids. Replace the `<section className="mb-9">` phases block's inner grid with:

```tsx
        {phases.length === 0 ? (
          <EmptyState title="No phases" detail="The phases table is empty; the demo seed is off." next="Phase 3 writes real phases from the encoded company." />
        ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 ultra:grid-cols-6">
          {/* existing phases.map(...) unchanged */}
        </div>
        )}
```

and directly under `<SectionHead label="Quarter by quarter" />`:

```tsx
      {quarters.length === 0 ? (
        <EmptyState title="No roadmap items" detail="The roadmap table is empty; the demo seed is off." next="docs/roadmap.md is the plan until phase 3 loads it here." />
      ) : (
        /* existing quarters grid unchanged */
      )}
```

`app/reference/page.tsx`: same import; replace the grid with:

```tsx
      {domains.length === 0 ? (
        <EmptyState title="No operating domains" detail="The domains table is empty; the demo seed is off." next="Phase 3.1 decides the reference model for Node AI." />
      ) : (
        /* existing grid unchanged */
      )}
```

`app/agents/page.tsx`: same import; directly inside `<div className="space-y-8">` before `departments.map`:

```tsx
        {agents.length === 0 ? (
          <EmptyState
            title="No agents in the roster"
            detail="The agents table is empty; the demo seed is off. The runtime still has its agents and answers on /api/agents/<id>/run and /chat."
            next="Phase 3.4 reads the roster from the encoded company folder."
          />
        ) : null}
```

- [ ] **Step 7: Turn the seed off locally and wipe the seeded database**

The DB file is gitignored and holds only seeded rows plus two chat messages (counted 2026-09-11: 288 `seed-run-*` runs, 455 `seed-dummy` snapshots, everything else from `lib/seed.ts`). Back it up under a name `.gitignore` already covers (`data/*.db-*`).

```bash
sed -i '' '/^FOUNDER_OS_DEMO_SEED=/d' .env.local
grep -c FOUNDER_OS_DEMO_SEED .env.local || true
cp data/founder-os.db data/founder-os.db-seeded-2026-09-11
rm -f data/founder-os.db data/founder-os.db-wal data/founder-os.db-shm
```

Expected: grep prints `0`; `ls data/` shows the backup and no `founder-os.db`.

- [ ] **Step 8: Gate, then rebuild production and watch which pages go empty**

```bash
npm test && npm run typecheck
ops/launchd/install.sh
```

`install.sh` builds into `.next-prod`, restarts the launchd job, and the first request recreates an empty `data/founder-os.db` (schema only, no seed because the flag is unset). Then walk every page through the auth gate:

```bash
TOKEN=$(grep '^FOUNDER_OS_ACCESS_TOKEN=' .env.local | cut -d= -f2-)
curl -s -c /tmp/fos.jar -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:4100/api/unlock \
  -H 'content-type: application/json' -d "{\"token\":\"$TOKEN\"}"
for p in / /comms /social /agents /org /brain /roadmap /analytics /funnel /reference /integrations /finances; do
  html=$(curl -s -b /tmp/fos.jar "http://127.0.0.1:4100$p")
  code=$(curl -s -b /tmp/fos.jar -o /dev/null -w '%{http_code}' "http://127.0.0.1:4100$p")
  empty=$(printf '%s' "$html" | grep -c 'data-empty-state' || true)
  demo=$(printf '%s' "$html" | grep -c 'DEMO DATA' || true)
  echo "$p $code empty-states=$empty demo-mark=$demo"
done
sqlite3 data/founder-os.db "select count(*) from agent_runs where id like 'seed-%'"
sqlite3 data/founder-os.db "select count(*) from agents"
```

Expected: unlock returns `200`; every page `200`; `demo-mark=0` everywhere; `/roadmap` shows 2 empty states, `/reference` 1, `/agents` 1; both sqlite counts are `0`. Open `https://cristoforos-macbook-pro.tail75c26d.ts.net` in the browser for `/`, `/social`, `/brain`, `/org`, `/funnel`, `/analytics` and note which sections are blank without a message. That list is the backlog.

- [ ] **Step 9: Record the backlog and tick 2.1 in the roadmap**

In `docs/roadmap.md`, change `- [ ] **2.1 Turn the seed off.**` to `- [x] **2.1 Turn the seed off.** Done 2026-09-11, PR #<n>. Seed stays as the test fixture; local DB wiped (backup `data/founder-os.db-seeded-2026-09-11`).` and add after the 2.8 bullet, before `Exit:`:

```markdown
Pages that went empty when the seed came off (2026-09-11), the real backlog:

| Page | What is blank | Fills in |
|---|---|---|
| /agents | roster (agents table); runtime agents still answer on the API | 3.4 |
| /roadmap | phases and quarters | 3.x when the roadmap moves into the OS |
| /reference | operating domains | 3.1 |
| /org | hierarchy board (departments, agents) | 3.4 |
| /brain | knowledge graph nodes from agents, people, SOPs; memory constellation stays (store walk) | 3.4 |
| /social | audience charts and DM inbox; live Zernio posts still render | live sources |
| /analytics | run volume and cost panel until 2.8 lands | 2.8, 3.6 |
| /funnel | journeys until Attio has deals | live Attio |
| / | ticker and now-quarter card | as above |
```

Adjust the table to what Step 8 actually showed; do not keep a row that was not blank.

- [ ] **Step 10: Commit, push, PR, merge, reinstall**

```bash
git add components/EmptyState.tsx tests/empty-state.test.ts app/roadmap/page.tsx app/reference/page.tsx app/agents/page.tsx docs/roadmap.md
git commit -m "chore: turn the demo seed off, honest empty states

FOUNDER_OS_DEMO_SEED is unset locally and the seeded database is wiped.
lib/seed.ts stays as the test fixture. Pages whose tables emptied show
an EmptyState instead of a blank grid; the roadmap records which pages
went empty as the phase 3 backlog.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin chore/seed-off
gh pr create --base main --fill --body "Roadmap 2.1. Seed off locally, DB wiped after backup, EmptyState on /roadmap, /reference, /agents, backlog table added to the roadmap.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

---

### Task 2 (roadmap 2.5): Close the ManyChat webhook

**Files:**
- Modify: `app/api/webhooks/manychat/route.ts`
- Modify: `.env.example` (the comment on `MANYCHAT_WEBHOOK_SECRET`)
- Test: `tests/manychat-webhook-route.test.ts`

**Interfaces:**
- Consumes: `safeEqual(a: string, b: string): boolean` from `lib/auth.ts`.
- Produces: `POST` returns 503 when `MANYCHAT_WEBHOOK_SECRET` is unset or blank, 401 on a wrong header, 200 on a match. No `GET` export.

- [ ] **Step 1: Branch**

```bash
git checkout -b fix/manychat-webhook-gate main
```

- [ ] **Step 2: Write the failing tests**

In `tests/manychat-webhook-route.test.ts`, the `beforeAll` currently deletes `MANYCHAT_WEBHOOK_SECRET` and the first test ingests a DM with no secret. Change that test to set the secret and send the header, and add two tests. Replace the file body after the imports and `beforeAll` with:

```ts
const ROUTE = '@/app/api/webhooks/manychat/route';
const body = { subscriber_id: 'ig-42', name: 'Test Person', username: 'test.person', text: 'hi from the test', platform: 'instagram' };

function post(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/webhooks/manychat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/webhooks/manychat', () => {
  test('503s when the secret is blank or unset: never open by default', async () => {
    const { POST } = await import(ROUTE);
    delete process.env.MANYCHAT_WEBHOOK_SECRET;
    expect((await POST(post({ 'x-manychat-secret': 'fake-anything' }))).status).toBe(503);
    process.env.MANYCHAT_WEBHOOK_SECRET = '';
    expect((await POST(post())).status).toBe(503);
  });

  test('401s on a missing or wrong header, 200 and stores the DM on a match', async () => {
    const { POST } = await import(ROUTE);
    process.env.MANYCHAT_WEBHOOK_SECRET = 'fake-secret';
    expect((await POST(post())).status).toBe(401);
    expect((await POST(post({ 'x-manychat-secret': 'fake-secre' }))).status).toBe(401);
    const ok = await POST(post({ 'x-manychat-secret': 'fake-secret' }));
    expect(ok.status).toBe(200);
    const json = await ok.json();
    expect(json.ok).toBe(true);
    expect(json.subscriberId).toBe('ig-42');
  });

  test('400s on a payload without a subscriber id', async () => {
    const { POST } = await import(ROUTE);
    process.env.MANYCHAT_WEBHOOK_SECRET = 'fake-secret';
    const res = await POST(
      new Request('http://localhost/api/webhooks/manychat', { method: 'POST', headers: { 'x-manychat-secret': 'fake-secret' }, body: '{}' }),
    );
    expect(res.status).toBe(400);
  });

  test('exposes no GET handler', async () => {
    const mod = await import(ROUTE);
    expect('GET' in mod).toBe(false);
  });
});
```

Keep the existing `beforeAll` that points `FOUNDER_OS_DB` at a tmpdir. Check the field names of the payload against `parseManyChatWebhook` in `lib/connectors/manychat-webhook.ts` and the existing first test in this file; use the same fixture shape the existing test used.

- [ ] **Step 3: Run to see them fail**

Run: `npx vitest run tests/manychat-webhook-route.test.ts`
Expected: FAIL on the 503 test (currently 200) and the GET test.

- [ ] **Step 4: Rewrite the route**

Replace `app/api/webhooks/manychat/route.ts` with:

```ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/data';
import { safeEqual } from '@/lib/auth';
import { parseManyChatWebhook } from '@/lib/connectors/manychat-webhook';

export const dynamic = 'force-dynamic';

/**
 * ManyChat "External Request" ingest. ManyChat's API cannot be polled for DMs,
 * so this push endpoint is how the /social Instagram DM inbox goes live: point
 * a ManyChat automation's External Request (POST) at this URL with a JSON body
 * carrying the contact and message. Each message upserts by id, so replays do
 * not duplicate.
 *
 * This route sits outside the operator auth gate (lib/auth.ts PUBLIC_PATHS),
 * so it must gate itself: MANYCHAT_WEBHOOK_SECRET is required. With no secret
 * the endpoint is closed (503), not open. The header is compared in constant
 * time. There is no GET: a public health check leaked whether the secret was
 * set and how many DMs were stored.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET ?? '';
  if (secret.length === 0) {
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }
  const presented = request.headers.get('x-manychat-secret') ?? '';
  if (!safeEqual(presented, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const message = parseManyChatWebhook(raw);
  if (!message) {
    return NextResponse.json({ error: 'payload missing a subscriber id' }, { status: 400 });
  }

  getDb().social.upsertDmMessage(message);
  return NextResponse.json({ ok: true, id: message.id, subscriberId: message.subscriberId });
}
```

In `.env.example`, replace the comment lines above `MANYCHAT_WEBHOOK_SECRET=` (lines 77 to 79 today) with:

```
# Required for /api/webhooks/manychat. With no secret the endpoint answers 503;
# it is never open. Send the same value in the x-manychat-secret header.
```

- [ ] **Step 5: Run the tests to see them pass, then the full gate**

Run: `npx vitest run tests/manychat-webhook-route.test.ts && npm test && npm run typecheck`
Expected: all PASS. `tests/env-example.test.ts` still passes (the key name is unchanged).

- [ ] **Step 6: Tick 2.5, commit, PR, merge, reinstall**

Tick `2.5` in `docs/roadmap.md` with the date and PR number.

```bash
git add app/api/webhooks/manychat/route.ts tests/manychat-webhook-route.test.ts .env.example docs/roadmap.md
git commit -m "fix: close the ManyChat webhook when no secret is set

Blank MANYCHAT_WEBHOOK_SECRET is a 503, the header is compared with
safeEqual, and the unauthenticated GET is gone.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin fix/manychat-webhook-gate
gh pr create --base main --fill --body "Roadmap 2.5. The webhook sits outside the auth gate and now gates itself: 503 without a secret, constant-time compare, no GET.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

Verify on production: `curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:4100/api/webhooks/manychat -d '{}'` prints `503` (no secret in `.env.local`) or `401` (secret set).

---

### Task 3 (roadmap 2.2): Delete the four lying tiles

**Files:**
- Delete: `lib/connectors/meta-ads.ts`, `lib/connectors/trakyo.ts`, `lib/connectors/ghl.ts`, `lib/funnel-ghl.ts`, `lib/funnel-trakyo.ts`
- Delete: `tests/funnel-ghl.test.ts`, `tests/funnel-ghl-source.test.ts`, `tests/funnel-trakyo.test.ts`
- Modify: `lib/integrations-catalog.ts` (remove the `gohighlevel`, `meta`, `trakyo` tiles)
- Modify: `lib/seed.ts` (remove `tool-skool`, `tool-ghl`, `tool-trakyo`; change the workflow step tool `'skool'` to `'notion'`)
- Modify: `app/funnel/page.tsx`, `app/api/funnel/route.ts`, `lib/screen-context.ts`, `lib/agents/real.ts`
- Modify: `.env.example` (remove `TRAKYO_API_KEY`, `GHL_API_KEY`, `GHL_LOCATION_ID`, `META_ADS_ACCESS_TOKEN` if present)
- Modify: `CLAUDE.md` (the `/funnel` view line no longer promises Trakyo and Meta Ads)
- Test: `tests/connector-index.test.ts`, `tests/connectors.test.ts`, `tests/agency-tools.test.ts`, `tests/integrations-catalog.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `INTEGRATIONS` has 59 entries; `connectionCatalog` never sees a `connectorId` of `ghl`, `meta-ads`, or `trakyo`; `/funnel` and `/api/funnel` read Attio only.

- [ ] **Step 1: Branch**

```bash
git checkout -b refactor/lying-tiles main
```

- [ ] **Step 2: Write the failing catalog and registry tests**

In `tests/integrations-catalog.test.ts`, replace the test titled with the previous owner's name and the six connectorId assertions (lines 104 to 112 today) with:

```ts
  test('no tile points at a connector that is not registered', async () => {
    const { allConnectorStatuses } = await import('@/lib/connectors');
    const registered = new Set((await allConnectorStatuses({ fresh: true })).map((s) => s.id));
    for (const i of INTEGRATIONS) {
      if (i.connectorId) expect(registered.has(i.connectorId), `${i.slug} -> ${i.connectorId}`).toBe(true);
    }
  });

  test('the tiles that reported connected without a network call are gone', () => {
    const slugs = new Set(INTEGRATIONS.map((i) => i.slug));
    for (const gone of ['gohighlevel', 'meta', 'trakyo', 'skool']) expect(slugs.has(gone), gone).toBe(false);
  });
```

Note: the first test will also fail for `manychat`, `beehiiv`, `zernio`, `webinarjam`, `miro`, `arcads`, `paperclip` if their connectors are not in `CHECKS`. `paperclip` is registered. For the other six, remove the `connectorId` (keep the tile, keep `envKeys`) so the tile stops claiming a link it does not have; task 4 then takes their Connect button away with the rest of the unwired tiles. Record that in the commit body.

In `tests/connector-index.test.ts`, delete the nine `vi.mock` lines for modules `index.ts` no longer imports: `zernio`, `beehiiv`, `manychat`, `arcads`, `miro`, `webinarjam`, `trakyo`, `meta-ads`, `ghl`. Add:

```ts
test('the registry has no entry without a status function', async () => {
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
  const statuses = await allConnectorStatuses({ fresh: true });
  const ids = statuses.map((s) => s.id).sort();
  expect(ids).toEqual(['attio', 'calendar', 'email', 'gbrain', 'llm', 'local-stack', 'notion', 'obsidian', 'paperclip', 'payments', 'slack', 'whatsapp', 'wispr']);
  for (const gone of ['ghl', 'meta-ads', 'trakyo', 'skool']) expect(ids).not.toContain(gone);
});
```

In `tests/connectors.test.ts`, delete the `metaAdsStatus` and `ghlStatus` describe blocks and their two imports. In `tests/agency-tools.test.ts`, delete the `trakyoStatus` describe block and import.

- [ ] **Step 3: Run to see the new tests fail**

Run: `npx vitest run tests/integrations-catalog.test.ts tests/connector-index.test.ts`
Expected: FAIL on the "gone" test (tiles still present) and the registry test if any mock reference is stale.

- [ ] **Step 4: Delete the modules and their tests**

```bash
git rm lib/connectors/meta-ads.ts lib/connectors/trakyo.ts lib/connectors/ghl.ts lib/funnel-ghl.ts lib/funnel-trakyo.ts
git rm tests/funnel-ghl.test.ts tests/funnel-ghl-source.test.ts tests/funnel-trakyo.test.ts
```

- [ ] **Step 5: Remove the callers**

`app/funnel/page.tsx`:
- Delete the imports of `ghlFunnelJourneys`, `mergeTrakyoTouches`/`trakyoTouches`, `ghlStatus`, `trakyoStatus`, `metaAdsStatus`.
- Replace the live block (from `const [attioLive, ghlLive]` through `const allJourneys = ...`) with:

```ts
  // Live-first: Attio when its key resolves; the local table otherwise.
  const attioLive = await attioFunnelJourneys(now);
  const liveJourneys = attioLive?.journeys ?? [];
  const isLive = liveJourneys.length > 0;
  const excludedCount = attioLive?.closedLost ?? 0;
  const liveLabel = isLive ? `Attio ${attioLive?.total ?? liveJourneys.length}` : '';
  const allJourneys = isLive
    ? liveJourneys.filter((j) => !venture || j.venture === venture)
    : getDb().funnel.journeys(venture);
```

- Replace the four-way `Promise.all` of statuses with `const attio = await attioStatus();` and keep only the Attio `<SourceCheck ... />` line in the header.

`app/api/funnel/route.ts`: same shape, Attio only, and `source: isLive ? 'attio' : 'local'`:

```ts
  const attioLive = await attioFunnelJourneys(now);
  const liveJourneys = attioLive?.journeys ?? [];
  const isLive = liveJourneys.length > 0;
  const all = isLive ? liveJourneys.filter((j) => !venture || j.venture === venture) : getDb().funnel.journeys(venture);
  const { active, archived } = splitFunnelJourneys(all, now);
  return NextResponse.json({
    summary: funnelSummary(active),
    journeys: active,
    archived,
    source: isLive ? 'attio' : 'local',
    ...(isLive ? { excluded: attioLive?.closedLost ?? 0, total: attioLive?.total ?? 0 } : {}),
  });
```

Check `tests/api.test.ts` around line 180 for an assertion on `source`; if it expects `'seed'`, change it to `'local'`.

`lib/screen-context.ts`: drop the `funnel-ghl` import; `const attioLive = await attioFunnelJourneys(now); const live = attioLive?.journeys ?? [];` and `const sources = live.length > 0 ? \`Attio ${attioLive?.total} (live)\` : 'local table';`.

`lib/agents/real.ts`: delete the `trakyoStatus` import; in the `launchpad-cohort-sales` agent's `run()` use only `webinarjamStatus()`:

```ts
    async run() {
      const webinar = await webinarjamStatus();
      return {
        ok: webinar.state === 'connected',
        summary: `Launchpad Cohort · WebinarJam ${webinar.state}${webinar.state === 'connected' ? '' : ' (set WEBINARJAM_API_KEY to pull webinar leads)'}`,
        data: { webinar },
      };
    },
```

`lib/integrations-catalog.ts`: delete the three tile lines (`gohighlevel`, `meta`, `trakyo`) and remove `connectorId` from `manychat`, `beehiiv`, `zernio`, `webinarjam`, `miro`, `arcads` (see Step 2 note). Update the header comment's "everything else reads as not connected" sentence to say a tile without `connectorId` is not wired and offers no Connect button (task 4 enforces it).

`lib/seed.ts`: delete the `tool-skool`, `tool-ghl`, `tool-trakyo` rows; in the workflow step with `tools: ['skool', 'notion']` change to `tools: ['notion']` and the automation title `'Skool community ops'` to `'Community ops'`.

`.env.example`: delete the `TRAKYO_API_KEY`, `GHL_API_KEY`, `GHL_LOCATION_ID` lines and any `META_ADS_ACCESS_TOKEN` line. Run `npx vitest run tests/env-example.test.ts` afterwards; if it enumerates keys, update it.

`CLAUDE.md`: in the Views paragraph change the `/funnel` description to "living client-journey flow (stage columns left to right, one node per client, touch markers per path; Attio live, local table otherwise)".

- [ ] **Step 6: Find every remaining reference**

```bash
grep -rn "funnel-ghl\|funnel-trakyo\|connectors/ghl\|connectors/trakyo\|connectors/meta-ads\|ghlStatus\|trakyoStatus\|metaAdsStatus\|ghlFunnelJourneys\|trakyoTouches" lib app components tests
```

Expected: no output. `tests/funnel.test.ts` fixtures using `source: 'ghl'` are fine (the enum keeps the value).

- [ ] **Step 7: Gate**

Run: `npm test && npm run typecheck`
Expected: green. If `tests/seed.test.ts` counts tools (36), update the count to 33.

- [ ] **Step 8: Tick 2.2, commit, PR, merge, reinstall**

```bash
git add -u lib app components tests .env.example CLAUDE.md docs/roadmap.md
git status --short
```

Review the list: only the files named in this task. Then:

```bash
git commit -m "refactor: delete the connectors that reported connected without a call

Meta Ads, Trakyo and GoHighLevel returned connected on the presence of a
key alone; Skool was a seeded connected row with no connector. Their
modules, funnel mappers, tiles, seed rows and tests are gone. The funnel
reads Attio or the local table. Six tiles whose connectors are not in
the registry lose their connectorId so the catalog claims nothing it
cannot check.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin refactor/lying-tiles
gh pr create --base main --fill --body "Roadmap 2.2. Deletes the three keyed-but-never-called connectors and the Skool seed row; /integrations lists only connectors with a real status function.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

Verify: `curl -s -b /tmp/fos.jar http://127.0.0.1:4100/api/connections | jq -r '.connections[].id' | sort` lists the 13 registered ids and nothing else.

---

### Task 4 (roadmap 2.3): Unwired tiles get no Connect button; drop the dead key slots

**Files:**
- Modify: `lib/integrations-catalog.ts` (`connectKeysFor`)
- Modify: `components/ConnectFlow.tsx` (the fallback pill copy)
- Modify: `lib/keys.ts` (remove `SQUARE_ACCESS_TOKEN`, `WHOP_API_KEY`)
- Modify: `lib/seed.ts` (remove `tool-square`, `tool-whop`)
- Modify: `.env.example` (remove the two lines)
- Test: `tests/integrations-catalog.test.ts`, `tests/connections-connect.test.ts`, `tests/keys.test.ts`

**Interfaces:**
- Consumes: `Integration` from `lib/schemas.ts`.
- Produces: `connectKeysFor(entry)` returns `[]` for any entry without `connectorId`; the connect route therefore 400s for those slugs (it already rejects keys not in `connectKeysFor`).

- [ ] **Step 1: Branch**

```bash
git checkout -b refactor/unwired-tiles main
```

- [ ] **Step 2: Write the failing tests**

In `tests/integrations-catalog.test.ts` add:

```ts
  test('every tile that offers a Connect key has a connector behind it', () => {
    for (const i of INTEGRATIONS) {
      if (connectKeysFor(i).length > 0) expect(i.connectorId, `${i.slug} offers keys with no connectorId`).toBeTruthy();
    }
  });
```

and in the existing `connectKeysFor` test change the Discord expectation to `expect(connectKeysFor(discord)).toEqual([]);` (Discord has no connector).

In `tests/connections-connect.test.ts`, the test that posts `{ slug: 'discord', values: { DISCORD_API_KEY: 'dsc-1' } }` and any later use of `discord` must now expect `400`. Read the file; change those expectations, and pick a wired multi-key example (`paypal` is not wired either; use `slack` with `SLACK_BOT_TOKEN`) where a second successful write is needed.

In `tests/keys.test.ts`, replace `WHOP_API_KEY` with `NOTION_API_KEY`-style names that still exist: use `PAYPAL_CLIENT_ID` in the two places (`upsertEnvLocal(file, 'PAYPAL_CLIENT_ID', 'pp-123')` and the trailing-line assertion). Add:

```ts
  test('the Square and Whop slots are gone: nothing read them', () => {
    const vars = KEY_SLOTS.map((s) => s.envVar);
    expect(vars).not.toContain('SQUARE_ACCESS_TOKEN');
    expect(vars).not.toContain('WHOP_API_KEY');
  });
```

(import `KEY_SLOTS` from `@/lib/keys`; export it if it is not exported yet).

- [ ] **Step 3: Run to see them fail**

Run: `npx vitest run tests/integrations-catalog.test.ts tests/connections-connect.test.ts tests/keys.test.ts`
Expected: FAIL on the new invariant, the Discord expectations, and the slots test.

- [ ] **Step 4: Implement**

`lib/integrations-catalog.ts`, replace `connectKeysFor`:

```ts
/** The env var names the connect flow may write for an entry. A tile with no
 *  connectorId is not wired, so it gets no keys and no Connect button: a key
 *  nothing reads is not a connection. For wired tiles explicit envKeys win;
 *  no envKeys means a generic <SLUG>_API_KEY; [] means guidance only (the tool
 *  connects through something other than a pasted key). */
export function connectKeysFor(entry: Integration): string[] {
  if (!entry.connectorId) return [];
  if (entry.envKeys) return entry.envKeys;
  return [`${entry.slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_API_KEY`];
}
```

`components/ConnectFlow.tsx`: the fallback pill (the `Setup` span) shows for both "guidance only" and "not wired". Give it an honest label: pass `wired={Boolean(entry.connectorId)}` from where `ConnectFlow` is rendered (find the call site in `app/integrations/page.tsx` or the tile component), and render:

```tsx
        <span
          title={wired ? guidance ?? 'Connects through local setup, not a pasted key' : 'No connector behind this tile yet'}
          className="cursor-help rounded-full border border-os-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-os-dim"
        >
          {wired ? 'Setup' : 'Not wired'}
        </span>
```

`lib/keys.ts`: delete the `SQUARE_ACCESS_TOKEN` and `WHOP_API_KEY` slot lines; `export const KEY_SLOTS` if it is `const KEY_SLOTS`.

`lib/seed.ts`: delete the `tool-square` and `tool-whop` rows. `.env.example`: delete lines `SQUARE_ACCESS_TOKEN=` and `WHOP_API_KEY=`.

- [ ] **Step 5: Gate**

Run: `npm test && npm run typecheck`
Expected: green. If a seed test counts tools, adjust (33 to 31).

- [ ] **Step 6: Tick 2.3, commit, PR, merge, reinstall**

In the roadmap decisions table add: `2026-09-11 | The 44 unwired tiles stay listed but offer no Connect button (task 2.3). Which of them to wire this quarter is still Cristoforo's call.`

```bash
git add lib/integrations-catalog.ts components/ConnectFlow.tsx app/integrations lib/keys.ts lib/seed.ts .env.example tests/integrations-catalog.test.ts tests/connections-connect.test.ts tests/keys.test.ts docs/roadmap.md
git commit -m "refactor: no Connect button on tiles without a connector

connectKeysFor returns nothing for an unwired tile, so the connect flow
cannot write a key nothing reads. The Square and Whop key slots and seed
rows are gone for the same reason.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin refactor/unwired-tiles
gh pr create --base main --fill --body "Roadmap 2.3. Every tile with a Connect button now has a connectorId, enforced by a test. The 44 unwired tiles stay listed per the 2026-09-10 decision.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

---

### Task 5 (roadmap 2.6): Finish the Alex sweep

**Files:**
- Modify: `lib/theme.ts:25`, `components/ConductorPanel.tsx:23`, `components/CommandPalette.tsx:48,51`, `components/Topbar.tsx:24`, `lib/brain-docs.ts:107`, `app/social/page.tsx:182`, `components/SocialStatStrip.tsx:214`
- Modify: comment-only hits in `lib/`, `app/`, `components/` (list produced in Step 2)
- Test: `tests/theme.test.ts`, new `tests/no-previous-owner.test.ts`

**Interfaces:**
- Consumes: `IDENTITY.firstName` from `lib/identity.ts`.
- Produces: `THEME_STORAGE_KEY = 'founder-os-theme'`; custom event name `'founder-os:palette'`; conductor width key `'founder-os-conductor-w'`.

- [ ] **Step 1: Branch**

```bash
git checkout -b chore/alex-sweep main
```

- [ ] **Step 2: Write the failing grep test**

Create `tests/no-previous-owner.test.ts`:

```ts
import { execFileSync } from 'node:child_process';
import { describe, expect, test } from 'vitest';

/**
 * Roadmap 2.6: the previous owner's name must not survive in live code.
 * lib/seed.ts is the demo fixture and is excluded; `-w` keeps
 * `totalExpenses` from matching.
 */
describe('previous owner sweep', () => {
  test('no whole-word Alex in lib, app or components outside the seed fixture', () => {
    let out = '';
    try {
      out = execFileSync('grep', ['-rniw', '--exclude=seed.ts', 'alex', 'lib', 'app', 'components'], { encoding: 'utf8' });
    } catch (err) {
      const e = err as { status?: number; stdout?: string };
      if (e.status !== 1) throw err; // 1 means no match
      out = e.stdout ?? '';
    }
    expect(out.trim(), out).toBe('');
  });
});
```

In `tests/theme.test.ts` change `expect(THEME_STORAGE_KEY).toBe('alex-theme');` to `expect(THEME_STORAGE_KEY).toBe('founder-os-theme');`.

- [ ] **Step 3: Run to see them fail**

Run: `npx vitest run tests/no-previous-owner.test.ts tests/theme.test.ts`
Expected: FAIL; the grep test prints every remaining hit (about 75 lines).

- [ ] **Step 4: Fix the behavioural strings**

- `lib/theme.ts:25`: `export const THEME_STORAGE_KEY = 'founder-os-theme';`
- `components/ConductorPanel.tsx:23`: `const WIDTH_KEY = 'founder-os-conductor-w';`
- `components/CommandPalette.tsx:48,51` and `components/Topbar.tsx:24`: `'alex:palette'` becomes `'founder-os:palette'` (three places).
- `lib/brain-docs.ts`: add `import { IDENTITY } from '@/lib/identity';` and change line 107 to `const escalateTo = t.assigneeKind === 'person' ? IDENTITY.firstName : lead ? \`${lead.name} (${link(lead.id)})\` : IDENTITY.firstName;`
- `app/social/page.tsx:182`: the label becomes `Beehiiv · newsletter`.
- `components/SocialStatStrip.tsx:214`: the string becomes `'email tracks the real Beehiiv subscriber count'`.

- [ ] **Step 5: Rewrite the comments**

For each file the grep test lists, edit the comment by hand: `Alex's` becomes `the operator's`, `Alex` becomes `the operator`, and a comment that only names Alex as the source of a design decision (`(Alex, 2026-07-12)`) becomes `(2026-07-12)`. Remove any em dash on a line you touch. Do not use a blind `sed` across `components/KnowledgeGraph.tsx`; it has 25 hits, several inside identifiers on lines 876 and 910 (`alexander`-style substrings are excluded by `-w`, but read each line).

Re-run: `grep -rniw --exclude=seed.ts alex lib app components` until it prints nothing.

- [ ] **Step 6: Gate**

Run: `npm test && npm run typecheck`
Expected: green.

- [ ] **Step 7: Tick 2.6, commit, PR, merge, reinstall**

Roadmap 2.6 "Done when" wording: change "returns only seed fixtures that 2.1 deletes" to "returns only lib/seed.ts, the demo fixture (guarded by tests/no-previous-owner.test.ts)".

```bash
git add -u lib app components tests docs/roadmap.md
git add tests/no-previous-owner.test.ts
git status --short
git commit -m "chore: finish the previous-owner sweep in live code

Theme and panel storage keys, the palette event, the SOP escalation
target and two newsletter labels no longer carry the previous owner's
name; comments are rewritten. A grep test keeps it that way, with
lib/seed.ts excluded as the demo fixture.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin chore/alex-sweep
gh pr create --base main --fill --body "Roadmap 2.6. Whole-word grep over lib, app, components returns nothing outside lib/seed.ts, enforced by a test.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

---

### Task 6 (roadmap 2.7): Brain page honesty

**Files:**
- Create: `lib/brain-layers.ts`
- Modify: `app/brain/page.tsx` (layers array, Stage 3 tiles, BrainCore props)
- Modify: `components/BrainViz.tsx` (props), `components/BrainCore.tsx` (forward the count)
- Modify: `lib/agents/real.ts:323`, `lib/seed.ts:919,922`
- Test: `tests/brain-layers.test.ts`, `tests/brain-viz-render.test.ts`

**Interfaces:**
- Consumes: `GBrainProvider.overview(): Promise<BrainOverview>` and `GBrainProvider.stats(): Promise<GBrainStats | null>` from `lib/connectors/gbrain.ts`.
- Produces:
  - `brainLayers(overview: BrainOverview, stats: GBrainStats | null, storeShort: string): BrainLayer[]` with `type BrainLayer = { name: string; sub: string; val: string; state: 'connected' | 'available' | 'error' }`.
  - `BrainViz` props become `{ clusters; health; remotePages: number | null; compact? }`; the `version` prop and both defaults are removed.
  - `BrainCore` gains `remotePages: number | null` and forwards it.

- [ ] **Step 1: Branch**

```bash
git checkout -b fix/brain-honesty main
```

- [ ] **Step 2: Write the failing layer test**

Create `tests/brain-layers.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { brainLayers } from '@/lib/brain-layers';
import type { BrainOverview, GBrainStats } from '@/lib/connectors/gbrain';

const overview = (checks: BrainOverview['doctor']['checks'], connected = true): BrainOverview => ({
  store: { path: '/tmp/store', totalFiles: 94, folders: [] },
  doctor: { connected, status: connected ? 'ok' : 'unreachable', healthScore: connected ? 95 : null, checks, detail: '' },
});
const stats: GBrainStats = { pages: 94, chunks: 183, embedded: 182, byType: [] };

describe('brainLayers', () => {
  test('embeddings are UNKNOWN, not LIVE, when doctor has no embedding check', () => {
    const layers = brainLayers(overview([]), stats, '~/store');
    const embed = layers.find((l) => l.name === 'ZeroEntropy')!;
    expect(embed.val).toBe('UNKNOWN');
    expect(embed.state).toBe('available');
  });

  test('embeddings follow the doctor check when present', () => {
    const ok = brainLayers(overview([{ name: 'embeddings', status: 'ok', message: '' }]), stats, '~/store');
    expect(ok.find((l) => l.name === 'ZeroEntropy')!.val).toBe('LIVE');
    const bad = brainLayers(overview([{ name: 'embeddings', status: 'warning', message: '' }]), stats, '~/store');
    expect(bad.find((l) => l.name === 'ZeroEntropy')!.val).toBe('WARNING');
  });

  test('the remote row shows gbrain stats counts and never a hardcoded number', () => {
    const withStats = brainLayers(overview([]), stats, '~/store').find((l) => l.name === 'Supabase Second Brain')!;
    expect(withStats.sub).toContain('94 pages');
    expect(withStats.sub).toContain('183 chunks');
    const noStats = brainLayers(overview([], false), null, '~/store').find((l) => l.name === 'Supabase Second Brain')!;
    expect(noStats.sub).toContain('counts unavailable');
    expect(noStats.val).toBe('UNREACHABLE');
    for (const l of brainLayers(overview([]), null, '~/store')) {
      expect(l.sub).not.toMatch(/918|11k|0\.41/);
    }
  });

  test('the CLI row carries no version claim', () => {
    const cli = brainLayers(overview([]), stats, '~/store').find((l) => l.name === 'gbrain CLI')!;
    expect(cli.sub).not.toMatch(/v\d/);
  });
});
```

- [ ] **Step 3: Run to see it fail**

Run: `npx vitest run tests/brain-layers.test.ts`
Expected: FAIL, cannot resolve `@/lib/brain-layers`.

- [ ] **Step 4: Create `lib/brain-layers.ts`**

```ts
import type { BrainOverview, GBrainStats } from '@/lib/connectors/gbrain';

export type BrainLayer = { name: string; sub: string; val: string; state: 'connected' | 'available' | 'error' };

/**
 * The storage-layer strip on /brain. Every value comes from `gbrain doctor`
 * (overview.doctor), the store walk (overview.store) or `gbrain stats`.
 * Unknown is rendered as unknown; nothing defaults to LIVE.
 */
export function brainLayers(overview: BrainOverview, stats: GBrainStats | null, storeShort: string): BrainLayer[] {
  const { store, doctor } = overview;
  const supabaseCheck = doctor.checks.find((c) => /supabase|database|postgres/i.test(c.name));
  const embedCheck = doctor.checks.find((c) => /zero|embed/i.test(c.name));
  const remoteDown = supabaseCheck ? supabaseCheck.status !== 'ok' : !doctor.connected;
  const counts = stats ? `${stats.pages} pages / ${stats.chunks} chunks · ${stats.embedded} embedded` : 'counts unavailable';
  return [
    {
      name: 'gbrain CLI',
      sub: '~/.bun/bin/gbrain · doctor --fast',
      val: doctor.connected ? 'LIVE' : 'UNREACHABLE',
      state: doctor.connected ? 'connected' : 'error',
    },
    {
      name: 'brain-store/',
      sub: `${storeShort} · markdown knowledge`,
      val: `${store.totalFiles} pages`,
      state: store.totalFiles > 0 ? 'connected' : 'available',
    },
    {
      name: 'ZeroEntropy',
      sub: 'hybrid-search embeddings · key in ~/.config/knowledge',
      val: embedCheck ? (embedCheck.status === 'ok' ? 'LIVE' : embedCheck.status.toUpperCase()) : 'UNKNOWN',
      state: embedCheck && embedCheck.status === 'ok' ? 'connected' : 'available',
    },
    {
      name: 'Supabase Second Brain',
      sub: `${counts} · free tier idle-pause`,
      val: !doctor.connected ? 'UNREACHABLE' : remoteDown ? 'PAUSED' : 'LIVE',
      state: !doctor.connected ? 'error' : remoteDown ? 'available' : 'connected',
    },
  ];
}
```

Run: `npx vitest run tests/brain-layers.test.ts` and expect PASS.

- [ ] **Step 5: Write the failing BrainViz render test**

Create `tests/brain-viz-render.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { BrainViz } from '@/components/BrainViz';

describe('BrainViz remote count', () => {
  test('prints the count it is given and a placeholder when unknown, never 918 or a version', () => {
    const given = renderToStaticMarkup(createElement(BrainViz, { clusters: [], health: 95, remotePages: 94 }));
    expect(given).toContain('SUPABASE · 94 PAGES');
    expect(given).not.toMatch(/918|V0\.41/);
    const unknown = renderToStaticMarkup(createElement(BrainViz, { clusters: [], health: null, remotePages: null }));
    expect(unknown).toContain('SUPABASE · ? PAGES');
  });
});
```

Run: `npx vitest run tests/brain-viz-render.test.ts` and expect FAIL (type error on `remotePages`, `918` in output).

- [ ] **Step 6: Change BrainViz, BrainCore, and the page**

`components/BrainViz.tsx`: props become

```tsx
export function BrainViz({
  clusters,
  health,
  remotePages,
  compact = false,
}: {
  clusters: BrainCluster[];
  health: number | null;
  /** Page count from `gbrain stats`; null when the CLI was unreachable. */
  remotePages: number | null;
  compact?: boolean;
}) {
```

Replace the `GBRAIN {version.toUpperCase()}` text with `GBRAIN` and the Supabase callout with `SUPABASE · {remotePages ?? '?'} PAGES`. Drop the `· PAUSED` suffix from that text (the layers strip carries the state). Search the file for any other use of `version` or `supabasePages` and remove it.

`components/BrainCore.tsx`: add `remotePages: number | null` to its props and pass `remotePages={remotePages}` to `<BrainViz>`. Find every `<BrainCore` call site (`grep -rn "<BrainCore" app components`) and pass the value; on `/brain` it is `stats?.pages ?? null`. If the Home mini card renders `BrainViz` directly with `compact`, pass `remotePages={null}` there unless it already fetches stats.

`app/brain/page.tsx`:
- `import { brainLayers } from '@/lib/brain-layers';`
- After `const overview = await createGBrainProvider().overview();` add `const stats = await createGBrainProvider().stats().catch(() => null);` (reuse one provider instance: `const provider = createGBrainProvider();`).
- Delete the inline `layers` array and the `supabaseCheck`, `zeroEntropyCheck`, `fallbackActive` lines that only fed it; keep `fallbackActive` if `BrainCore` still takes it, computing it as `layers.find((l) => l.name === 'Supabase Second Brain')?.state !== 'connected'`.
- `const layers = brainLayers(overview, stats, storeShort);`
- Stage 3 tiles: replace the two literals with `{stats ? stats.pages : 'n/a'}` and `{stats ? stats.chunks : 'n/a'}`, and the captions `pages · last known` / `chunks · last known` with `pages · gbrain stats` / `chunks · gbrain stats`.

`lib/agents/real.ts:323`: the message becomes `` `only ${store.totalFiles} pages on disk; run \`gbrain export\` to restore locally` `` (no remote number claimed).

`lib/seed.ts:919`: description `'brain-store markdown + Supabase + ZeroEntropy embeddings.'`; `lib/seed.ts:922`: `'Free tier pauses on idle; unpause from the dashboard when queries fail.'`.

- [ ] **Step 7: Gate and confirm no literal remains**

```bash
grep -rn "918\|11k\|0\.41" app components lib | grep -v node_modules
npm test && npm run typecheck
```

Expected: grep prints nothing; gate green. `tests/operating-metrics.test.ts` uses `918` as an arbitrary fixture value and is in `tests/`, so it is not matched.

- [ ] **Step 8: Tick 2.7, commit, PR, merge, reinstall**

```bash
git add lib/brain-layers.ts tests/brain-layers.test.ts tests/brain-viz-render.test.ts app/brain/page.tsx components/BrainViz.tsx components/BrainCore.tsx lib/agents/real.ts lib/seed.ts docs/roadmap.md
git add -u app components
git commit -m "fix: brain page reads its numbers from gbrain stats

The 918 pages, 11k chunks and v0.41 literals are gone. Page and chunk
counts come from gbrain stats (94 / 183 today), the embeddings row is
UNKNOWN when doctor has no check for it, and the remote row says
counts unavailable when the CLI is unreachable.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin fix/brain-honesty
gh pr create --base main --fill --body "Roadmap 2.7. Every number on /brain comes from gbrain doctor, gbrain stats or the store walk; guarded by tests/brain-layers.test.ts and tests/brain-viz-render.test.ts.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

Verify: `curl -s -b /tmp/fos.jar http://127.0.0.1:4100/brain | grep -o 'SUPABASE · [0-9?]* PAGES'` prints the live count (94 on 2026-09-11).

---

### Task 7 (roadmap 2.8): Real costs on chat

**Files:**
- Modify: `lib/agents/chat.ts`, `lib/agents/conductor.ts`
- Test: `tests/agent-chat.test.ts`, `tests/conductor.test.ts`

**Interfaces:**
- Consumes: `LlmChatResult.usage?: { inputTokens: number; outputTokens: number }` from `lib/connectors/llm.ts`; `runCostUsd(tokensIn, tokensOut, model)` from `lib/agent-costs.ts`; `db.agentRuns.insert(run: AgentRun)`.
- Produces: `ChatResult = { reply: string; messages: AgentMessage[]; run: AgentRun }`; every chat writes an `agent_runs` row with `id = chat-<uuid>`, `summary = 'chat: ' + first 120 chars of the user message`, `model = process.env.LLM_MODEL ?? 'anthropic/claude-sonnet-5'`, and token and cost fields set when `usage` is present, null otherwise. `routeConductorMessage` writes a `conductor` run for its routing call the same way.

- [ ] **Step 1: Branch**

```bash
git checkout -b feat/chat-costs main
```

- [ ] **Step 2: Write the failing tests**

Append to `tests/agent-chat.test.ts` a describe that mocks the LLM connector with usage. Because the file sets `LLM_PROVIDER=stub` in `beforeAll`, use `vi.doMock` plus `vi.resetModules()` inside the new describe so the mock does not leak:

```ts
describe('chatWithAgent records cost from gateway usage', () => {
  test('writes an agent_runs row with tokens and a non-null costUsd', async () => {
    vi.resetModules();
    vi.doMock('@/lib/connectors/llm', () => ({
      chat: async () => ({ text: 'priced reply', toolCalls: [], usage: { inputTokens: 1000, outputTokens: 500 } }),
    }));
    const { chatWithAgent: chatMocked } = await import('@/lib/agents/chat');
    const { realAgents: agents } = await import('@/lib/agents/real');
    const { openDb: open } = await import('@/lib/db');
    const db = open(':memory:');
    const res = await chatMocked(db, agents, 'data-agent', 'how many pages?');
    expect(res.run.agentId).toBe('data-agent');
    expect(res.run.tokensIn).toBe(1000);
    expect(res.run.tokensOut).toBe(500);
    expect(res.run.costUsd).toBeGreaterThan(0);
    expect(res.run.costUsd).toBeCloseTo(0.0105, 6); // 1000 in at $3/M + 500 out at $15/M on Sonnet
    const stored = db.agentRuns.byAgent('data-agent');
    expect(stored).toHaveLength(1);
    expect(stored[0].costUsd).toBe(res.run.costUsd);
    expect(stored[0].summary).toBe('chat: how many pages?');
    vi.doUnmock('@/lib/connectors/llm');
  });
});
```

Add `vi` to the vitest import. In the existing stub test add:

```ts
    const runs = db.agentRuns.byAgent('data-agent');
    expect(runs).toHaveLength(1);
    expect(runs[0].costUsd).toBeNull(); // the stub reports no usage; null, not 0
    expect(runs[0].ok).toBe(true);
```

In `tests/conductor.test.ts`, find the test that routes a plain message through the model (stub) and add an assertion that `db.agentRuns.byAgent('conductor')` has one row with `summary` starting `route:`. Read the file to reuse its `db` handle.

- [ ] **Step 3: Run to see them fail**

Run: `npx vitest run tests/agent-chat.test.ts tests/conductor.test.ts`
Expected: FAIL, `res.run` undefined and no runs stored.

- [ ] **Step 4: Implement in `lib/agents/chat.ts`**

Add imports:

```ts
import { runCostUsd } from '@/lib/agent-costs';
import type { AgentMessage, AgentRun } from '@/lib/schemas';
```

Change the type and add a helper below `SCREEN_CONTEXT_CAP`:

```ts
export type ChatResult = { reply: string; messages: AgentMessage[]; run: AgentRun };

const CHAT_MODEL = () => process.env.LLM_MODEL ?? 'anthropic/claude-sonnet-5';

/**
 * Persist one model call as an agent run so the cost panel sees real usage.
 * Tokens stay null when the provider reported none (the stub); a run with no
 * usage is not a free run, it is an unpriced one.
 */
export function recordModelRun(
  db: FounderDb,
  agentId: string,
  summary: string,
  startedAt: string,
  usage: { inputTokens: number; outputTokens: number } | undefined,
): AgentRun {
  const model = CHAT_MODEL();
  const run: AgentRun = {
    id: `chat-${randomUUID()}`,
    agentId,
    startedAt,
    finishedAt: new Date().toISOString(),
    ok: true,
    summary: summary.slice(0, 126),
    model,
    tokensIn: usage ? usage.inputTokens : null,
    tokensOut: usage ? usage.outputTokens : null,
    costUsd: usage ? runCostUsd(usage.inputTokens, usage.outputTokens, model) : null,
  };
  db.agentRuns.insert(run);
  return run;
}
```

In `chatWithAgent`, capture `const startedAt = now();` before the `llmChat` call, and after the assistant message insert:

```ts
  const run = recordModelRun(db, agentId, `chat: ${message}`, startedAt, result.usage);
  return { reply: result.text, messages: db.agentMessages.byAgent(agentId), run };
```

Check `AgentRunSchema` in `lib/schemas.ts:129-142` for the exact optional fields; if `summary` has a max length, respect it in the slice.

- [ ] **Step 5: Implement in `lib/agents/conductor.ts`**

`pickAgent` gains a `db` parameter and records its call:

```ts
async function pickAgent(db: FounderDb, routable: RuntimeAgent[], message: string): Promise<string> {
  const startedAt = new Date().toISOString();
  // ... unchanged system prompt and llmChat call ...
  recordModelRun(db, 'conductor', `route: ${message}`, startedAt, res.usage);
  // ... unchanged pick ...
}
```

Import `recordModelRun` from `@/lib/agents/chat` and update the call site in `routeConductorMessage` to `pickAgent(db, routable, delivered)`. If `ConductorResult` spreads the `ChatResult`, the `run` field flows through to the API response; that is fine.

- [ ] **Step 6: Gate**

Run: `npm test && npm run typecheck`
Expected: green. `tests/api.test.ts` chat expectations still hold (extra `run` key is additive).

- [ ] **Step 7: Verify on production with a real call**

After merge and reinstall:

```bash
curl -s -b /tmp/fos.jar -X POST http://127.0.0.1:4100/api/agents/data-agent/chat \
  -H 'content-type: application/json' -d '{"message":"one line: how many pages are in the brain store?"}' | jq '.run'
sqlite3 data/founder-os.db "select agent_id, model, tokens_in, tokens_out, cost_usd from agent_runs order by started_at desc limit 3"
```

Expected: `costUsd` is a positive number and the row is in the table. That is the roadmap's done criterion.

- [ ] **Step 8: Tick 2.8, commit, PR, merge, reinstall**

```bash
git add lib/agents/chat.ts lib/agents/conductor.ts tests/agent-chat.test.ts tests/conductor.test.ts docs/roadmap.md
git commit -m "feat: record gateway token usage and cost on every chat

Each chat turn and each conductor routing call writes an agent_runs row
with the model, tokens and an estimated cost from the gateway usage the
connector already returned. The cost panel now shows real spend.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin feat/chat-costs
gh pr create --base main --fill --body "Roadmap 2.8. A real chat produces a non-null costUsd row; the stub produces an unpriced row with null tokens.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

---

### Task 8 (roadmap 2.4): Rename the ventures to Node AI's lines of business

ASSUMPTION (see the decisions table): ids `agency`, `clientos`, `leadgenos`; labels `Agency`, `ClientOS`, `LeadGenOS`. If Cristoforo names them differently, change the three ids and labels in Steps 4 and 5 and the test fixtures; nothing else in the task depends on the words.

**Files:**
- Modify: `lib/schemas.ts:472`, `lib/funnel-live.ts:69-79`, `lib/ventures.ts`, `lib/graph-lens.ts`, `app/funnel/page.tsx:41-44`, `components/FunnelNodeCard.tsx:105`, `lib/seed.ts` (every `venture:` value), `lib/connectors/payments.ts`, `lib/finances.ts`, `app/finances/page.tsx`, `.env.example` (FanBasis lines)
- Test: `tests/funnel.test.ts`, `tests/funnel-live.test.ts`, `tests/funnel-radial.test.ts`, `tests/api.test.ts`, `tests/ventures.test.ts`, `tests/graph-lens.test.ts`, `tests/seed.test.ts`, `tests/screen-context.test.ts`, `tests/payments.test.ts`, `tests/finances.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `FunnelVentureSchema = z.enum(['agency', 'clientos', 'leadgenos'])`; `classifyVenture(dealName: string): FunnelVenture`; `VENTURES` ids `agency`, `clientos`, `leadgenos`; `VENTURE_TABS` derived from `VENTURES`; `configuredProcessors` returns `stripe`, `paypal`, `wise-1`, `wise-2`.

- [ ] **Step 1: Branch**

```bash
git checkout -b refactor/node-ai-ventures main
```

- [ ] **Step 2: Write the failing tests**

`tests/funnel-live.test.ts`, replace the `classifyVenture` describe:

```ts
describe('classifyVenture', () => {
  test('product names route to the product line', () => {
    expect(classifyVenture('Acme · ClientOS rollout')).toBe('clientos');
    expect(classifyVenture('LeadGenOS for AB6')).toBe('leadgenos');
    expect(classifyVenture('leadgen os pilot')).toBe('leadgenos');
  });

  test('everything else is agency work', () => {
    expect(classifyVenture('Harbor Dental')).toBe('agency');
    expect(classifyVenture('Reese Calder')).toBe('agency');
    expect(classifyVenture('Fields Roofing LLC')).toBe('agency');
  });

  test('mapAttioDeals stamps the classified venture on every journey', () => {
    const { journeys } = mapAttioDeals([
      rawDeal({ id: 'rec-p', name: 'Reese Calder', stage: 'Contacted' }),
      rawDeal({ id: 'rec-c', name: 'ClientOS for Orbit Labs', stage: 'Contacted' }),
    ], NOW);
    expect(journeys.find((j) => j.id === 'attio-rec-p')?.venture).toBe('agency');
    expect(journeys.find((j) => j.id === 'attio-rec-c')?.venture).toBe('clientos');
  });
});
```

`tests/ventures.test.ts`: the first test becomes

```ts
  test("Node AI's three lines of business, each with a distinct color and brain tag", () => {
    expect(VENTURES.map((v) => v.id)).toEqual(['agency', 'clientos', 'leadgenos']);
    expect(VENTURES.map((v) => v.label)).toEqual(['Agency', 'ClientOS', 'LeadGenOS']);
```

Delete the "venture colors match each real brand source" and "brand-deals is presented as Personal Brand" tests. Replace every `'vantage'` with `'agency'`, `'launchpad-cohort'` with `'clientos'` (or `'leadgenos'` where a third is needed), and the reverse-lookup expectation with `['agency', 'clientos', 'leadgenos']`. The `whatsapp-worker` test becomes `expect(venturesForAgent('whatsapp-worker').some((v) => v.id === 'agency')).toBe(true);`.

`tests/graph-lens.test.ts`: labels `'Agency team'` and `'ClientOS team'`; lens ids `fn-agency`, `fn-clientos`; the roster assertions keep the same agent ids (`emp:vantage-sales` etc. still exist until phase 3).

`tests/funnel.test.ts`: `'vantage'` becomes `'agency'`, `'launchpad-cohort'` becomes `'clientos'`, and the seed assertion `new Set(['agency', 'clientos'])` (or whatever set Step 5 gives the seed; keep both present).

`tests/funnel-radial.test.ts`, `tests/api.test.ts:180-184`, `tests/screen-context.test.ts:9`, `tests/seed.test.ts`: substitute the ids the same way; the seed test's agent ids (`vantage-sales` and friends) do not change.

`tests/payments.test.ts` and `tests/finances.test.ts`: the processor lists become `['stripe', 'paypal', 'wise-1', 'wise-2']` and the FanBasis env and expectations go; the finances test title becomes `'lists every processor Node AI runs (Stripe, PayPal, Wise x2)'`.

- [ ] **Step 3: Run to see them fail**

Run: `npx vitest run tests/funnel-live.test.ts tests/ventures.test.ts tests/graph-lens.test.ts tests/payments.test.ts tests/finances.test.ts`
Expected: FAIL across the board on the old ids.

- [ ] **Step 4: Schema and classifier**

`lib/schemas.ts:472`: `export const FunnelVentureSchema = z.enum(['agency', 'clientos', 'leadgenos']);`

`lib/funnel-live.ts`, replace the classifier block (lines 68 to 79):

```ts
/**
 * Venture for live deals (Attio deals carry no venture attribute yet): a
 * product name in the deal title routes to that product line; everything
 * else is agency work. Add a venture attribute in Attio for the exact split.
 */
export function classifyVenture(dealName: string): FunnelVenture {
  if (/client\s*os/i.test(dealName)) return 'clientos';
  if (/lead\s*gen\s*os/i.test(dealName)) return 'leadgenos';
  return 'agency';
}
```

Import `type FunnelVenture` from `@/lib/schemas` in that file. Delete `COMPANY_HINTS`.

- [ ] **Step 5: Registry, lenses, UI, seed**

`lib/ventures.ts`: rewrite the header comment (no previous-owner wording) and the three entries:

```ts
export const VENTURES: Venture[] = [
  {
    id: 'agency',
    label: 'Agency',
    kind: 'AI software agency',
    color: '#00ffaa',
    detail: 'Client builds and retainers, delivered by Node AI.',
    brainTag: 'agency',
    focus: ['Active client builds shipped on schedule', 'Pipeline: proposals out, deals advanced in Attio', 'Every handoff documented in the brain'],
    areaAgents: {
      marketing: ['social-agent', 'zernio-publisher', 'remotion-editor', 'higgsfield-creative'],
      sales: ['vantage-sales', 'vantage-fanbasis', 'sales-agent', 'sales-calls-data'],
      communication: ['comms-agent', 'gmail-worker', 'slack-worker', 'whatsapp-worker', 'crm-pulse'],
      finances: ['payments-pulse', 'stripe-sales', 'processor-confirmation'],
      knowledge: [...SHARED_KNOWLEDGE, 'notion-sync'],
      operations: SHARED_OPS,
    },
  },
  {
    id: 'clientos',
    label: 'ClientOS',
    kind: 'Product',
    color: '#d9263f',
    detail: 'The client portal: discovery, proposals, signing, onboarding.',
    brainTag: 'clientos',
    focus: ['Proposals signed through the portal', 'Onboarding completed without manual steps', 'Portal uptime and support response'],
    areaAgents: {
      marketing: ['social-agent', 'zernio-publisher', 'remotion-editor'],
      sales: ['launchpad-cohort-sales', 'sales-agent', 'sales-calls-data'],
      communication: ['gmail-worker', 'comms-agent', 'crm-pulse'],
      finances: ['payments-pulse', 'stripe-sales', 'processor-confirmation'],
      knowledge: SHARED_KNOWLEDGE,
      operations: SHARED_OPS,
    },
  },
  {
    id: 'leadgenos',
    label: 'LeadGenOS',
    kind: 'Product',
    color: '#a3e635',
    detail: 'Lead scraping, enrichment and outbound campaigns for clients.',
    brainTag: 'leadgenos',
    focus: ['Tenant campaigns sending on schedule', 'Enrichment cost per lead within budget', 'Replies routed to the client CRM'],
    areaAgents: {
      marketing: ['social-agent', 'zernio-publisher'],
      sales: ['sales-agent', 'crm-pulse'],
      communication: ['gmail-worker', 'crm-pulse', 'comms-agent'],
      finances: ['payments-pulse', 'stripe-sales'],
      knowledge: SHARED_KNOWLEDGE,
      operations: SHARED_OPS,
    },
  },
];
```

Every agent id above already exists in `lib/agents/real.ts` (the ventures test checks that). Keep the three colors so `tests/ventures.test.ts` "colors do not collide with life areas" still passes.

`lib/graph-lens.ts`: `fn-vantage` becomes `fn-agency` (label `Agency team`), `fn-launchpad-cohort` becomes `fn-clientos` (label `ClientOS team`); rename the keys in `VENTURE_TEAMS`, the `ent-teams` case, and the `case 'fn-vantage': case 'fn-launchpad-cohort':` switch arms. Rosters keep the same agent ids.

`app/funnel/page.tsx:41-44`: derive the tabs from the registry:

```ts
import { VENTURES, getVenture } from '@/lib/ventures';

const VENTURE_TABS: { id: FunnelVenture | 'all'; label: string }[] = [
  { id: 'all', label: 'All clients' },
  ...VENTURES.map((v) => ({ id: v.id as FunnelVenture, label: v.label })),
];
```

`components/FunnelNodeCard.tsx:105`: `{getVenture(node.venture)?.label ?? node.venture} · {stageLabel}` with `import { getVenture } from '@/lib/ventures';` (check it is a client component; `lib/ventures.ts` has no server-only imports, so the import is fine).

`lib/seed.ts`: every `venture: 'launchpad-cohort'` becomes `venture: 'clientos'` and every `venture: 'vantage'` becomes `venture: 'agency'` (the funnel contacts at lines 1185 to 1333). The seed still type-checks against the new enum.

`lib/connectors/payments.ts`: delete the two FanBasis rows. `lib/finances.ts`: delete the two `account('fanbasis-...')` lines, change the Stripe label to `'Stripe'`, and fix the doc comment ("two Wise slots"). `app/finances/page.tsx:60-67`: delete the FanBasis `Promise.all` and the two `liveIncomeUsd` assignments; if `fanbasisMonthToDateIncome` is then unused, delete it and its test. `.env.example`: delete the two FanBasis lines.

- [ ] **Step 6: Sweep the remaining words**

```bash
grep -rn "vantage\|launchpad-cohort\|Launchpad Cohort\|brand-deals\|Personal Brand\|fanbasis-vantage\|fanbasis-lc\|FANBASIS_VANTAGE\|FANBASIS_LC" lib app components tests --include='*.ts' --include='*.tsx' | grep -v "vantage-sales\|vantage-fanbasis\|launchpad-cohort-sales\|fanbasis-sales"
```

Expected: only comments and agent descriptions in `lib/agents/real.ts` and `lib/seed.ts` naming the old businesses inside agent copy; those agents are rewritten in phase 3. Anything else on the list (labels, urls in `app/layout.tsx:41-42`, `app/content/page.tsx:13-14,122`, `components/SparkIcon.tsx`) is a previous-owner asset: change `app/layout.tsx` keywords to `deals pipeline agency`, delete the Skool external link, and leave `SparkIcon` and `content/page.tsx` for the phase 3 design pass with a note in the roadmap's open questions.

- [ ] **Step 7: Gate**

Run: `npm test && npm run typecheck`
Expected: green.

- [ ] **Step 8: Tick 2.4, record the decision, commit, PR, merge, reinstall**

Add to the roadmap decisions table: `2026-09-11 | Venture ids are agency, clientos, leadgenos (task 2.4); confirmed or renamed by Cristoforo. FanBasis processor slots removed.`

```bash
git add -u lib app components tests .env.example docs/roadmap.md
git status --short
git commit -m "refactor: ventures are Node AI's lines of business

FunnelVentureSchema, the venture registry, the graph lenses, the funnel
tabs and the seed use agency, clientos and leadgenos. The classifier
routes product names to their product line and everything else to the
agency. The two FanBasis processor slots are gone.

Claude-Session: https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
git push -u origin refactor/node-ai-ventures
gh pr create --base main --fill --body "Roadmap 2.4. Venture rename under the stated assumption (agency, clientos, leadgenos); one enum, one registry, one classifier, so renaming again is cheap.

https://claude.ai/code/session_013KTG3L5B9ggrbbKG8RiZWe"
gh pr checks --watch && gh pr merge --merge --delete-branch --admin
git checkout main && git pull && ops/launchd/install.sh
```

Verify: `curl -s -b /tmp/fos.jar 'http://127.0.0.1:4100/funnel' | grep -o 'Agency\|ClientOS\|LeadGenOS' | sort -u` prints the three labels.

---

## Phase exit

After Task 8: tick the phase 2 exit line in `docs/roadmap.md` with the date, add `3.0 Supabase under the repo layer` as the first item of phase 3 (agreed in principle 2026-09-11, ahead of Railway), and open the phase 3 brainstorm in a fresh session.

## Self-review notes

- Spec coverage: 2.1 Task 1, 2.2 Task 3, 2.3 Task 4, 2.4 Task 8, 2.5 Task 2, 2.6 Task 5, 2.7 Task 6, 2.8 Task 7. Every roadmap "Verify" line has a matching step.
- Deviations from the roadmap text, each recorded in the decisions table: 2.1 keeps `lib/seed.ts`; 2.3 keeps the 44 tiles; 2.6 counts comments; 2.4 is an assumption.
- Type consistency: `brainLayers` in Task 6 Step 4 matches its test in Step 2; `recordModelRun` in Task 7 Step 4 matches the conductor call in Step 5; `classifyVenture` returns `FunnelVenture` in Task 8 Step 4 and the tests in Step 2 use only the three enum values.

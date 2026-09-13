# Helight Demo Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the frozen Alex board on branch `demo/helight` into Helight's operator OS: seven pillars, 75 agents, one DTC lane, every page seeded, served on port 4102.

**Architecture:** The roster (agents, SOP steps, run summaries) is defined once in `lib/roster/*.ts`, one file per pillar. `lib/seed.ts` derives agent rows, SOP tasks and run history from it; `lib/agents/real.ts` derives runtime entries from it and attaches the few real `run()` functions by id, everything else gets a deterministic seeded run. Hardcoded ids in the life map, knowledge graph, funnel schema and tests move to the new department and venture ids. The demo runs with `LLM_PROVIDER=stub` and `BRAIN_PROVIDER=stub`, no keys.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, better-sqlite3, Zod, Vitest. Node 24 via `/opt/homebrew/opt/node@24/bin/node`. npm only.

**Spec:** `docs/superpowers/specs/2026-09-13-helight-demo-design.md`

## Global Constraints

- Work only in the worktree `~/code/node-ai/founderos-helight` on branch `demo/helight`. Never touch `main`, tag `demo-alex`, port 4100 or port 4101.
- No em dashes anywhere. No emojis in code, commits or copy.
- Conventional commits, types limited to feat, fix, refactor, docs, test, chore. No Co-Authored-By. End every commit message with `Claude-Session: https://claude.ai/code/session_01HhzSuVBXnudKQH1Ys7tVR6`.
- Stage explicit paths. Never `git add -A` or `git add .`.
- The pre-commit scanner blocks any 8+ character value in a key-ish field, including inside test files. Never write a literal credential; test values get a `fake-` prefix.
- Every number, customer and run is invented. Nothing claims to be Helight's real data. Never invent employee names; heads of department are role only. The operator is Yannick Kiefer, no title.
- Names follow role plus object (Meta Ads Auditor, Ad Copywriter). The seven pillar names are exactly: Growth, Content, Retention, Store, Customer Care, Finance, Operations.
- Files 200 to 400 lines, 800 max. The old `lib/seed.ts` is 1,695 lines; it shrinks to an assembler.
- `npm test` and `npm run typecheck` green before every commit that touches code.
- Run tests with `npx vitest run <file>` for one file, `npm test` for the suite.

---

## File structure

| File | Responsibility |
|---|---|
| `lib/identity.ts` | Operator identity (modify) |
| `lib/roster/types.ts` | `RosterEntry` type and the `entry()` helper (create) |
| `lib/roster/growth.ts`, `content.ts`, `retention.ts`, `store.ts`, `care.ts`, `finance.ts`, `operations.ts` | One pillar's agents with SOP steps and run summaries (create) |
| `lib/roster/index.ts` | `ROSTER`, `DEPARTMENTS`, `PEOPLE`, lookups (create) |
| `lib/seed.ts` | Assembler: derives agents, SOPs, runs from the roster; imports the content files below (rewrite) |
| `lib/seed/tools.ts` | Connections board tiles (create) |
| `lib/seed/roadmap.ts` | Roadmap, phases, domains, metrics (create) |
| `lib/seed/social.ts` | Social accounts, follower series, DMs, posts, email list (create) |
| `lib/seed/funnel.ts` | Fourteen customer journeys (create) |
| `lib/seed/workflows.ts` | Workflows, skills, agent tasks (create) |
| `lib/agents/real.ts` | Runtime roster derived from `ROSTER` plus real runs (rewrite) |
| `lib/ventures.ts` | One venture, `helight` (rewrite) |
| `lib/schemas.ts` | Funnel venture and source enums (modify) |
| `lib/funnel.ts`, `lib/funnel-live.ts`, `lib/funnel-ghl.ts` | Stage labels, venture removal (modify) |
| `lib/life-map.ts`, `lib/knowledge-graph.ts`, `lib/graph-lens.ts`, `lib/brain-graph.ts`, `lib/content.ts`, `lib/finances.ts`, `lib/workflow-tool-brands.ts`, `lib/agent-wiki.ts`, `lib/brain-docs.ts` | Id maps and strings (modify) |
| `app/layout.tsx`, `app/unlock/page.tsx`, `app/funnel/page.tsx`, `app/social/page.tsx`, `app/analytics/page.tsx`, `app/content/page.tsx`, `components/FunnelNodeCard.tsx`, `components/SocialStatStrip.tsx`, `components/SparkIcon.tsx` | Visible strings (modify) |
| `tests/roster.test.ts` | New roster invariants (create) |
| `tests/seed.test.ts`, `tests/ventures.test.ts`, `tests/life-map.test.ts`, `tests/content.test.ts`, `tests/finances.test.ts`, `tests/conductor.test.ts`, `tests/graph-lens.test.ts`, `tests/funnel*.test.ts` | Updated for the new ids (modify) |

---

### Task 1: Identity, shell strings and departments

**Files:**
- Modify: `lib/identity.ts`
- Modify: `app/unlock/page.tsx:22`
- Modify: `app/layout.tsx:39-43` (external palette links)
- Create: `lib/roster/types.ts`
- Create: `lib/roster/index.ts` (departments and people only in this task; roster arrays arrive in Tasks 2 to 8)
- Modify: `lib/life-map.ts`, `lib/knowledge-graph.ts:19-26`, `lib/knowledge-graph.ts:53-60`
- Test: `tests/roster.test.ts`, `tests/life-map.test.ts:101-116`

**Interfaces:**
- Produces: `IDENTITY` with `workspace: 'HELIGHT OS'`; `DEPARTMENTS: Department[]` (seven, in order); `PEOPLE: Person[]`; `RosterEntry` type; `entry()` helper; `DEPT` id constants.

- [ ] **Step 1: Write the failing roster test**

```ts
// tests/roster.test.ts
import { describe, expect, test } from 'vitest';
import { DEPARTMENTS, PEOPLE, DEPT } from '@/lib/roster';

describe('departments', () => {
  test('seven pillars, in order, with the agreed names', () => {
    expect(DEPARTMENTS.map((d) => d.name)).toEqual([
      'Growth', 'Content', 'Retention', 'Store', 'Customer Care', 'Finance', 'Operations',
    ]);
    expect(DEPARTMENTS.map((d) => d.id)).toEqual([
      DEPT.growth, DEPT.content, DEPT.retention, DEPT.store, DEPT.care, DEPT.finance, DEPT.operations,
    ]);
    expect(DEPARTMENTS.map((d) => d.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('one role-only head per pillar plus the operator, no invented names', () => {
    const heads = PEOPLE.filter((p) => p.id !== 'person-yannick');
    expect(heads.length).toBe(7);
    expect(new Set(heads.map((p) => p.departmentId)).size).toBe(7);
    for (const p of heads) expect(p.name).toBe(p.role);
    expect(PEOPLE.find((p) => p.id === 'person-yannick')?.name).toBe('Yannick Kiefer');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/roster.test.ts`
Expected: FAIL, cannot resolve `@/lib/roster`.

- [ ] **Step 3: Create the roster types and the departments and people**

```ts
// lib/roster/types.ts
import type { Agent, AgentTier } from '@/lib/schemas';

export type RosterEntry = {
  id: string;
  departmentId: string;
  name: string;
  role: string;
  tier: AgentTier;
  parentId: string | null;
  description: string;
  model: string;
  tools: string[];
  /** SOP title, stated as work ("Audit the Meta account"). */
  sopTitle: string;
  sopSummary: string;
  /** Five to six checklist steps. */
  steps: string[];
  /** Heroes get 12 to 18 seeded runs and specific summaries; others 5 to 9. */
  hero: boolean;
  /** Seeded run summaries, cycled through; at least one. */
  runSummaries: string[];
};

export function toAgent(e: RosterEntry): Agent {
  return {
    id: e.id,
    departmentId: e.departmentId,
    name: e.name,
    role: e.role,
    status: 'active',
    tier: e.tier,
    description: e.description,
    model: e.model,
    tools: e.tools,
    parentId: e.parentId,
    instance: 'builtin',
  };
}
```

Check `AgentTier` is exported from `lib/schemas.ts`; if only `AgentTierSchema` exists, add `export type AgentTier = z.infer<typeof AgentTierSchema>;` next to it.

```ts
// lib/roster/index.ts
import type { Department, Person } from '@/lib/schemas';
import type { RosterEntry } from './types';

export const DEPT = {
  growth: 'dept-marketing-growth',
  content: 'dept-content',
  retention: 'dept-clients',
  store: 'dept-sales',
  care: 'dept-comms',
  finance: 'dept-finance',
  operations: 'dept-tech',
} as const;

const GRAY = { white: '#fafafa', light: '#d4d4d4', mid: '#a3a3a3', dim: '#737373', dark: '#525252' };

export const DEPARTMENTS: Department[] = [
  { id: DEPT.growth, name: 'Growth', slug: 'growth', tagline: 'Paid: Meta, TikTok, Google.', color: GRAY.white, order: 1 },
  { id: DEPT.content, name: 'Content', slug: 'content', tagline: 'Organic and creators. Finds the winners.', color: GRAY.light, order: 2 },
  { id: DEPT.retention, name: 'Retention', slug: 'retention', tagline: 'Klaviyo and everything after the first order.', color: GRAY.light, order: 3 },
  { id: DEPT.store, name: 'Store', slug: 'store', tagline: 'The Shopify storefront and its proof.', color: GRAY.mid, order: 4 },
  { id: DEPT.care, name: 'Customer Care', slug: 'customer-care', tagline: 'Every inbound customer voice.', color: GRAY.mid, order: 5 },
  { id: DEPT.finance, name: 'Finance', slug: 'finance', tagline: 'Money in, ad money out, margin per SKU.', color: GRAY.dim, order: 6 },
  { id: DEPT.operations, name: 'Operations', slug: 'operations', tagline: 'The OS itself: memory, conduct, schedule.', color: GRAY.dark, order: 7 },
];

export const PEOPLE: Person[] = [
  { id: 'person-yannick', departmentId: DEPT.growth, name: 'Yannick Kiefer', role: 'Operator', tools: ['shopify', 'meta-ads'] },
  { id: 'person-head-growth', departmentId: DEPT.growth, name: 'Head of Growth', role: 'Head of Growth', tools: ['meta-ads', 'tiktok-ads'] },
  { id: 'person-content-lead', departmentId: DEPT.content, name: 'Content Lead', role: 'Content Lead', tools: ['zernio', 'apify'] },
  { id: 'person-retention-lead', departmentId: DEPT.retention, name: 'Retention Lead', role: 'Retention Lead', tools: ['klaviyo', 'shopify'] },
  { id: 'person-store-manager', departmentId: DEPT.store, name: 'Store Manager', role: 'Store Manager', tools: ['shopify', 'amazon'] },
  { id: 'person-care-lead', departmentId: DEPT.care, name: 'Customer Care Lead', role: 'Customer Care Lead', tools: ['support-inbox', 'gmail'] },
  { id: 'person-bookkeeper', departmentId: DEPT.finance, name: 'Bookkeeper', role: 'Bookkeeper', tools: ['shopify', 'amazon'] },
  { id: 'person-ops-assistant', departmentId: DEPT.operations, name: 'Operations Assistant', role: 'Operations Assistant', tools: ['gbrain', 'slack'] },
];

// Filled by Tasks 2 to 8: one import per pillar, concatenated in pillar order.
export const ROSTER: RosterEntry[] = [];

export function rosterById(id: string): RosterEntry | undefined {
  return ROSTER.find((e) => e.id === id);
}
```

- [ ] **Step 4: Identity and shell strings**

`lib/identity.ts`:

```ts
export const IDENTITY = {
  firstName: 'Yannick',
  fullName: 'Yannick Kiefer',
  initials: 'YK',
  workspace: 'HELIGHT OS',
} as const;
```

`app/unlock/page.tsx` line 22: replace `NODE AI OS` with `HELIGHT OS`.

`app/layout.tsx` lines 39 to 43: replace the five `ext-*` entries with:

```ts
  { id: 'ext-shopify', label: 'Shopify admin', keywords: 'store orders products shopify', href: 'https://admin.shopify.com', hint: 'web' },
  { id: 'ext-klaviyo', label: 'Klaviyo', keywords: 'email sms flows campaigns list', href: 'https://www.klaviyo.com/login', hint: 'web' },
  { id: 'ext-meta-ads', label: 'Meta Ads Manager', keywords: 'facebook instagram ads campaigns', href: 'https://adsmanager.facebook.com', hint: 'web' },
  { id: 'ext-tiktok-ads', label: 'TikTok Ads Manager', keywords: 'tiktok ads campaigns shop', href: 'https://ads.tiktok.com', hint: 'web' },
  { id: 'ext-google-ads', label: 'Google Ads', keywords: 'search shopping pmax', href: 'https://ads.google.com', hint: 'web' },
  { id: 'ext-amazon', label: 'Amazon Seller Central', keywords: 'amazon listing reviews payouts', href: 'https://sellercentral.amazon.com', hint: 'web' },
```

Keep `ext-remotion`. Remove `ext-command-center`, `ext-skool`, `ext-attio`, `ext-fathom`.

- [ ] **Step 5: Life map and knowledge graph id maps**

`lib/life-map.ts`: change labels and `departmentIds`:

| area id | label | departmentIds |
|---|---|---|
| marketing | Marketing | `['dept-marketing-growth', 'dept-content']` |
| sales | Store | `['dept-sales']` |
| finances | Finances | `['dept-finance']` |
| communication | Customer Care | `['dept-comms']` |
| clients | Retention | `['dept-clients']` |
| knowledge | Knowledge | `['dept-tech']` |
| operations | Operations | `['dept-tech']` |

Replace every `agents:` array in `LIFE_AREAS` with the new ids (they exist after Tasks 2 to 8; the test in Task 9 checks them):

```ts
marketing:     ['growth-planner', 'ad-copywriter', 'meta-ads-auditor', 'budget-auditor', 'content-planner', 'publisher', 'hook-miner', 'performance-reader']
sales:         ['store-auditor', 'product-page-optimizer', 'ai-answer-optimizer', 'evidence-curator', 'catalog-keeper']
finances:      ['payments-pulse', 'ad-spend-ledger', 'contribution-margin', 'month-close']
communication: ['support-triage', 'reply-drafter', 'dm-responder', 'refund-handler', 'voice-of-customer']
clients:       ['lifecycle-planner', 'twenty-one-nights-coach', 'offer-designer', 'win-back-writer']
knowledge:     ['knowledge-agent', 'brand-pack-keeper', 'brain-auditor', 'data-agent']
operations:    ['conductor', 'connector-monitor', 'scheduler']
```

Rewrite the module lists to match: marketing modules `content`, `paid`, `email`, `sms`, `creators`; sales modules `storefront`, `catalog`, `proof`, `amazon`; clients modules `flows`, `segments`, `offers`, `win-back`; communication modules `support`, `dms`, `reviews`, `escalations`; finances modules `payouts`, `ad-spend`, `margin`, `close`; knowledge and operations unchanged. Each module keeps the `{ id, label, detail }` shape with a one-line detail.

`lib/knowledge-graph.ts`:

```ts
export const DEPT_EXEC_TITLES: Record<string, string> = {
  'dept-marketing-growth': 'CMO',
  'dept-content': 'CCO',
  'dept-clients': 'CRO',
  'dept-sales': 'CPO',
  'dept-comms': 'CXO',
  'dept-finance': 'CFO',
  'dept-tech': 'COO',
};

export const GRAPH_DEPT_ORDER = [
  'dept-marketing-growth',
  'dept-content',
  'dept-clients',
  'dept-sales',
  'dept-comms',
  'dept-finance',
  'dept-tech',
] as const;
```

`tests/life-map.test.ts` lines 101 to 116: the department list becomes all seven ids; the mapping test expects `dept-sales` to `sales`, `dept-marketing-growth` and `dept-content` to `marketing`, `dept-comms` to `communication`, `dept-clients` to `clients`, `dept-finance` to `finances`, `dept-tech` to `knowledge`.

- [ ] **Step 6: Run the two tests**

Run: `npx vitest run tests/roster.test.ts tests/life-map.test.ts`
Expected: PASS. (The life-map agents test may reference ids that do not exist yet; if a test asserts every area agent is a real runtime agent, skip it with `test.todo` and restore it in Task 9.)

- [ ] **Step 7: Commit**

```bash
git add lib/identity.ts app/unlock/page.tsx app/layout.tsx lib/roster/types.ts lib/roster/index.ts lib/life-map.ts lib/knowledge-graph.ts tests/roster.test.ts tests/life-map.test.ts
git commit -m "feat: Helight identity and the seven pillars"
```

---

### Task 2: Growth roster

**Files:**
- Create: `lib/roster/growth.ts`
- Modify: `lib/roster/index.ts` (import and concatenate)
- Test: `tests/roster.test.ts`

**Interfaces:**
- Consumes: `RosterEntry` from Task 1.
- Produces: `GROWTH: RosterEntry[]` with 17 entries, lead `growth-planner`.

- [ ] **Step 1: Add the roster invariant tests**

Append to `tests/roster.test.ts`:

```ts
import { ROSTER } from '@/lib/roster';

describe('roster', () => {
  test('ids are unique and every entry has a department', () => {
    const ids = ROSTER.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const deptIds = new Set(DEPARTMENTS.map((d) => d.id));
    for (const e of ROSTER) expect(deptIds.has(e.departmentId), e.id).toBe(true);
  });

  test('exactly one lead per pillar; every non-lead reports to its pillar lead', () => {
    for (const d of DEPARTMENTS) {
      const members = ROSTER.filter((e) => e.departmentId === d.id);
      const leads = members.filter((e) => e.tier === 'lead');
      expect(leads.length, d.name).toBe(1);
      for (const m of members) {
        if (m.tier === 'lead') expect(m.parentId).toBeNull();
        else expect(m.parentId).toBe(leads[0].id);
      }
    }
  });

  test('every entry carries five or six SOP steps and at least one run summary', () => {
    for (const e of ROSTER) {
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(5);
      expect(e.steps.length, e.id).toBeLessThanOrEqual(6);
      expect(e.runSummaries.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.sopTitle.length).toBeGreaterThan(0);
    }
  });

  test('pillar sizes match the spec', () => {
    const count = (id: string) => ROSTER.filter((e) => e.departmentId === id).length;
    expect(count(DEPT.growth)).toBe(17);
    expect(count(DEPT.content)).toBe(13);
    expect(count(DEPT.retention)).toBe(11);
    expect(count(DEPT.store)).toBe(12);
    expect(count(DEPT.care)).toBe(11);
    expect(count(DEPT.finance)).toBe(4);
    expect(count(DEPT.operations)).toBe(7);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/roster.test.ts`
Expected: FAIL on pillar sizes (ROSTER is empty).

- [ ] **Step 3: Write the Growth roster**

```ts
// lib/roster/growth.ts
import { DEPT } from './index';
import type { RosterEntry } from './types';

const LEAD = 'growth-planner';
const g = (
  id: string, name: string, role: string, tier: RosterEntry['tier'], tools: string[],
  description: string, sopTitle: string, sopSummary: string, steps: string[],
  hero = false, runSummaries: string[] = [`${name} completed a run.`],
): RosterEntry => ({
  id, departmentId: DEPT.growth, name, role, tier, parentId: tier === 'lead' ? null : LEAD,
  description, model: 'claude-sonnet-5 via Claude Code skills', tools, sopTitle, sopSummary, steps, hero, runSummaries,
});

export const GROWTH: RosterEntry[] = [
  g('growth-planner', 'Growth Planner', 'Paid media plan and approvals', 'lead', ['claude-code', 'meta-ads', 'tiktok-ads', 'google-ads'],
    'Sets the week: audience lanes, angles, budget per platform. Holds the two approvals Yannick gives: the week, and spend on winners.',
    'Plan the week of paid media', 'Lanes, angles, budget, two approvals.',
    ['Read last week from Ads Reporter: spend, MER, CPA, winners, kills',
     'Pick this week\'s lanes (parents, shift workers, wearable optimisers, travellers) and angles (28-minute sunset, no app, patent, guarantee)',
     'Set budget per platform against the contribution margin floor from Finance',
     'Brief Creative Strategist with one hypothesis per asset slot',
     'Send the week to Yannick for approval; nothing launches before the yes',
     'Queue winner amplification requests for the second approval, spend only'],
    true, ['Week 37 planned: 4 lanes, 6 angles, 22 asset slots, budget split Meta 55 / TikTok 35 / Google 10', 'Approval request sent to Yannick: week plan plus 2 winner amplifications', 'Budget floor from Contribution Margin honoured: CPA ceiling $46 on Sleep', 'Reallocated 12% from Google Shopping to TikTok after Budget Auditor flagged marginal return']),
  g('competitor-researcher', 'Competitor Researcher', 'Category and rival ads watch', 'worker', ['claude-code', 'meta-ads', 'apify'],
    'Watches rival ads in the Meta ads library, rising TikTok formats, and objections in comments and reviews.',
    'Scan the category weekly', 'Rival ads, rising formats, objections.',
    ['Pull active ads for Hatch, Loftie, Therabody and Somnee from the Meta ads library',
     'List new hooks, offers and formats seen this week',
     'Read comments and reviews for repeated objections (price, does it work, safe for kids)',
     'Write the signal note: three things to copy, three to avoid',
     'Hand the note to Creative Strategist and Hook Miner']),
  g('creative-strategist', 'Creative Strategist', 'Briefs with a hypothesis', 'worker', ['claude-code'],
    'Turns lanes and angles into briefs, one hypothesis per asset.',
    'Write the asset briefs', 'Lane times angle times format, one hypothesis each.',
    ['Take the week\'s lanes and angles from Growth Planner',
     'Pair each with a format that fits (wearable before and after, parent POV, physician explainer, debunk, unboxing)',
     'Write the hypothesis each asset tests, one line',
     'Attach the claims each brief may use from the allowlist',
     'Send briefs to Ad Copywriter and Visual Designer']),
  g('ad-copywriter', 'Ad Copywriter', 'Hooks and scripts at volume', 'specialist', ['claude-code'],
    'Writes hooks and scripts at volume against structures already proven in the category.',
    'Write hooks and scripts', 'Volume against proven structures.',
    ['Take the briefs and the hook templates from Hook Miner',
     'Write eight hooks per brief, each on a different structure',
     'Write the primary text and the script per format',
     'Mark every claim with its allowlist id so Compliance Auditor can check it',
     'Deliver the batch as a variant sheet named by lane and angle',
     'Log which structures shipped so next week starts from what worked'],
    true, ['Wrote 48 hooks for 6 briefs; 11 flagged to Compliance Auditor, 3 rewritten', 'Sunset-mimic angle: 8 hooks, 2 promoted by Performance Reader', 'Parent lane scripts delivered, 4 formats, French variants requested', 'Rewrote 3 hooks that leaned on "cures insomnia"; replaced with sleep onset language from the allowlist']),
  g('visual-designer', 'Visual Designer', 'Stills, product shots, UGC variants', 'worker', ['claude-code', 'arcads', 'higgsfield'],
    'Produces stills, product shots and UGC variants from the briefs, using the approved product photography in the brand pack.',
    'Produce the visual assets', 'Stills, product shots, UGC from the briefs.',
    ['Read the brief and pull the approved product photography from Brand Pack Keeper',
     'Generate stills and product-in-bedroom scenes to the brief',
     'Generate UGC variants through Arcads for the volume slots',
     'Cull to the strongest takes before any upscale spend',
     'Hand finals to Format Checker with the brief attached']),
  g('format-checker', 'Format Checker', 'Platform spec verification', 'worker', ['claude-code'],
    'Verifies every asset against current Meta, TikTok and Google specs, including the AI-generated content disclosure.',
    'Check formats before launch', 'Specs, crops, disclosure.',
    ['Take each final from Visual Designer',
     'Check dimensions, duration, safe zones and text density per platform',
     'Confirm the AI-generated content disclosure is set where the asset is synthetic',
     'Reject with a one-line reason so the fix is fast',
     'Pass approved assets to Compliance Auditor']),
  g('compliance-auditor', 'Compliance Auditor', 'Claims gate', 'specialist', ['claude-code', 'gbrain'],
    'Blocks any asset with a claim outside the substantiated allowlist. Sleep and health claims never ship unchecked. Shared with Content.',
    'Gate every claim', 'Allowlist in, nothing else out.',
    ['Load the claims allowlist from the brain (patent, 630 nm, 28-minute cycle, survey figures with method note, guarantee terms)',
     'Read every hook, script and caption in the batch',
     'Block anything that promises a medical outcome, names a condition, or cites an unsourced figure',
     'Return each block with the allowlist line that could replace it',
     'Log the block rate per writer so the pattern is visible',
     'Release the batch to Campaign Launcher or Publisher only when zero blocks remain'],
    true, ['Batch 37-B: 62 assets checked, 7 blocked, 7 rewritten, 0 shipped with open blocks', 'Blocked "clinically proven to cure insomnia"; replaced with "backed by the 2018 sleep onset study"', 'Allowlist refreshed from Evidence Curator: Strasbourg 2024 added', 'TikTok health policy check passed on 14 creator videos']),
  g('translator', 'Translator', 'Winners only into French and German', 'worker', ['claude-code'],
    'Turns winners only into French and German, matching the store\'s locales. Shared with Content.',
    'Localise the winners', 'French and German, winners only.',
    ['Take only assets flagged winner by Performance Reader or Budget Auditor',
     'Translate hooks and scripts into French and German with the brand glossary',
     'Keep every claim on the allowlist wording in each language',
     'Send back through Compliance Auditor',
     'Deliver to Campaign Launcher with locale tags']),
  g('campaign-launcher', 'Campaign Launcher', 'Structured launch per platform', 'worker', ['meta-ads', 'tiktok-ads', 'google-ads'],
    'Pushes approved assets into Meta, TikTok and Google, structured per platform.',
    'Launch approved campaigns', 'Approved assets in, structured campaigns out.',
    ['Take the approved batch and the budget from Growth Planner',
     'Build the campaign structure per platform: one campaign per lane, one ad set per angle',
     'Upload assets with naming that Tracking Auditor can read back',
     'Set the conversion event and attribution window agreed with Tracking Auditor',
     'Launch and confirm delivery within the hour']),
  g('meta-ads-auditor', 'Meta Ads Auditor', 'Meta account health', 'specialist', ['meta-ads'],
    'Audits the Meta account: Pixel and Conversions API, audiences, placements, creative fatigue, account structure.',
    'Audit the Meta account', 'Pixel, CAPI, audiences, fatigue.',
    ['Check Pixel and Conversions API events match: purchase, add to cart, view content',
     'Review audience overlap and exclusions across ad sets',
     'Flag creatives past the fatigue threshold (frequency and falling CTR)',
     'Check placements and Advantage+ settings against the plan',
     'Write findings with evidence and hand fixes to Campaign Launcher',
     'Report account health score to Ads Reporter'],
    true, ['Account health 82/100: CAPI dedup fixed, 3 fatigued creatives paused', 'Purchase event mismatch found between Pixel and CAPI; dedup key set', 'Audience overlap 34% between parents and travellers ad sets; exclusions added', 'Advantage+ shopping campaign structure verified against the plan']),
  g('tiktok-ads-auditor', 'TikTok Ads Auditor', 'TikTok account health', 'worker', ['tiktok-ads'],
    'Audits TikTok Ads: Events API, Smart+, Shop campaigns, creative-native fit.',
    'Audit the TikTok account', 'Events API, Smart+, Shop.',
    ['Check Events API coverage for the purchase and add to cart events',
     'Review Smart+ campaign settings and the Shop campaign link',
     'Flag creatives that read as ads rather than native posts',
     'Check pacing against the plan',
     'Write findings and hand fixes to Campaign Launcher']),
  g('google-ads-auditor', 'Google Ads Auditor', 'Google account health', 'worker', ['google-ads'],
    'Audits Google Ads: brand search, Shopping, Performance Max, negatives.',
    'Audit the Google account', 'Brand search, Shopping, PMax.',
    ['Check conversion tracking and the Shopping feed status',
     'Review brand search terms and add negatives for competitor and irrelevant queries',
     'Check Performance Max asset groups against the brand pack',
     'Check pacing against the plan',
     'Write findings and hand fixes to Campaign Launcher']),
  g('budget-auditor', 'Budget Auditor', 'Pacing and marginal return', 'specialist', ['meta-ads', 'tiktok-ads', 'google-ads'],
    'Daily pacing, marginal return per platform, when to scale or cut.',
    'Audit pacing daily', 'Pacing, marginal return, scale or cut.',
    ['Read yesterday\'s spend and results per platform',
     'Compare pacing to the week\'s budget',
     'Compute marginal return per platform against the CPA ceiling from Contribution Margin',
     'Recommend scale, hold or cut per campaign with the number that decided it',
     'Send scale recommendations to Growth Planner for the spend approval',
     'Log the decision so Ads Reporter can show it Monday'],
    true, ['Day 4 pacing 98%; TikTok marginal CPA $38 under the $46 ceiling, scale recommended', 'Cut Google Shopping by 20%: marginal CPA $71', 'Meta parents lane: scale 25% approved by Yannick', 'Held all budgets: Friday spend spike without matching purchases, tracking check requested']),
  g('experiment-designer', 'Experiment Designer', 'Kill and promote rules', 'worker', ['claude-code'],
    'Designs the tests: kill and promote rules, sample sizes, what each test decides.',
    'Design the experiments', 'Rules, sample sizes, decisions.',
    ['Take the hypotheses from Creative Strategist',
     'Set the metric, the sample size and the duration each needs',
     'Write the kill rule and the promote rule before launch',
     'Check the test does not overlap another on the same audience',
     'Read results with Performance Reader and record the decision']),
  g('tracking-auditor', 'Tracking Auditor', 'Events and attribution', 'worker', ['meta-ads', 'tiktok-ads', 'google-ads', 'shopify'],
    'Audits conversion events, deduplication, and attribution windows across platforms.',
    'Audit tracking weekly', 'Events, dedup, windows.',
    ['Compare Shopify orders to platform-reported purchases for the week',
     'Check event deduplication between browser and server',
     'Check attribution windows match across Meta, TikTok and Google',
     'Flag any gap above ten percent with the likely cause',
     'Hand fixes to the platform auditors and note the gap for Ads Reporter']),
  g('landing-page-auditor', 'Landing Page Auditor', 'Message match and friction', 'worker', ['claude-code', 'shopify'],
    'Checks message match from ad to product page and mobile friction after the click.',
    'Audit the landing pages', 'Message match, mobile, friction.',
    ['Open the product page each live campaign lands on, on mobile',
     'Check the hook\'s promise appears above the fold',
     'Check proof blocks, guarantee and price are visible without scrolling far',
     'Time the page and flag anything over three seconds',
     'Send findings to Product Page Optimizer in Store']),
  g('ads-reporter', 'Ads Reporter', 'The Monday brief', 'specialist', ['claude-code', 'meta-ads', 'tiktok-ads', 'google-ads', 'shopify'],
    'Writes the Monday brief: spend, MER, CPA, contribution margin, winners and kills.',
    'Write the Monday brief', 'Spend, MER, CPA, margin, winners, kills.',
    ['Pull spend and results per platform for the week',
     'Compute blended MER and CPA per SKU',
     'Take contribution margin per SKU from Finance',
     'List winners promoted and losers killed, with the number behind each',
     'Write the brief in five lines for Yannick and file the full table',
     'Send the brief Monday 08:00 Hong Kong time'],
    true, ['Week 36 brief: spend $18.4k, MER 3.1, CPA $44 Sleep / $52 Kidzzz, 3 winners, 9 kills', 'Week 35 brief: spend $16.9k, MER 2.8, first French variants live', 'Brief sent Monday 08:00 HKT; Yannick approved 2 amplifications by 09:10', 'Week 34 brief: TikTok overtook Meta on marginal return for the first time']),
];
```

- [ ] **Step 4: Wire it into the index**

In `lib/roster/index.ts`, `ROSTER` becomes a concatenation. To avoid a circular import (`growth.ts` imports `DEPT` from `index.ts`), move `DEPT` into `lib/roster/types.ts` and re-export it from `index.ts`:

```ts
// lib/roster/types.ts (add)
export const DEPT = { growth: 'dept-marketing-growth', content: 'dept-content', retention: 'dept-clients', store: 'dept-sales', care: 'dept-comms', finance: 'dept-finance', operations: 'dept-tech' } as const;
```

```ts
// lib/roster/index.ts
import { GROWTH } from './growth';
export { DEPT } from './types';
export const ROSTER: RosterEntry[] = [...GROWTH];
```

Each following task appends its pillar in order: `[...GROWTH, ...CONTENT, ...RETENTION, ...STORE, ...CARE, ...FINANCE, ...OPERATIONS]`. Pillar files import `DEPT` from `./types`.

- [ ] **Step 5: Run the roster test**

Run: `npx vitest run tests/roster.test.ts`
Expected: the Growth count passes; other pillar counts still fail. Temporarily assert only Growth, or accept the red until Task 8. Prefer: keep the full assertion and commit with the test red only for pillars not yet written, noting it in the commit body. The suite must be green by Task 8.

- [ ] **Step 6: Commit**

```bash
git add lib/roster/growth.ts lib/roster/index.ts lib/roster/types.ts tests/roster.test.ts
git commit -m "feat: Growth roster, seventeen paid-media agents"
```

---

### Task 3: Content roster

**Files:**
- Create: `lib/roster/content.ts`
- Modify: `lib/roster/index.ts`

**Interfaces:**
- Produces: `CONTENT: RosterEntry[]`, 13 entries, lead `content-planner`. Ids: `content-planner`, `creator-watcher`, `video-analyst`, `comment-reader`, `hook-miner`, `script-writer`, `video-producer`, `edit-assistant`, `publisher`, `creator-recruiter`, `creator-briefer`, `twenty-one-nights-producer`, `performance-reader`.

- [ ] **Step 1: Write the Content roster**

Same helper shape as Growth (`c()` with `DEPT.content`, `LEAD = 'content-planner'`). Entries:

```ts
export const CONTENT: RosterEntry[] = [
  c('content-planner', 'Content Planner', 'Weekly calendar with hypotheses', 'lead', ['claude-code', 'zernio'],
    'Plans the weekly calendar: 60 to 90 slots a month, one hypothesis per slot.',
    'Plan the content week', '60 to 90 slots a month, one hypothesis each.',
    ['Read last week\'s kills and winners from Performance Reader',
     'Fill the week: 15 to 22 brand slots across TikTok, Instagram and YouTube Shorts',
     'Assign each slot a lane, an angle and a format, and write its hypothesis',
     'Reserve slots for the 21 Nights series and creator drops',
     'Send the week to Yannick for approval with the previous week\'s numbers on top',
     'Brief Hook Miner and Script Writer once approved'],
    true, ['Week 37: 19 brand slots, 6 creator drops, 21 Nights day-7 episode', 'Calendar approved by Yannick with one swap: debunk format moved to Thursday', 'Week 36: 21 slots posted, 2 winners, feed never dark']),
  c('creator-watcher', 'Creator Watcher', 'Watchlist and outlier scoring', 'specialist', ['apify', 'claude-code'],
    'Keeps a watchlist of 20 to 50 sleep and wellness creators, pulls new posts, scores outliers against each creator\'s baseline.',
    'Watch the creators', 'Watchlist, new posts, outliers.',
    ['Pull new posts from the 40-creator watchlist for the last 30 days',
     'Filter to engagement rate above 0.5 percent to strip brand deals',
     'Score each post against the creator\'s own baseline and rank outliers',
     'Send the top 25 to Video Analyst',
     'Add or drop creators so the list stays at 40',
     'Log the cost of the pull so Finance sees the scraping bill'],
    true, ['Pulled 1,812 posts from 40 creators; 27 outliers above 3x baseline', 'Added 4 creators in the shift-worker lane, dropped 3 dormant', 'Top outlier this week: wearable before-and-after format, 11x baseline', 'Monthly scrape cost $9.06, inside the $15 budget']),
  c('video-analyst', 'Video Analyst', 'Seven-attribute teardown', 'worker', ['claude-code'],
    'Tears down each winning video into topic, angle, hook format, story style, visual format, visuals and audio.',
    'Tear down the winners', 'Seven attributes per video.',
    ['Take the top 25 outliers from Creator Watcher',
     'Record the seven attributes per video: topic, angle, hook, story, visual format, visuals, audio',
     'Note which attributes repeat across winners this week',
     'Send hooks to Hook Miner and formats to Content Planner',
     'Flag any video whose claims would fail the allowlist so nobody copies it']),
  c('comment-reader', 'Comment Reader', 'Objections from comments', 'worker', ['apify', 'claude-code'],
    'Harvests objections and questions from comments and reviews and feeds them to the planners.',
    'Read the comments', 'Objections and questions, weekly.',
    ['Pull comments on Helight posts and on the top competitor posts',
     'Group them into objections, questions and praise',
     'Rank objections by frequency',
     'Merge with Voice of Customer\'s weekly synthesis from Customer Care',
     'Send the top five objections to Content Planner and Hook Miner']),
  c('hook-miner', 'Hook Miner', 'The hook vault', 'specialist', ['claude-code', 'gbrain'],
    'Keeps the vault: winning hooks turned into templates with variable slots.',
    'Maintain the hook vault', 'Winning hooks into slotted templates.',
    ['Take the hooks from Video Analyst and the objections from Comment Reader',
     'Turn each winning hook into a template with variable slots',
     'Tag each template by lane, angle and format',
     'Retire templates that lost three tests in a row',
     'Publish the vault update to the brain for Ad Copywriter and Script Writer',
     'Report vault size and hit rate to Content Planner'],
    true, ['Vault at 214 templates; 9 added, 6 retired', 'Best template this month: "I stopped taking [x] and started doing this", 4 wins', 'Parent lane templates up to 38 after the Kidzzz push', 'Vault published to the brain; Ad Copywriter pulled 12 templates for week 37']),
  c('script-writer', 'Script Writer', 'Decomposed scripts', 'worker', ['claude-code'],
    'Writes scripts by decomposition: research, then hook, then style, then body. Never one-shot.',
    'Write the scripts', 'Research, hook, style, body.',
    ['Take the slot, its hypothesis and the hook template',
     'Write the research note: what the audience already believes',
     'Write the hook from the template, then the body in the chosen style lens',
     'Mark every claim with its allowlist id',
     'Deliver the script to Video Producer and Compliance Auditor together']),
  c('video-producer', 'Video Producer', 'AI video for volume', 'worker', ['arcads', 'remotion', 'higgsfield'],
    'Produces AI-generated video for volume testing and product spotlights from the brand pack.',
    'Produce the videos', 'Volume testing and spotlights.',
    ['Take the approved scripts',
     'Generate scenes, b-roll and product footage from the brand pack templates',
     'Render captions and sound with the Remotion pipeline',
     'Set the AI-generated content disclosure on every synthetic asset',
     'Hand cuts to Edit Assistant with the script attached']),
  c('edit-assistant', 'Edit Assistant', 'Prepares cuts for a human editor', 'worker', ['remotion', 'whisper'],
    'Prepares cuts, captions and crops for a human editor. Editing stays human, and the board says so.',
    'Prepare the edit', 'Cuts and captions for a human editor.',
    ['Transcribe the source with Whisper',
     'Mark the hook and the strongest segments on the transcript',
     'Render a first cut with captions on beat and platform crops',
     'Hand the cut to the human editor with the brief and the transcript',
     'Collect the final and pass it to Publisher']),
  c('publisher', 'Publisher', 'Daily cadence', 'specialist', ['zernio'],
    'Publishes on cadence to TikTok, Instagram and YouTube Shorts. The feed never goes dark.',
    'Publish on cadence', 'Daily, three platforms, never dark.',
    ['Take the next approved post from the calendar',
     'Adapt the caption per platform and confirm the disclosure flag',
     'Publish through Zernio and record the post ids',
     'Verify each went live; retry a failed platform once',
     'Flag any day with no post to Content Planner before noon',
     'Report posted count to Performance Reader'],
    true, ['Posted 3 of 3 today: TikTok, Instagram, Shorts', '21 posts this week, 0 dark days', 'Instagram publish failed once, retried, live at 10:14', 'Creator drop cross-posted with the disclosure flag set']),
  c('creator-recruiter', 'Creator Recruiter', 'Find and vet creators per lane', 'worker', ['claude-code', 'apify'],
    'Finds and vets creators per audience lane: parents, shift workers, wearable optimisers, travellers.',
    'Recruit creators', 'Per lane, vetted.',
    ['Search each lane for creators with engaged audiences under 100k',
     'Check past brand work and any health-claim history',
     'Shortlist five per lane with rates and reach',
     'Send the shortlist to Content Planner for the pick',
     'Open the conversation with the chosen creators']),
  c('creator-briefer', 'Creator Briefer', 'Briefs and terms', 'worker', ['claude-code'],
    'Writes creator briefs from the angle bank, with disclosure rules and whitelisting terms.',
    'Brief the creators', 'Angle bank, disclosure, whitelisting.',
    ['Take the lane, angle and format for the creator',
     'Write the brief with the allowlist claims and the disclosure rules',
     'Include the whitelisting terms so winners can go paid',
     'Send through Compliance Auditor',
     'Deliver to the creator and log the due date']),
  c('twenty-one-nights-producer', '21 Nights Producer', 'The documented series', 'specialist', ['claude-code', 'zernio'],
    'Runs the day 1, day 7, day 21 series across creators in parallel, wearable data on screen.',
    'Run the 21 Nights series', 'Day 1, 7, 21, in parallel.',
    ['Enrol each new creator into the series with a start date',
     'Send the day 1, day 7 and day 21 prompts on schedule',
     'Collect the wearable screenshots and the video for each episode',
     'Pass each episode through Compliance Auditor',
     'Schedule episodes with Publisher so a series episode lands every week',
     'Report completion rate to Performance Reader'],
    true, ['6 creators in the series; 3 at day 7, 2 at day 21, 1 enrolled today', 'Day 21 episode from the shift-worker lane: deep sleep up on screen, cleared by Compliance', 'Series completion rate 83%', 'Two day-21 episodes flagged as winners for paid']),
  c('performance-reader', 'Performance Reader', 'Kill and promote', 'specialist', ['zernio', 'claude-code'],
    'Kills losers, flags winners to Growth\'s Campaign Launcher, writes learnings back to the planner.',
    'Read performance and decide', 'Kill, promote, learn.',
    ['Pull 48-hour performance for every post against its hypothesis',
     'Kill posts under the floor and record why',
     'Flag posts above the promote line to Growth\'s Campaign Launcher for paid',
     'Write the learning per hypothesis back to Content Planner',
     'Update the hit rate per lane and format',
     'Hand the winner list to Translator'],
    true, ['Week 36: 21 posts read, 9 killed, 2 promoted to paid, hit rate 9.5%', 'Winner flagged to Campaign Launcher: wearable before-and-after, shift-worker lane', 'Parent POV format hit rate up to 14% over four weeks', 'Learning filed: physician explainer underperforms without a face']),
];
```

- [ ] **Step 2: Append to the index and run the roster test**

Run: `npx vitest run tests/roster.test.ts`
Expected: Growth and Content counts pass.

- [ ] **Step 3: Commit**

```bash
git add lib/roster/content.ts lib/roster/index.ts
git commit -m "feat: Content roster, the organic and creator engine"
```

---

### Task 4: Retention roster

**Files:**
- Create: `lib/roster/retention.ts`
- Modify: `lib/roster/index.ts`

**Interfaces:**
- Produces: `RETENTION: RosterEntry[]`, 11 entries, lead `lifecycle-planner`. Ids: `lifecycle-planner`, `segment-builder`, `email-writer`, `sms-writer`, `campaign-composer`, `twenty-one-nights-coach`, `offer-designer`, `referral-runner`, `win-back-writer`, `flow-auditor`, `retention-reporter`.

- [ ] **Step 1: Write the Retention roster**

Helper `r()` with `DEPT.retention`, `LEAD = 'lifecycle-planner'`, tools default `['klaviyo']`.

```ts
export const RETENTION: RosterEntry[] = [
  r('lifecycle-planner', 'Lifecycle Planner', 'The flow map', 'lead', ['klaviyo', 'shopify', 'claude-code'],
    'Maps the flows: welcome, browse abandon, cart abandon, post-purchase, review request, win-back, gifting.',
    'Plan the lifecycle flows', 'Seven flows, owned and measured.',
    ['List the flows and the trigger for each',
     'Set the goal metric per flow (capture rate, recovery rate, repeat rate)',
     'Assign writers and the segments each flow uses',
     'Check every flow has a Compliance Auditor pass before it goes live',
     'Review flow revenue weekly with Flow Auditor',
     'Report the plan and its numbers to Retention Reporter'],
    true, ['Seven flows mapped; welcome and cart abandon live, post-purchase in review', 'Cart abandon recovery target 8%; current 6.4%', 'Gifting flow drafted for the Q4 season', 'Post-purchase flow rebuilt around the 21 nights']),
  r('segment-builder', 'Segment Builder', 'Lanes as segments', 'worker', ['klaviyo'],
    'Turns the audience lanes into Klaviyo segments: parents, shift workers, wearable optimisers, travellers, couples.',
    'Build the segments', 'Lanes into Klaviyo segments.',
    ['Define each lane by product bought, quiz answer or source campaign',
     'Build the segment and check its size',
     'Add the engaged and lapsed variants per segment',
     'Hand segment ids to the writers',
     'Refresh sizes weekly for Retention Reporter']),
  r('email-writer', 'Email Writer', 'Flow and campaign copy', 'worker', ['klaviyo', 'claude-code'],
    'Writes copy for every flow and campaign in the brand voice from the brand pack.',
    'Write the emails', 'Flows and campaigns, brand voice.',
    ['Take the flow or campaign brief and its segment',
     'Write subject, preview and body in the brand voice',
     'Use only allowlist claims and mark each',
     'Send through Compliance Auditor',
     'Deliver to Lifecycle Planner with the send window']),
  r('sms-writer', 'SMS Writer', 'Short check-ins', 'worker', ['klaviyo', 'claude-code'],
    'Writes SMS: cart, shipping, night 7 and night 21 check-ins.',
    'Write the SMS', 'Cart, shipping, night 7, night 21.',
    ['Take the trigger and the segment',
     'Write the message under 160 characters with one link',
     'Check consent and quiet hours per country',
     'Send through Compliance Auditor',
     'Deliver to Lifecycle Planner']),
  r('campaign-composer', 'Campaign Composer', 'Weekly sends', 'worker', ['klaviyo', 'claude-code'],
    'Composes the weekly sends: education, proof, seasonal, gifting.',
    'Compose the weekly campaign', 'Education, proof, seasonal, gifting.',
    ['Pick this week\'s theme from the content calendar',
     'Reuse the week\'s winning hook where it fits',
     'Write the send with Email Writer',
     'Pick segments and the send time per region',
     'Log open and click rates for Retention Reporter']),
  r('twenty-one-nights-coach', '21 Nights Coach', 'Post-purchase onboarding', 'specialist', ['klaviyo', 'shopify'],
    'Runs the post-purchase sequence at day 1, 7 and 21. Keeps the device in use through the three weeks it needs, so fewer 60-day refunds, and asks for the review on the right night.',
    'Coach the first 21 nights', 'Day 1, 7, 21. Fewer refunds, better reviews.',
    ['Trigger on order delivered',
     'Day 1: how to place it, the 28-minute cycle, what to expect in week one',
     'Day 7: check in, answer the top three first-week questions',
     'Day 21: ask how the nights went and request the review',
     'Route anyone reporting no change to Refund Handler before the guarantee window closes',
     'Report completion and refund rate against non-coached buyers'],
    true, ['1,240 buyers in the sequence; day-21 review request click rate 18%', 'Refund rate for coached buyers 3.1% against 5.8% uncoached', 'Day 7 reply "still waking at 3am" routed to Refund Handler with the coaching path first', 'Sequence localised to French for Quebec orders']),
  r('offer-designer', 'Offer Designer', 'Bundles and second device', 'specialist', ['shopify', 'claude-code'],
    'Designs bundles and second-device offers: Sleep x2, Sleep plus Kidzzz, gifting, guarantee framing.',
    'Design the offers', 'Bundles, second device, guarantee framing.',
    ['Read repeat and bundle data from Shopify',
     'Design one offer per lane: partner device, child device, gift',
     'Frame the guarantee as risk reversal in every offer',
     'Check margin per offer with Contribution Margin',
     'Hand the offer to Promo Planner in Store and Campaign Composer',
     'Read results after two weeks and keep or kill'],
    true, ['Sleep plus Kidzzz bundle: attach rate 11% in week one', 'Partner device offer at day 30: 6% take rate', 'Gift offer margin checked: 41% after shipping']),
  r('referral-runner', 'Referral Runner', 'Couples and parents refer', 'worker', ['klaviyo', 'shopify'],
    'Runs referrals: couples and parents refer; partner and second bedroom offers.',
    'Run the referral loop', 'Refer a partner, a parent, a friend.',
    ['Trigger at day 30 for buyers with a review or a repeat',
     'Offer the referral reward and the partner device link',
     'Track referred orders back to the referrer',
     'Pay out rewards weekly',
     'Report referral share of orders to Retention Reporter']),
  r('win-back-writer', 'Win-back Writer', 'Lapsed and abandoned', 'worker', ['klaviyo', 'claude-code'],
    'Writes win-back for lapsed browsers, carts past the flow, and gift-season returns.',
    'Write the win-back', 'Lapsed browsers, old carts, gift season.',
    ['Pull segments lapsed 30, 60 and 90 days',
     'Write one message per lapse window with a different reason to return',
     'Use the guarantee and the 21 nights as the argument, never discounts first',
     'Send through Compliance Auditor',
     'Report recovered orders to Retention Reporter']),
  r('flow-auditor', 'Flow Auditor', 'Deliverability and list health', 'worker', ['klaviyo'],
    'Audits deliverability, list health, and flow versus campaign revenue share.',
    'Audit the flows', 'Deliverability, list health, revenue share.',
    ['Check bounce, spam and unsubscribe rates per flow',
     'Check list growth against the capture flows',
     'Compute flow versus campaign revenue share',
     'Flag any flow with falling revenue for two weeks',
     'Report to Lifecycle Planner']),
  r('retention-reporter', 'Retention Reporter', 'Repeat, flow revenue, refunds', 'worker', ['klaviyo', 'shopify'],
    'Reports repeat rate, flow revenue, refund rate against the guarantee, and list growth.',
    'Report retention weekly', 'Repeat, flows, refunds, list.',
    ['Pull repeat rate and second-device rate from Shopify',
     'Pull flow and campaign revenue from Klaviyo',
     'Pull refund rate inside the 60-day window',
     'Write five lines for Yannick with the trend per line',
     'File the table and send Monday with the Ads Reporter brief']),
];
```

- [ ] **Step 2: Append to the index, run the roster test, commit**

```bash
git add lib/roster/retention.ts lib/roster/index.ts
git commit -m "feat: Retention roster, Klaviyo flows and the 21 Nights coach"
```

---

### Task 5: Store roster

**Files:**
- Create: `lib/roster/store.ts`
- Modify: `lib/roster/index.ts`

**Interfaces:**
- Produces: `STORE: RosterEntry[]`, 12 entries, lead `store-auditor`. Ids: `store-auditor`, `seo-auditor`, `evidence-curator`, `page-writer`, `ai-answer-optimizer`, `product-page-optimizer`, `storefront-tester`, `blog-writer`, `catalog-keeper`, `promo-planner`, `amazon-listing-auditor`, `store-reporter`.

- [ ] **Step 1: Write the Store roster**

Helper `s()` with `DEPT.store`, `LEAD = 'store-auditor'`.

```ts
export const STORE: RosterEntry[] = [
  s('store-auditor', 'Store Auditor', 'Weekly storefront crawl', 'lead', ['shopify', 'claude-code'],
    'Crawls the storefront weekly: empty pages, dead nav items, broken comparison rows, dates that disagree.',
    'Audit the storefront', 'Empty pages, dead nav, broken rows.',
    ['Crawl every page in the sitemap on desktop and mobile',
     'Flag pages that render no body content',
     'Flag nav items pointing at out-of-stock or unbuyable products',
     'Flag any claim or date that disagrees with another page',
     'Open one ticket per finding with the fix owner',
     'Report open and closed findings to Store Reporter'],
    true, ['Crawl: 4 pages render empty (science, doctor-recommended, compare, better-sleep); tickets opened', 'Nightlight out of stock and still in the nav; Catalog Keeper ticket', 'Founding dates disagree across homepage, About and protocol page; Page Writer ticket', 'Care row in the comparison table has no product; Catalog Keeper ticket']),
  s('seo-auditor', 'SEO Auditor', 'Technical SEO and locales', 'worker', ['claude-code'],
    'Audits technical SEO, duplicate blog titles, and locale handling across EN, FR and DE.',
    'Audit SEO monthly', 'Technical, duplicates, locales.',
    ['Check indexing, canonicals and hreflang across the three locales',
     'Flag duplicate titles and near-duplicate posts',
     'Check Core Web Vitals on the product pages',
     'List the top ten queries the site should own and does not',
     'Hand fixes to Page Writer and Blog Writer']),
  s('evidence-curator', 'Evidence Curator', 'The evidence base', 'specialist', ['gbrain', 'claude-code'],
    'Keeps the evidence base: patents, study chain, clinician positions, awards, survey. Structured, sourced, dated, checkable.',
    'Curate the evidence', 'Patents, studies, clinicians, awards, survey.',
    ['List every claim the brand makes and the source behind it',
     'File each source in the brain with date, jurisdiction and a link',
     'Mark claims with no source as unsubstantiated and tell Compliance Auditor',
     'Keep the survey figures paired with a method note',
     'Publish the allowlist from the sourced claims',
     'Review quarterly for new studies'],
    true, ['Evidence base: 7 patent filings, 6 studies, 3 clinicians, 4 awards filed with sources', 'Survey figures (98 / 96 / 86 percent) marked "method not published"; allowlist wording adjusted', 'Strasbourg 2024 study added; Compliance Auditor notified', 'NFL and NBA usage marked as claimed, not verified']),
  s('page-writer', 'Page Writer', 'Fills the empty pages', 'worker', ['shopify', 'claude-code'],
    'Fills science, doctor-recommended, compare and better-sleep from the curated evidence.',
    'Write the proof pages', 'Four empty pages, filled from evidence.',
    ['Take the evidence base from Evidence Curator',
     'Write the science page as a sourced, dated list, not prose',
     'Write doctor-recommended with each clinician\'s position and link',
     'Write compare against Hatch, Loftie and melatonin, with the no-app angle',
     'Send through Compliance Auditor and publish']),
  s('ai-answer-optimizer', 'AI Answer Optimizer', 'Own the assistant answer', 'specialist', ['claude-code'],
    'Rewrites agents.md and llms.txt, adds schema, and tracks whether ChatGPT, Claude and Perplexity cite Helight for "what helps me fall asleep".',
    'Optimise for AI answers', 'agents.md, llms.txt, schema, citations.',
    ['Replace the Shopify boilerplate agents.md with Helight\'s product, protocol, evidence and audience',
     'Write llms.txt pointing at the proof pages and the catalog',
     'Add product, organisation and FAQ schema to the key pages',
     'Ask the same ten sleep questions to three assistants weekly and record who gets cited',
     'Report share of voice against Hatch, Loftie and Therabody',
     'Hand content gaps to Blog Writer'],
    true, ['agents.md rewritten: 1,900 words on the product, the protocol and the evidence', 'Citation check: Helight cited in 3 of 10 answers, up from 0', 'FAQ schema added to the science page', 'Gap found: no page answers "is red light safe for babies"; Blog Writer ticket']),
  s('product-page-optimizer', 'Product Page Optimizer', 'Conversion on the PDP', 'specialist', ['shopify', 'claude-code'],
    'Works the product pages: message match, proof blocks, mobile friction, guarantee placement.',
    'Optimise the product pages', 'Message match, proof, mobile, guarantee.',
    ['Take findings from Landing Page Auditor in Growth',
     'Move proof and guarantee above the fold on mobile',
     'Match the page headline to the live winning hook',
     'Cut page weight until it loads under three seconds',
     'Hand each change to Storefront Tester as a test',
     'Report conversion rate per page to Store Reporter'],
    true, ['Sleep PDP: guarantee moved above the fold, mobile conversion 2.1 to 2.6 percent in test', 'Headline matched to the sunset-mimic hook for the parents campaign', 'Page weight cut 38%, load 2.4 seconds on 4G']),
  s('storefront-tester', 'Storefront Tester', 'A/B on the store', 'worker', ['shopify'],
    'Runs A/B tests on offers, guarantee wording, and bundle placement.',
    'Run storefront tests', 'Offers, guarantee, bundles.',
    ['Take the change from Product Page Optimizer or Offer Designer',
     'Set the metric, sample size and duration',
     'Run the test on one page at a time',
     'Read the result and record the decision',
     'Report wins and losses to Store Reporter']),
  s('blog-writer', 'Blog Writer', 'Product-led posts', 'worker', ['shopify', 'claude-code'],
    'Writes product-led, comparison and objection posts instead of sleep-wellness prose.',
    'Write the blog', 'Product-led, comparison, objection.',
    ['Take the gap list from AI Answer Optimizer and SEO Auditor',
     'Write one post per gap, answering the question in the first paragraph',
     'Use the evidence base for every figure',
     'Send through Compliance Auditor',
     'Publish and add to llms.txt']),
  s('catalog-keeper', 'Catalog Keeper', 'SKUs, stock, locales', 'worker', ['shopify', 'amazon'],
    'Keeps SKUs, variants, stock and locales straight. Flags the out-of-stock nightlight and the unbuyable Care row.',
    'Keep the catalog', 'SKUs, stock, locales.',
    ['Check stock per SKU and variant daily',
     'Hide or label out-of-stock items in the nav',
     'Remove or fix comparison rows for products not for sale',
     'Check price and copy parity across EN, FR and DE',
     'Report stock days remaining to Promo Planner and Finance']),
  s('promo-planner', 'Promo Planner', 'Calendar and bundle rules', 'worker', ['shopify', 'claude-code'],
    'Plans the promo calendar, bundle rules and gifting seasons.',
    'Plan the promos', 'Calendar, bundles, gifting.',
    ['Build the calendar around gifting seasons and the content calendar',
     'Take offers from Offer Designer and set the bundle rules',
     'Check margin per promo with Contribution Margin',
     'Brief Campaign Composer and Growth Planner two weeks ahead',
     'Read results and keep or kill each promo']),
  s('amazon-listing-auditor', 'Amazon Listing Auditor', 'Seller Central health', 'worker', ['amazon'],
    'Audits the Amazon listing: health, reviews, Sponsored Products.',
    'Audit the Amazon listing', 'Listing, reviews, Sponsored Products.',
    ['Check listing content and images against the brand pack',
     'Read new reviews and flag one and two stars to Review Monitor',
     'Check Sponsored Products spend and ACOS',
     'Check Buy Box and stock',
     'Report to Store Reporter']),
  s('store-reporter', 'Store Reporter', 'Sessions, conversion, AOV', 'worker', ['shopify'],
    'Reports sessions, conversion rate and AOV by locale and device.',
    'Report the store weekly', 'Sessions, conversion, AOV.',
    ['Pull sessions, conversion rate and AOV from Shopify',
     'Split by locale and device',
     'Add open audit findings and test results',
     'Write five lines for Yannick',
     'File the table and send Monday']),
];
```

- [ ] **Step 2: Append to the index, run the roster test, commit**

```bash
git add lib/roster/store.ts lib/roster/index.ts
git commit -m "feat: Store roster, the storefront and its proof"
```

---

### Task 6: Customer Care roster

**Files:**
- Create: `lib/roster/care.ts`
- Modify: `lib/roster/index.ts`

**Interfaces:**
- Produces: `CARE: RosterEntry[]`, 11 entries, lead `support-triage`. Ids: `support-triage`, `reply-drafter`, `dm-responder`, `refund-handler`, `shipping-tracker`, `faq-keeper`, `escalation-manager`, `review-monitor`, `voice-of-customer`, `team-feed`, `care-reporter`.

- [ ] **Step 1: Write the Customer Care roster**

Helper `k()` with `DEPT.care`, `LEAD = 'support-triage'`.

```ts
export const CARE: RosterEntry[] = [
  k('support-triage', 'Support Triage', 'Sorts every inbound message', 'lead', ['support-inbox', 'gmail', 'claude-code'],
    'Sorts contact form, email and marketplace messages into skip, info, action and urgent.',
    'Triage inbound', 'Skip, info, action, urgent.',
    ['Pull new messages from the contact form, the inbox and Amazon',
     'Classify each: skip, info only, action needed, urgent',
     'Route action items to Reply Drafter, Refund Handler or Shipping Tracker',
     'Route urgent and press to Escalation Manager',
     'Record first response time per message',
     'Report the day\'s volume and top issues to Care Reporter'],
    true, ['Triaged 84 messages: 31 info, 44 action, 6 urgent, 3 skipped', 'Median first response 41 minutes, under the one hour target', 'Top issue today: where is my order (Canada customs)', 'Press enquiry routed to Escalation Manager within 5 minutes']),
  k('reply-drafter', 'Reply Drafter', 'Drafts, never sends', 'worker', ['support-inbox', 'claude-code'],
    'Drafts every reply in brand voice inside the allowlist. Drafts only, a human sends.',
    'Draft the replies', 'Brand voice, allowlist, human sends.',
    ['Take the action items from Support Triage',
     'Draft the reply from the FAQ Keeper answers where one exists',
     'Keep every claim inside the allowlist',
     'Queue the draft for a human to send',
     'Log which FAQ answered it so FAQ Keeper sees the gaps']),
  k('dm-responder', 'DM Responder', 'TikTok and Instagram DMs', 'worker', ['zernio', 'claude-code'],
    'Answers questions in TikTok and Instagram DMs and comments, and hands buying intent to the store.',
    'Answer the DMs', 'Questions answered, intent handed over.',
    ['Pull new DMs and comment questions',
     'Answer from the FAQ Keeper answers',
     'Send buying intent the product link and log it for the funnel',
     'Escalate anything about medical conditions to FAQ Keeper',
     'Report volume to Care Reporter']),
  k('refund-handler', 'Refund Handler', 'The 60-day guarantee', 'specialist', ['shopify', 'klaviyo'],
    'Handles guarantee requests: checks nights used, offers the 21 Nights path first, processes when due.',
    'Handle refund requests', 'Nights used, coaching first, refund when due.',
    ['Take the refund request and the order date',
     'Check how many nights the customer has used the device',
     'Under 21 nights: offer the 21 Nights Coach path and a check-in date',
     'Over 21 nights or declined: process the refund inside the guarantee terms',
     'Record the stated reason for Voice of Customer',
     'Report refund count and saved count to Care Reporter'],
    true, ['12 requests this week: 5 coached and kept, 7 refunded, all inside the window', 'Reason logged most: "no change after two weeks"; 4 of those under 14 nights', 'Kidzzz refund: child would not keep it on; reason filed for Offer Designer', 'Refund rate this month 4.2%']),
  k('shipping-tracker', 'Shipping Tracker', 'Where is my order', 'worker', ['shopify'],
    'Answers where is my order, customs and duties across 40 countries.',
    'Track shipping questions', 'Orders, customs, duties.',
    ['Take the order number from the message',
     'Pull tracking from Shopify and the carrier',
     'Answer with the next scan and the expected date',
     'Explain duties for the destination when asked',
     'Flag any parcel stuck over five days to Support Triage']),
  k('faq-keeper', 'FAQ Keeper', 'Approved sensitive answers', 'worker', ['gbrain', 'claude-code'],
    'Keeps the approved answers for infants, eyes, pregnancy and medication. Anything outside it escalates.',
    'Keep the approved answers', 'Sensitive questions, approved wording.',
    ['Maintain the approved answer for each sensitive question',
     'Source each answer from the evidence base',
     'Refuse to answer outside the list and escalate to a human',
     'Add new questions from Reply Drafter\'s gap log',
     'Review with Compliance Auditor monthly']),
  k('escalation-manager', 'Escalation Manager', 'What reaches Yannick', 'worker', ['gmail', 'slack'],
    'Sends press, retail buyers, clinicians and angry customers to Yannick with context.',
    'Manage escalations', 'Press, buyers, clinicians, anger.',
    ['Take urgent items from Support Triage',
     'Attach the customer history and the last three messages',
     'Write the one-line ask for Yannick',
     'Post to Slack and email with the deadline',
     'Track until closed']),
  k('review-monitor', 'Review Monitor', 'Site, Amazon, Ulta reviews', 'worker', ['reviews', 'amazon'],
    'Watches site, Amazon and Ulta reviews, flags one and two stars, drafts replies.',
    'Monitor the reviews', 'Flag low stars, draft replies.',
    ['Pull new reviews from the site, Amazon and Ulta',
     'Flag one and two stars to Support Triage the same day',
     'Draft a reply per review for a human to post',
     'Send verbatims to Voice of Customer',
     'Report rating trend to Care Reporter']),
  k('voice-of-customer', 'Voice of Customer', 'Weekly synthesis', 'specialist', ['claude-code', 'gbrain'],
    'Synthesises objections and questions weekly and feeds Content\'s Comment Reader and Store\'s Page Writer.',
    'Synthesise the customer voice', 'Objections and questions, weekly.',
    ['Collect the week\'s messages, reviews, DMs and refund reasons',
     'Group into objections, questions and praise with counts',
     'Write the top five of each with a verbatim',
     'Send objections to Comment Reader and questions to Page Writer and FAQ Keeper',
     'File the synthesis in the brain',
     'Report shifts week over week to Care Reporter'],
    true, ['Week 36: top objection "does it really work" (41), top question "safe for a 2-year-old" (27)', 'New this week: "can I use it with my Oura ring", sent to Comment Reader as a format idea', 'Praise theme: travel size; sent to Content Planner', 'Synthesis filed; Page Writer picked up the infant safety question']),
  k('team-feed', 'Team Feed', 'Inbox and Slack digest', 'worker', ['gmail', 'slack'],
    'Digests Slack and the inbox so nothing waits on the phone line.',
    'Digest the team feed', 'Inbox and Slack, twice a day.',
    ['Pull unread from the inbox and new Slack messages',
     'Group by thread and flag anything with a customer waiting',
     'Post the digest at 09:00 and 15:00 Hong Kong time',
     'Flag threads with no owner',
     'Report unread counts to Care Reporter']),
  k('care-reporter', 'Care Reporter', 'Response, resolution, refunds', 'worker', ['claude-code'],
    'Reports first response time, resolution time, refund rate and the top five issues.',
    'Report care weekly', 'Response, resolution, refunds, issues.',
    ['Pull first response and resolution times',
     'Pull refund count and rate from Refund Handler',
     'Take the top five issues from Voice of Customer',
     'Write five lines for Yannick',
     'File the table and send Monday']),
];
```

- [ ] **Step 2: Append to the index, run the roster test, commit**

```bash
git add lib/roster/care.ts lib/roster/index.ts
git commit -m "feat: Customer Care roster, every inbound customer voice"
```

---

### Task 7: Finance roster

**Files:**
- Create: `lib/roster/finance.ts`
- Modify: `lib/roster/index.ts`

**Interfaces:**
- Produces: `FINANCE: RosterEntry[]`, 4 entries, lead `payments-pulse`. Ids: `payments-pulse`, `ad-spend-ledger`, `contribution-margin`, `month-close`.

- [ ] **Step 1: Write the Finance roster**

Helper `f()` with `DEPT.finance`, `LEAD = 'payments-pulse'`.

```ts
export const FINANCE: RosterEntry[] = [
  f('payments-pulse', 'Payments Pulse', 'Shopify Payments and Amazon payouts', 'lead', ['shopify', 'amazon'],
    'Tracks Shopify Payments and Amazon payouts daily.',
    'Track payouts daily', 'Shopify Payments, Amazon.',
    ['Pull yesterday\'s Shopify Payments and Amazon settlements',
     'Reconcile against orders and refunds',
     'Flag any payout delayed over three days',
     'Post the daily line to Slack',
     'Feed the numbers to Contribution Margin and Month Close']),
  f('ad-spend-ledger', 'Ad Spend Ledger', 'Spend against plan', 'worker', ['meta-ads', 'tiktok-ads', 'google-ads'],
    'Records spend per platform per day against the plan.',
    'Keep the ad spend ledger', 'Per platform, per day, against plan.',
    ['Pull spend per platform for yesterday',
     'Record against the week\'s plan from Growth Planner',
     'Flag variance over ten percent to Budget Auditor',
     'Reconcile monthly against platform invoices',
     'Feed spend to Contribution Margin']),
  f('contribution-margin', 'Contribution Margin', 'Margin per SKU', 'specialist', ['shopify', 'claude-code'],
    'Computes contribution margin per SKU after ads, shipping and refunds. The number that decides whether scaling a winner is right.',
    'Compute contribution margin', 'Per SKU, after ads, shipping, refunds.',
    ['Take revenue per SKU from Payments Pulse',
     'Subtract product cost, shipping, payment fees and refunds',
     'Subtract attributed ad spend from Ad Spend Ledger',
     'Publish margin per SKU and the CPA ceiling it implies',
     'Send the ceiling to Growth Planner and Budget Auditor weekly',
     'Flag any SKU whose margin fell under 30 percent'],
    true, ['Sleep: 44% contribution after ads; CPA ceiling $46', 'Kidzzz: 39%; CPA ceiling $41', 'Refunds pulled Sleep margin down 2 points this month; Refund Handler notified', 'Two-pack: 47%, best margin in the catalog']),
  f('month-close', 'Month Close', 'Books closed monthly', 'worker', ['shopify', 'amazon', 'claude-code'],
    'Closes the books monthly with three lines of commentary.',
    'Close the month', 'Reconciled, three lines of commentary.',
    ['Reconcile payouts, spend and refunds for the month',
     'Compute revenue, contribution and net per SKU',
     'Write three lines: what grew, what shrank, what to watch',
     'File the close in the brain',
     'Send to Yannick on the third working day']),
];
```

- [ ] **Step 2: Append to the index, run the roster test, commit**

```bash
git add lib/roster/finance.ts lib/roster/index.ts
git commit -m "feat: Finance roster, margin per SKU"
```

---

### Task 8: Operations roster and the roster index

**Files:**
- Create: `lib/roster/operations.ts`
- Modify: `lib/roster/index.ts`

**Interfaces:**
- Produces: `OPERATIONS: RosterEntry[]`, 7 entries, lead `conductor`. Ids: `conductor`, `knowledge-agent`, `brand-pack-keeper`, `brain-auditor`, `connector-monitor`, `scheduler`, `data-agent`. `ROSTER` complete, 75 entries.

- [ ] **Step 1: Write the Operations roster**

Helper `o()` with `DEPT.operations`, `LEAD = 'conductor'`.

```ts
export const OPERATIONS: RosterEntry[] = [
  o('conductor', 'Conductor', 'Routes directives, runs the loop', 'lead', ['broadcast', 'tmux', 'ollama'],
    'Routes directives across the pillars and runs the weekly loop: Content finds, Growth funds, Retention keeps.',
    'Conduct the weekly loop', 'Content finds, Growth funds, Retention keeps.',
    ['Receive the directive from the operator console',
     'Resolve the target: the whole fleet or one pillar',
     'Fan the message out and stamp each send',
     'Collect replies and file the run',
     'Monday: trigger Ads Reporter, Retention Reporter, Store Reporter, Care Reporter in that order',
     'Report non-responders after sixty seconds']),
  o('knowledge-agent', 'Knowledge Agent', 'Answers from the company brain', 'specialist', ['gbrain', 'brain-store'],
    'Answers questions from the company brain: the evidence base, the claims allowlist, the brand pack, past decisions.',
    'Answer from the brain', 'Evidence, allowlist, brand pack, decisions.',
    ['Take the question from the operator or an agent',
     'Search the brain: evidence base, allowlist, brand pack, decisions',
     'Answer with the page and the date of the source',
     'Say when nothing in the brain answers it',
     'Log the question so gaps become pages',
     'Report brain health with Brain Auditor'],
    true, ['Answered "what can we say about the survey" with the allowlist line and the method note', 'Answered "which study covers sleep onset" with the 2018 paper page', 'No page answers "return policy for Germany"; gap logged for Page Writer', 'Brain health 90/100']),
  o('brand-pack-keeper', 'Brand Pack Keeper', 'Versions the brand pack', 'specialist', ['gbrain', 'claude-code'],
    'Versions the brand context, logos, approved product photography and templates the producers draw from.',
    'Keep the brand pack', 'Context, logos, photography, templates, versioned.',
    ['Hold the current brand pack version and its manifest',
     'Approve new product photography only with its source and retouch note',
     'Publish template changes with a version bump',
     'Tell Visual Designer and Video Producer when the pack changes',
     'Keep release approval separate from asset approval',
     'Log every version in the brain'],
    true, ['Brand pack 2.4.0: two retouched studio product shots added, release approval pending', 'Product spotlight template published', 'Pack manifest verified against every asset hash', 'Visual Designer notified of the 2.4.0 photography']),
  o('brain-auditor', 'Brain Auditor', 'Markdown and vector health', 'worker', ['gbrain', 'brain-store', 'zeroentropy'],
    'Keeps the markdown store and the vector index healthy.',
    'Audit the brain', 'Markdown and vectors.',
    ['Check every page has frontmatter and a title',
     'Find broken links and orphan pages',
     'Compare the vector index to the page count',
     'Re-embed pages changed since the last audit',
     'Report health to Knowledge Agent']),
  o('connector-monitor', 'Connector Monitor', 'Honest connector status', 'worker', ['shopify', 'klaviyo', 'meta-ads', 'tiktok-ads', 'google-ads', 'amazon', 'zernio'],
    'Reports the honest status of every connector: connected or needs key.',
    'Monitor the connectors', 'Connected or needs key, never faked.',
    ['Check each connector\'s credential and a read call',
     'Mark connected, needs key, or failing with the error',
     'Post changes to Slack',
     'Never report connected without a successful read',
     'Report the board state to Scheduler']),
  o('scheduler', 'Scheduler', 'Cron runs and alerts', 'worker', ['claude-code'],
    'Runs the cron schedule for every agent, keeps the run log, raises failure alerts.',
    'Run the schedule', 'Cron, run log, alerts.',
    ['Load the schedule per agent',
     'Start runs on time and record start and finish',
     'Retry a failed run once',
     'Alert on a second failure with the summary',
     'Report run counts and failures weekly']),
  o('data-agent', 'Data Agent', 'Numbers for every reporter', 'worker', ['shopify', 'klaviyo', 'meta-ads', 'gbrain'],
    'Pulls numbers across connectors for every pillar\'s reporter.',
    'Serve the reporters', 'Numbers across connectors.',
    ['Take the metric request from a reporter',
     'Pull from the connector or the seeded table',
     'Return the number with its source and date',
     'Cache for the day',
     'Log requests so missing metrics become connectors']),
];
```

- [ ] **Step 2: Complete the index**

```ts
// lib/roster/index.ts
import type { Department, Person } from '@/lib/schemas';
import type { RosterEntry } from './types';
import { GROWTH } from './growth';
import { CONTENT } from './content';
import { RETENTION } from './retention';
import { STORE } from './store';
import { CARE } from './care';
import { FINANCE } from './finance';
import { OPERATIONS } from './operations';

export { DEPT } from './types';
export type { RosterEntry } from './types';
export { toAgent } from './types';

export const ROSTER: RosterEntry[] = [...GROWTH, ...CONTENT, ...RETENTION, ...STORE, ...CARE, ...FINANCE, ...OPERATIONS];
export function rosterById(id: string): RosterEntry | undefined { return ROSTER.find((e) => e.id === id); }
export const HEROES = ROSTER.filter((e) => e.hero).map((e) => e.id);
```

Keep `DEPARTMENTS` and `PEOPLE` in this file as written in Task 1.

- [ ] **Step 3: Run the roster test**

Run: `npx vitest run tests/roster.test.ts`
Expected: PASS, all four tests.

- [ ] **Step 4: Commit**

```bash
git add lib/roster/operations.ts lib/roster/index.ts
git commit -m "feat: Operations roster and the complete 75-agent index"
```

---

### Task 9: Runtime derived from the roster

**Files:**
- Rewrite: `lib/agents/real.ts`
- Modify: `tests/conductor.test.ts:26-30`, `tests/ventures.test.ts` (KNOWN_AGENTS still works), `tests/life-map.test.ts` (restore any `test.todo` from Task 1)
- Test: `tests/runtime.test.ts` (unchanged), `tests/agent-chat.test.ts`, `tests/agent-tools.test.ts`, `tests/api.test.ts`, `tests/conductor.test.ts`

**Interfaces:**
- Consumes: `ROSTER`, `rosterById`.
- Produces: `realAgents: RuntimeAgent[]` with one entry per roster id; `seededRun(id)`; the real runs kept: `gmailRun`, `slackRun`, `zernioRun`, `arcadsRun`, the G-Brain `respond` and `chatTools` (from the old `data-agent` entry), the old `stack-monitor` run, the old `markdown-auditor` and `vector-auditor` runs, the old `conductor` entry.

- [ ] **Step 1: Read the old file once and keep the functions listed above**

Keep verbatim: the imports still needed, `gmailRun`, `slackRun`, `zernioRun`, `arcadsRun`, the helper that builds the G-Brain `respond`/`chatTools` (the old `data-agent` object body), the old `stack-monitor` run body, the old `markdown-auditor` and `vector-auditor` run bodies, and the old `conductor` object. Delete every other run function and every roster object (sales lanes, FanBasis, PAVA, WebinarJam, Trakyo, Attio, WhatsApp, Wispr, Notion, ManyChat, Remotion, Higgsfield, payments, processors). Delete the now-unused imports.

- [ ] **Step 2: Add the seeded run and derive the roster**

```ts
import { ROSTER } from '@/lib/roster';

/** Deterministic run for agents whose connector is not wired on this demo. */
const seededRun = (id: string, name: string, summaries: string[]) => async (): Promise<AgentRunResult> => {
  const day = Math.floor(Date.now() / 86_400_000);
  const summary = summaries[day % summaries.length] ?? `${name} completed a run.`;
  return { ok: true, summary, data: { seeded: true, agent: id } };
};

async function brainAuditorRun(): Promise<AgentRunResult> {
  const md = await markdownAuditRun();   // the old markdown-auditor body, renamed
  const vec = await vectorAuditRun();    // the old vector-auditor body, renamed
  return { ok: md.ok && vec.ok, summary: `${md.summary} · ${vec.summary}`, data: { markdown: md.data, vector: vec.data } };
}

async function teamFeedRun(): Promise<AgentRunResult> {
  const [mail, slack] = await Promise.all([gmailRun(), slackRun()]);
  return { ok: mail.ok || slack.ok, summary: `${mail.summary} · ${slack.summary}`, data: { mail: mail.data, slack: slack.data } };
}

/** Real run() and chat bindings by roster id; everything else is seeded. */
const REAL: Record<string, Partial<Pick<RuntimeAgent, 'run' | 'respond' | 'chatTools'>>> = {
  conductor: { run: conductorRun },                    // the old conductor run
  'knowledge-agent': { run: gbrainRun, respond: gbrainRespond, chatTools: gbrainChatTools },
  'data-agent': { run: gbrainRun, respond: gbrainRespond, chatTools: gbrainChatTools },
  'brain-auditor': { run: brainAuditorRun },
  'connector-monitor': { run: stackMonitorRun },       // the old stack-monitor run
  publisher: { run: zernioRun },
  'video-producer': { run: arcadsRun },
  'team-feed': { run: teamFeedRun },
};

export const realAgents: RuntimeAgent[] = ROSTER.map((e) => ({
  id: e.id,
  name: e.name,
  description: e.description,
  departmentId: e.departmentId,
  run: REAL[e.id]?.run ?? seededRun(e.id, e.name, e.runSummaries),
  ...(REAL[e.id]?.respond ? { respond: REAL[e.id]!.respond } : {}),
  ...(REAL[e.id]?.chatTools ? { chatTools: REAL[e.id]!.chatTools } : {}),
}));
```

Name the extracted G-Brain pieces `gbrainRun`, `gbrainRespond`, `gbrainChatTools` when you lift them out of the old `data-agent` object; the old `run` becomes `gbrainRun`.

- [ ] **Step 3: Update the conductor test**

`tests/conductor.test.ts` lines 26 to 30: replace `@sales-agent` with `@meta-ads-auditor` and `'sales-agent'` with `'meta-ads-auditor'` in the two expectations of that test. The `@Data-Agent` test stays.

- [ ] **Step 4: Run the runtime-facing tests**

Run: `npx vitest run tests/runtime.test.ts tests/conductor.test.ts tests/agent-chat.test.ts tests/agent-tools.test.ts tests/api.test.ts tests/broadcasts.test.ts tests/roster.test.ts tests/life-map.test.ts`
Expected: PASS. If `tests/api.test.ts` or `tests/agent-chat.test.ts` seed the database first, they will fail until Task 10 rewrites the seed; run them again after Task 10.

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck`
Expected: errors only in `lib/seed.ts` and files rewritten in later tasks; none in `lib/agents/real.ts`.

```bash
git add lib/agents/real.ts tests/conductor.test.ts tests/life-map.test.ts
git commit -m "feat: runtime roster derived from the Helight roster"
```

---

### Task 10: Seed assembler, SOPs and run history

**Files:**
- Rewrite: `lib/seed.ts` (keep `seedRand`, `seededAgentRuns`, `skillDoc`, `SKILL_STATUS_NOTE`, `RUN_MODEL_BY_TIER`, `SEED_TS`, `seedDatabase`; content moves out)
- Create: `lib/seed/tools.ts`, `lib/seed/roadmap.ts`, `lib/seed/social.ts`, `lib/seed/funnel.ts`, `lib/seed/workflows.ts` as empty typed exports in this task, filled in Tasks 12 to 15 (keep the old arrays' shapes)
- Modify: `tests/seed.test.ts`

**Interfaces:**
- Consumes: `ROSTER`, `DEPARTMENTS`, `PEOPLE`, `toAgent`.
- Produces: `seedDatabase(db)` unchanged signature; `seededAgentRuns` now reads `hero` and `runSummaries`.

- [ ] **Step 1: Rewrite the seed tests first**

Replace the four tests at `tests/seed.test.ts` lines 47 to 152 with:

```ts
  test('the seven pillars, in order', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    expect(db.departments.all().map((d) => d.name)).toEqual([
      'Growth', 'Content', 'Retention', 'Store', 'Customer Care', 'Finance', 'Operations',
    ]);
  });

  test('agents are homed in the right pillar', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    const byId = new Map(db.agents.all().map((a) => [a.id, a.departmentId]));
    for (const id of ['growth-planner', 'meta-ads-auditor', 'compliance-auditor', 'ads-reporter']) expect(byId.get(id)).toBe('dept-marketing-growth');
    for (const id of ['content-planner', 'creator-watcher', 'publisher', 'performance-reader']) expect(byId.get(id)).toBe('dept-content');
    for (const id of ['lifecycle-planner', 'twenty-one-nights-coach', 'offer-designer']) expect(byId.get(id)).toBe('dept-clients');
    for (const id of ['store-auditor', 'evidence-curator', 'ai-answer-optimizer']) expect(byId.get(id)).toBe('dept-sales');
    for (const id of ['support-triage', 'refund-handler', 'voice-of-customer', 'team-feed']) expect(byId.get(id)).toBe('dept-comms');
    for (const id of ['payments-pulse', 'contribution-margin']) expect(byId.get(id)).toBe('dept-finance');
    for (const id of ['conductor', 'knowledge-agent', 'brand-pack-keeper', 'data-agent']) expect(byId.get(id)).toBe('dept-tech');
    expect(db.agents.all().length).toBe(75);
  });

  test('every non-lead agent reports to its pillar lead', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    const agents = db.agents.all();
    const leads = new Map(agents.filter((a) => a.tier === 'lead').map((a) => [a.departmentId, a.id]));
    expect(leads.size).toBe(7);
    for (const a of agents) {
      if (a.tier === 'lead') expect(a.parentId).toBeNull();
      else expect(a.parentId).toBe(leads.get(a.departmentId));
      expect(a.instance).toBe('builtin');
    }
  });

  test('every agent has one SOP, heroes carry denser run history', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    const sops = db.sopTasks.all();
    const agentSops = sops.filter((t) => t.assigneeKind === 'agent');
    expect(new Set(agentSops.map((t) => t.assigneeId)).size).toBe(75);
    expect(sops.filter((t) => t.assigneeKind === 'person' && t.assigneeId === 'person-yannick').length).toBe(2);
    const runs = db.agentRuns.all();
    const count = (id: string) => runs.filter((r) => r.agentId === id).length;
    expect(count('compliance-auditor')).toBeGreaterThanOrEqual(12);
    expect(count('scheduler')).toBeLessThanOrEqual(9);
    expect(runs.find((r) => r.agentId === 'ads-reporter' && r.ok)?.summary).toMatch(/brief/i);
  });
```

Keep `populates every entity`, `every agent belongs to an existing department`, `every seeded agent maps to a real runtime agent`, and `re-seeding removes departments that left the model` as they are.

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/seed.test.ts`
Expected: FAIL on pillar names.

- [ ] **Step 3: Rewrite `lib/seed.ts` as an assembler**

```ts
import type { FounderDb } from '@/lib/db';
import { PERSONAS } from '@/lib/personas-seed';
import { runCostUsd } from '@/lib/agent-costs';
import type { Agent, AgentRun, Skill, SopTask } from '@/lib/schemas';
import { ROSTER, DEPARTMENTS, PEOPLE, DEPT, toAgent } from '@/lib/roster';
import { tools } from '@/lib/seed/tools';
import { roadmap, phases, domains, metrics } from '@/lib/seed/roadmap';
import { socialAccounts, socialBaseline, socialDms, socialDmSnapshots, socialDmMessages, socialPosts, emailListBaseline } from '@/lib/seed/social';
import { funnelContacts, funnelTouches } from '@/lib/seed/funnel';
import { workflows, skills, agentTasks } from '@/lib/seed/workflows';

const agents: Agent[] = ROSTER.map(toAgent);

const sopTasks: SopTask[] = [
  ...ROSTER.map((e) => ({
    id: `sop-${e.id}`,
    departmentId: e.departmentId,
    assigneeKind: 'agent' as const,
    assigneeId: e.id,
    title: e.sopTitle,
    summary: e.sopSummary,
    steps: e.steps,
  })),
  {
    id: 'sop-yannick-approve-week', departmentId: DEPT.growth, assigneeKind: 'person', assigneeId: 'person-yannick',
    title: 'Approve the week', summary: 'One look, one yes, Monday morning.',
    steps: [
      'Open the week plan from Growth Planner and the content calendar from Content Planner',
      'Check the lanes and angles against what the brand can stand behind',
      'Check the budget against the contribution margin floor',
      'Reply yes, or name the one thing to change',
      'Nothing launches before the yes',
    ],
  },
  {
    id: 'sop-yannick-approve-spend', departmentId: DEPT.growth, assigneeKind: 'person', assigneeId: 'person-yannick',
    title: 'Approve spend on winners', summary: 'Winners found by Content, funded by Growth, on your yes.',
    steps: [
      'Read the winner list from Performance Reader with the numbers behind each',
      'Read the scale recommendation from Budget Auditor',
      'Approve the amount per winner, or cap it',
      'Campaign Launcher amplifies within the hour',
      'Ads Reporter shows the result next Monday',
    ],
  },
];
```

Then keep `SEED_TS`, `RUN_MODEL_BY_TIER`, `SKILL_STATUS_NOTE`, `skillDoc`, `seedRand` from the old file, and rewrite `seededAgentRuns`:

```ts
function seededAgentRuns(agentList: Agent[]): AgentRun[] {
  const now = Date.now();
  const runs: AgentRun[] = [];
  for (const a of agentList) {
    const entry = ROSTER.find((e) => e.id === a.id);
    const rnd = seedRand(`runs:${a.id}`);
    const count = entry?.hero ? 12 + Math.floor(rnd() * 7) : 5 + Math.floor(rnd() * 5); // heroes 12..18, others 5..9
    const usesModel = rnd() > 0.3;
    const model = RUN_MODEL_BY_TIER[a.tier] ?? 'claude-sonnet-5';
    const summaries = entry?.runSummaries ?? [`${a.name} completed a run.`];
    for (let i = 0; i < count; i++) {
      const startedAt = new Date(now - rnd() * 20 * 86_400_000).toISOString();
      const durMs = 400 + Math.floor(rnd() * 7000);
      const finishedAt = new Date(Date.parse(startedAt) + durMs).toISOString();
      const ok = rnd() > 0.08;
      let tokensIn: number | null = null, tokensOut: number | null = null, runModel: string | null = null, costUsd: number | null = null;
      if (usesModel) {
        tokensIn = 800 + Math.floor(rnd() * 14000);
        tokensOut = 200 + Math.floor(rnd() * 4000);
        runModel = model;
        costUsd = Math.round(runCostUsd(tokensIn, tokensOut, runModel) * 1e6) / 1e6;
      }
      runs.push({
        id: `seed-run-${a.id}-${i}`, agentId: a.id, startedAt, finishedAt, ok,
        summary: ok ? summaries[i % summaries.length] : `${a.name} run failed and was retried.`,
        model: runModel, tokensIn, tokensOut, costUsd,
      });
    }
  }
  return runs;
}
```

`seedDatabase` keeps its body, with `departments` replaced by `DEPARTMENTS` and `people` by `PEOPLE`.

- [ ] **Step 4: Stub the five content modules with the old arrays moved verbatim**

For this task, move the old `tools`, `roadmap`, `phases`, `domains`, `metrics`, social arrays and helpers, funnel journeys, `workflows`, `skills`, `agentTasks` into the five new files unchanged (exports named as imported above), so the suite compiles. Tasks 12 to 15 replace their contents. The funnel file will fail the venture enum after Task 11; sequence the tasks in order.

- [ ] **Step 5: Run the seed tests and typecheck**

Run: `npx vitest run tests/seed.test.ts && npm run typecheck`
Expected: seed tests PASS; typecheck clean except for old venture ids in the moved funnel file, fixed in Task 11.

- [ ] **Step 6: Commit**

```bash
git add lib/seed.ts lib/seed/tools.ts lib/seed/roadmap.ts lib/seed/social.ts lib/seed/funnel.ts lib/seed/workflows.ts tests/seed.test.ts
git commit -m "refactor: seed assembles from the roster and split content files"
```

---

### Task 11: One venture and the funnel schema

**Files:**
- Rewrite: `lib/ventures.ts`
- Modify: `lib/schemas.ts:471-476`, `lib/funnel.ts:16-22`, `lib/funnel-live.ts:69-78,156`, `lib/funnel-ghl.ts:125`, `lib/graph-lens.ts:36-37,62-69,110-127`, `lib/brain-graph.ts` (agent folder map), `lib/content.ts:8`
- Modify: `app/funnel/page.tsx:40-44`, `components/FunnelNodeCard.tsx:105`
- Modify: `tests/ventures.test.ts`, `tests/content.test.ts`, `tests/graph-lens.test.ts`, `tests/funnel.test.ts`, `tests/funnel-live.test.ts`, `tests/funnel-ghl.test.ts`

**Interfaces:**
- Produces: `VENTURES` with one entry `helight`; `FunnelVentureSchema = z.enum(['helight'])`; `FunnelSourceSchema` gains `'shopify' | 'klaviyo' | 'tiktok-ads'`; `CONTENT_DEPT_ID = 'dept-content'`.

- [ ] **Step 1: Rewrite the venture tests**

```ts
// tests/ventures.test.ts
import { describe, expect, test } from 'vitest';
import { LIFE_AREAS } from '@/lib/life-map';
import { VENTURES, ventureAgentSet, venturesForAgent, getVenture, ventureAreaAgents } from '@/lib/ventures';
import { realAgents } from '@/lib/agents/real';

const KNOWN_AGENTS = new Set(realAgents.map((a) => a.id));

describe('VENTURES', () => {
  test('one lane: helight.com', () => {
    expect(VENTURES.map((v) => v.id)).toEqual(['helight']);
    expect(getVenture('helight')?.label).toBe('helight.com');
    expect(getVenture('nope')).toBeNull();
  });
  test('every areaAgents key is a real life area; every agent id is real', () => {
    const areaIds = new Set(LIFE_AREAS.map((a) => a.id));
    for (const v of VENTURES) for (const [areaId, ids] of Object.entries(v.areaAgents)) {
      expect(areaIds.has(areaId)).toBe(true);
      for (const id of ids) expect(KNOWN_AGENTS.has(id), id).toBe(true);
    }
  });
  test('compliance auditor and translator are listed for marketing from both pillars', () => {
    expect(ventureAreaAgents('helight', 'marketing')).toContain('compliance-auditor');
    expect(ventureAreaAgents('helight', 'marketing')).toContain('translator');
  });
  test('reverse lookup', () => {
    expect(venturesForAgent('conductor').map((v) => v.id)).toEqual(['helight']);
    expect(ventureAgentSet('helight').size).toBeGreaterThan(30);
  });
});
```

- [ ] **Step 2: Rewrite `lib/ventures.ts`**

Keep the `Venture` type and the four exported functions. Replace `VENTURES` with:

```ts
export const VENTURES: Venture[] = [
  {
    id: 'helight',
    label: 'helight.com',
    kind: 'DTC store',
    color: '#fafafa',
    detail: 'The Shopify store: Helight Sleep, Kidzzz, Nightlight. Every lane serves it.',
    brainTag: 'helight',
    focus: [
      'Content finds winners, Growth funds them, Retention keeps the buyer',
      'Every claim inside the allowlist before it ships',
      'Contribution margin per SKU decides what scales',
    ],
    areaAgents: {
      marketing: ['growth-planner', 'competitor-researcher', 'creative-strategist', 'ad-copywriter', 'visual-designer', 'format-checker', 'compliance-auditor', 'translator', 'campaign-launcher', 'meta-ads-auditor', 'tiktok-ads-auditor', 'google-ads-auditor', 'budget-auditor', 'experiment-designer', 'tracking-auditor', 'landing-page-auditor', 'ads-reporter', 'content-planner', 'creator-watcher', 'video-analyst', 'comment-reader', 'hook-miner', 'script-writer', 'video-producer', 'edit-assistant', 'publisher', 'creator-recruiter', 'creator-briefer', 'twenty-one-nights-producer', 'performance-reader'],
      sales: ['store-auditor', 'seo-auditor', 'evidence-curator', 'page-writer', 'ai-answer-optimizer', 'product-page-optimizer', 'storefront-tester', 'blog-writer', 'catalog-keeper', 'promo-planner', 'amazon-listing-auditor', 'store-reporter'],
      clients: ['lifecycle-planner', 'segment-builder', 'email-writer', 'sms-writer', 'campaign-composer', 'twenty-one-nights-coach', 'offer-designer', 'referral-runner', 'win-back-writer', 'flow-auditor', 'retention-reporter'],
      communication: ['support-triage', 'reply-drafter', 'dm-responder', 'refund-handler', 'shipping-tracker', 'faq-keeper', 'escalation-manager', 'review-monitor', 'voice-of-customer', 'team-feed', 'care-reporter'],
      finances: ['payments-pulse', 'ad-spend-ledger', 'contribution-margin', 'month-close'],
      knowledge: ['knowledge-agent', 'brand-pack-keeper', 'brain-auditor', 'data-agent'],
      operations: ['conductor', 'connector-monitor', 'scheduler'],
    },
  },
];
```

The venture colour is white on purpose: the house rule is monochrome. The old test asserting a colour per brand is gone.

- [ ] **Step 3: Schema, stage labels and the pages**

`lib/schemas.ts`:

```ts
export const FunnelVentureSchema = z.enum(['helight']);
export const FunnelChannelSchema = z.enum(['organic', 'ads', 'dm', 'email', 'webinar', 'call', 'checkout', 'crm']);
export const FunnelSourceSchema = z.enum(['trakyo', 'meta-ads', 'tiktok-ads', 'attio', 'ghl', 'shopify', 'klaviyo', 'manual']);
```

`lib/funnel.ts` stage labels: `First touch`, `Site visit`, `Email captured`, `Cart`, `Purchase` (ids unchanged).

`lib/funnel-live.ts`: delete `COMPANY_HINTS` and `classifyVenture`; where `venture: classifyVenture(name)` was, write `venture: 'helight'`. `lib/funnel-ghl.ts:125`: `venture: 'helight'`.

`app/funnel/page.tsx` lines 40 to 44:

```ts
const VENTURE_TABS: { id: FunnelVenture | 'all'; label: string }[] = [
  { id: 'all', label: 'All customers' },
  { id: 'helight', label: 'helight.com' },
];
```

`components/FunnelNodeCard.tsx` line 105: replace the ternary with `helight.com`.

`lib/content.ts`: `CONTENT_DEPT_ID = 'dept-content'`; the doc comment says the Content pillar, lead first.

`lib/graph-lens.ts`: rename the two function nodes to `fn-growth-team` ("Growth team": the Growth ids) and `fn-content-team` ("Content team": the Content ids); replace `act-lead-generation` members with `['growth-planner', 'campaign-launcher', 'creator-recruiter', 'dm-responder']` and update the other `act-*` member lists to Helight ids that fit their label (read each label, pick two to four agents). Update the switch at lines 110 to 127 to the new function ids.

`lib/brain-graph.ts`: replace the agent-to-folders map keys with the new ids; default for any missing id stays whatever the code does today. Minimum entries: `knowledge-agent: ['concepts','sources']`, `evidence-curator: ['sources','concepts']`, `hook-miner: ['ideas','writing']`, `voice-of-customer: ['people','inbox']`, `brand-pack-keeper: ['media']`.

- [ ] **Step 4: Update the remaining tests**

- `tests/content.test.ts`: lead is `content-planner`; the id list becomes `['content-planner', 'creator-watcher', 'publisher', 'hook-miner', 'performance-reader']`; the department is `dept-content`; exclusions `growth-planner` and `data-agent`.
- `tests/funnel.test.ts`, `tests/funnel-live.test.ts`, `tests/funnel-ghl.test.ts`: every `'vantage'` or `'launchpad-cohort'` value becomes `'helight'`; delete tests of `classifyVenture`.
- `tests/graph-lens.test.ts`: `fn-vantage` becomes `fn-growth-team`, `fn-launchpad-cohort` becomes `fn-content-team`, member ids per the new lists.

- [ ] **Step 5: Run the affected tests and typecheck**

Run: `npx vitest run tests/ventures.test.ts tests/content.test.ts tests/graph-lens.test.ts tests/funnel.test.ts tests/funnel-live.test.ts tests/funnel-ghl.test.ts tests/funnel-radial.test.ts tests/funnel-trakyo.test.ts && npm run typecheck`
Expected: PASS and clean, except the moved funnel seed data still says `launchpad-cohort` (Task 12 replaces it; if typecheck blocks, do Task 12 before committing this one, in the same commit).

- [ ] **Step 6: Commit**

```bash
git add lib/ventures.ts lib/schemas.ts lib/funnel.ts lib/funnel-live.ts lib/funnel-ghl.ts lib/graph-lens.ts lib/brain-graph.ts lib/content.ts app/funnel/page.tsx components/FunnelNodeCard.tsx tests/ventures.test.ts tests/content.test.ts tests/graph-lens.test.ts tests/funnel.test.ts tests/funnel-live.test.ts tests/funnel-ghl.test.ts
git commit -m "feat: one venture, helight.com, and ecommerce funnel stages"
```

---

### Task 12: Funnel journeys

**Files:**
- Rewrite: `lib/seed/funnel.ts`

**Interfaces:**
- Produces: `funnelContacts: FunnelContact[]`, `funnelTouches: FunnelTouch[]` (same derivation as the old seed).

- [ ] **Step 1: Verify the two-pack price**

Run: `curl -s https://helight.com/products/2x-helight-sleep | grep -o '"price":[0-9]*' | head -3`
Use the price found (in cents) for `amountUsd` on two-pack journeys. If the request fails, use 278 and note it in the commit body.

- [ ] **Step 2: Write fourteen journeys**

Keep `funnelDay`, `SeededTouch`, `SeededJourney` and the two derivations from the old file. Replace `FUNNEL_JOURNEYS` with fourteen entries in this shape, all `venture: 'helight'`:

```ts
{
  id: 'fc-parent-maya', name: 'Maya (parent, Kidzzz)', venture: 'helight',
  relationship: 'hot', likelihood: 100, product: 'Helight Kidzzz', amountUsd: 139,
  email: 'maya@example.com',
  touches: [
    ['first_touch', 'ads', 'TikTok ad: bedtime battle, parent POV', 'tiktok-ads', 12],
    ['engaged', 'organic', 'Visited the Kidzzz page twice, read the science page', 'shopify', 11],
    ['nurtured', 'email', 'Welcome flow email 2: safe for infants', 'klaviyo', 9],
    ['opted_in', 'checkout', 'Added Kidzzz to cart', 'shopify', 8],
    ['converted', 'checkout', 'Ordered Kidzzz, Quebec', 'shopify', 8],
  ],
},
```

The fourteen, with lane, product, furthest stage and the number of touches:

| id | name | lane | product | stage | touches |
|---|---|---|---|---|---|
| fc-parent-maya | Maya (parent, Kidzzz) | parents | Helight Kidzzz | converted | 5 |
| fc-nurse-dominic | Dominic (night shift) | shift workers | Helight Sleep | converted | 5 |
| fc-oura-lena | Lena (Oura user) | wearable optimisers | Helight Sleep | converted | 5 |
| fc-traveller-sam | Sam (frequent flyer) | travellers | Helight Sleep | converted | 4 |
| fc-couple-ines | Ines and Marc (couple) | couples | Helight Sleep x2 | converted | 5 |
| fc-melatonin-jo | Jo (quitting melatonin) | melatonin quitters | Helight Sleep | opted_in | 4 |
| fc-student-tariq | Tariq (student) | students | Helight Sleep | nurtured | 3 |
| fc-menopause-ruth | Ruth (menopause lane) | menopause | Helight Sleep | opted_in | 4 |
| fc-parent-owen | Owen (parent, twins) | parents | Helight Kidzzz x2 | engaged | 2 |
| fc-scroller-ava | Ava (late-night scroller) | scrollers | Helight Sleep | nurtured | 3 |
| fc-gift-helen | Helen (gift for a parent) | gifting | Helight Sleep | converted | 4 |
| fc-whoop-marcus | Marcus (Whoop user) | wearable optimisers | Helight Sleep | engaged | 2 |
| fc-nurse-priya | Priya (ICU nights) | shift workers | Helight Sleep | first_touch | 1 |
| fc-repeat-lena | Lena, second device | repeat | Helight Sleep | converted | 3 |

Touch labels name the real mechanics: which lane's ad, which page visited, which flow email, cart, order and country. Channels used: `ads`, `organic`, `email`, `dm`, `checkout`. Sources: `meta-ads`, `tiktok-ads`, `shopify`, `klaviyo`, `manual`. Days back between 1 and 30, chronological within a journey.

- [ ] **Step 3: Run the funnel tests and the seed test**

Run: `npx vitest run tests/funnel.test.ts tests/seed.test.ts tests/db.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/seed/funnel.ts
git commit -m "feat: fourteen seeded customer journeys across the audience lanes"
```

---

### Task 13: Connections board tools and tool brands

**Files:**
- Rewrite: `lib/seed/tools.ts`
- Modify: `lib/workflow-tool-brands.ts`, `lib/agent-wiki.ts:45-70` (tool blurbs), `lib/finances.ts:55-70`, `tests/finances.test.ts`

**Interfaces:**
- Produces: `tools: Tool[]`; tool ids used by the roster exist here: `claude-code`, `shopify`, `klaviyo`, `meta-ads`, `tiktok-ads`, `google-ads`, `amazon`, `support-inbox`, `reviews`, `attribution`, `retail`, `arcads`, `remotion`, `higgsfield`, `whisper`, `zernio`, `apify`, `gbrain`, `brain-store`, `zeroentropy`, `supabase`, `gmail`, `slack`, `tmux`, `ollama`, `vercel`, `gh`, `broadcast`.

- [ ] **Step 1: Write the tools**

```ts
import type { Tool } from '@/lib/schemas';
const GRAY = { white: '#fafafa', light: '#d4d4d4', mid: '#a3a3a3', dim: '#737373', dark: '#525252' };
export const tools: Tool[] = [
  // Store and channels
  { id: 'shopify', name: 'Shopify', category: 'Store', status: 'available', color: GRAY.white, description: 'Orders, products, customers, Shopify Payments. Needs an Admin API token.' },
  { id: 'amazon', name: 'Amazon Seller Central', category: 'Store', status: 'available', color: GRAY.light, description: 'Listing, reviews, Sponsored Products, settlements. Needs SP-API credentials.' },
  { id: 'retail', name: 'Retail (Ulta, Goop)', category: 'Store', status: 'planned', color: GRAY.dim, description: 'Shelf presence only. No integration claimed; sell-through arrives by report.' },
  // Marketing
  { id: 'meta-ads', name: 'Meta Ads', category: 'Marketing', status: 'available', color: GRAY.white, description: 'Campaigns, insights, ads library, experiments. Needs a Marketing API token.' },
  { id: 'tiktok-ads', name: 'TikTok Ads', category: 'Marketing', status: 'available', color: GRAY.light, description: 'Campaigns, Smart+, Shop, Events API. Needs Marketing API app approval.' },
  { id: 'google-ads', name: 'Google Ads', category: 'Marketing', status: 'available', color: GRAY.mid, description: 'Search, Shopping, Performance Max. Needs a developer token and OAuth.' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Marketing', status: 'available', color: GRAY.light, description: 'Flows, campaigns, SMS, segments, list growth. Needs a private API key.' },
  { id: 'attribution', name: 'Attribution', category: 'Marketing', status: 'planned', color: GRAY.dim, description: 'Slot for the attribution tool of choice. Would feed MER and per-platform CPA.' },
  { id: 'zernio', name: 'Zernio', category: 'Marketing', status: 'connected', color: GRAY.white, description: 'Publishing and audience sync across TikTok, Instagram, YouTube. Node AI\'s publisher.' },
  { id: 'apify', name: 'Apify (TikTok actors)', category: 'Marketing', status: 'available', color: GRAY.mid, description: 'Creator watchlist scraping and transcription. Node AI\'s actors; about $9 a month at this scale.' },
  // Creative, what Node AI brings
  { id: 'arcads', name: 'Arcads', category: 'Creative', status: 'connected', color: GRAY.white, description: 'UGC ad generation for volume testing. Node AI tooling.' },
  { id: 'remotion', name: 'Remotion pipeline', category: 'Creative', status: 'connected', color: GRAY.light, description: 'Short-form editing, captions, crops. Node AI tooling.' },
  { id: 'higgsfield', name: 'Higgsfield', category: 'Creative', status: 'connected', color: GRAY.mid, description: 'AI visuals and product scenes from the brand pack. Node AI tooling.' },
  { id: 'whisper', name: 'Whisper (local)', category: 'Creative', status: 'connected', color: GRAY.dim, description: 'Local transcription. Nothing leaves the machine.' },
  // Customers
  { id: 'support-inbox', name: 'Support inbox', category: 'Customers', status: 'planned', color: GRAY.dim, description: 'Slot for the helpdesk of choice. Would feed triage, drafts and response times.' },
  { id: 'reviews', name: 'Reviews', category: 'Customers', status: 'planned', color: GRAY.dim, description: 'Slot for the reviews app of choice. Would feed Review Monitor and Voice of Customer.' },
  { id: 'gmail', name: 'Email', category: 'Customers', status: 'available', color: GRAY.light, description: 'IMAP inbox for the contact form and escalations. Set INBOX_1_HOST/_USER/_PASS.' },
  { id: 'slack', name: 'Slack', category: 'Customers', status: 'available', color: GRAY.mid, description: 'Team feed and alerts. Needs a bot token with channels:read and channels:history.' },
  // Knowledge
  { id: 'gbrain', name: 'G-Brain', category: 'Knowledge', status: 'connected', color: GRAY.white, description: 'The company brain: evidence base, claims allowlist, brand pack, decisions.' },
  { id: 'brain-store', name: 'brain-store/', category: 'Knowledge', status: 'connected', color: GRAY.light, description: 'Markdown source of truth on disk.' },
  { id: 'zeroentropy', name: 'ZeroEntropy', category: 'Knowledge', status: 'connected', color: GRAY.mid, description: 'Embeddings behind hybrid search.' },
  { id: 'supabase', name: 'Supabase', category: 'Knowledge', status: 'available', color: GRAY.mid, description: 'Managed store behind the brain index.' },
  // Orchestration
  { id: 'claude-code', name: 'Claude Code skills', category: 'Orchestration', status: 'connected', color: GRAY.white, description: 'The claude-ads and marketing skill sets every agent runs on: plan, audit, monitor, optimise, report.' },
  { id: 'broadcast', name: 'Broadcast', category: 'Orchestration', status: 'connected', color: GRAY.light, description: 'Conductor fan-out to every agent.' },
  { id: 'tmux', name: 'tmux', category: 'Orchestration', status: 'connected', color: GRAY.mid, description: 'Session orchestration on the host.' },
  { id: 'ollama', name: 'Ollama', category: 'Orchestration', status: 'connected', color: GRAY.dim, description: 'Local model server for cheap passes.' },
  { id: 'vercel', name: 'Vercel CLI', category: 'Orchestration', status: 'connected', color: GRAY.dim, description: 'Deploy target when the OS leaves the laptop.' },
  { id: 'gh', name: 'GitHub CLI', category: 'Orchestration', status: 'connected', color: GRAY.dark, description: 'Authenticated.' },
];
```

- [ ] **Step 2: Tool brands and blurbs**

`lib/workflow-tool-brands.ts`: replace the map with entries for `shopify`, `klaviyo`, `meta-ads` (slug `meta`), `tiktok-ads` (slug `tiktok`), `google-ads` (slug `googleads`), `amazon`, `zernio`, `arcads`, `remotion`, `gmail`, `slack`, `gbrain`, `apify`, `claude-code` (slug `claude`). Keep the `{ slug, name }` shape. Missing logos fall back to initials in `lib/brand-logos.tsx`; add no colours there.

`lib/agent-wiki.ts` tool blurbs: replace the Attio, Skool, FanBasis, WebinarJam, Trakyo, ManyChat, Wispr, WhatsApp lines with one line each for the new tool ids above (same sentence style: what it is, what the agent reads from it).

`lib/finances.ts` accounts: replace the Stripe and FanBasis accounts with `shopify-payments` ("Shopify Payments"), `amazon-payouts` ("Amazon payouts"), `paypal` ("PayPal via Shopify"). Update `tests/finances.test.ts` ids and the configured expectations to these three; the `configured: false` case uses `amazon-payouts`.

- [ ] **Step 3: Run tests**

Run: `npx vitest run tests/finances.test.ts tests/seed.test.ts tests/knowledge-graph.test.ts tests/agent-wiki.test.ts && npm run typecheck`
Expected: PASS, clean.

- [ ] **Step 4: Commit**

```bash
git add lib/seed/tools.ts lib/workflow-tool-brands.ts lib/agent-wiki.ts lib/finances.ts tests/finances.test.ts
git commit -m "feat: Helight connections board and tool brands"
```

---

### Task 14: Roadmap, phases, brain modules, metrics

**Files:**
- Rewrite: `lib/seed/roadmap.ts`

- [ ] **Step 1: Write the content**

```ts
import type { Domain, Metric, Phase, RoadmapItem } from '@/lib/schemas';
import { DEPT } from '@/lib/roster';
const GRAY = { white: '#fafafa', light: '#d4d4d4', mid: '#a3a3a3', dim: '#737373', dark: '#525252' };

export const roadmap: RoadmapItem[] = [
  { id: 'rm-evidence', title: 'Evidence base curated and the claims allowlist published', quarter: '2026-Q3', status: 'done', departmentId: DEPT.store, description: 'Patents, studies, clinicians, awards, survey with method note.' },
  { id: 'rm-brand-pack', title: 'Brand pack 2.4 with approved product photography', quarter: '2026-Q3', status: 'done', departmentId: DEPT.operations, description: 'Templates and photography the producers draw from.' },
  { id: 'rm-connect-shopify', title: 'Connect Shopify', quarter: '2026-Q3', status: 'now', departmentId: DEPT.store, description: 'Admin API token for orders, products, customers.' },
  { id: 'rm-connect-ads', title: 'Connect Meta, TikTok and Google Ads', quarter: '2026-Q3', status: 'now', departmentId: DEPT.growth, description: 'Marketing API access per platform; TikTok app approval is the lead time.' },
  { id: 'rm-connect-klaviyo', title: 'Connect Klaviyo', quarter: '2026-Q3', status: 'now', departmentId: DEPT.retention, description: 'Private API key; flows and segments read and write.' },
  { id: 'rm-content-engine', title: 'Content engine live at 60 posts a month', quarter: '2026-Q4', status: 'next', departmentId: DEPT.content, description: 'Watchlist, vault, scripts, publishing, kill and promote.' },
  { id: 'rm-21-nights', title: '21 Nights series with six creators', quarter: '2026-Q4', status: 'next', departmentId: DEPT.content, description: 'Day 1, 7, 21, wearable data on screen.' },
  { id: 'rm-paid-loop', title: 'Paid amplification of organic winners', quarter: '2026-Q4', status: 'next', departmentId: DEPT.growth, description: 'Performance Reader to Campaign Launcher, on Yannick\'s spend approval.' },
  { id: 'rm-flows', title: 'Seven Klaviyo flows live', quarter: '2026-Q4', status: 'next', departmentId: DEPT.retention, description: 'Welcome to win-back, 21 Nights Coach in the middle.' },
  { id: 'rm-proof-pages', title: 'Fill the four empty proof pages', quarter: '2026-Q4', status: 'next', departmentId: DEPT.store, description: 'Science, doctor-recommended, compare, better-sleep from the evidence base.' },
  { id: 'rm-ai-answers', title: 'Cited by assistants for sleep questions', quarter: '2027-Q1', status: 'later', departmentId: DEPT.store, description: 'agents.md, llms.txt, schema, weekly citation check.' },
  { id: 'rm-autonomy', title: 'Scheduled runs and failure alerts', quarter: '2027-Q1', status: 'later', departmentId: DEPT.operations, description: 'Every agent on cron, Monday reports without a prompt.' },
  { id: 'rm-handoff', title: 'Handoff to Helight\'s team', quarter: '2027-Q2', status: 'later', departmentId: DEPT.operations, description: 'The board runs in-house; Node AI on retainer for the engine.' },
];

export const phases: Phase[] = [
  { id: 'phase-1', number: 1, title: 'Connect the stack', items: ['Shopify', 'Meta, TikTok, Google', 'Klaviyo', 'Amazon', 'G-Brain'] },
  { id: 'phase-2', number: 2, title: 'Content engine live', items: ['Watchlist and vault', '60 to 90 posts a month', '21 Nights series', 'Compliance gate'] },
  { id: 'phase-3', number: 3, title: 'Amplify and retain', items: ['Winners into paid', 'Seven flows', 'Proof pages', 'Monday briefs'] },
  { id: 'phase-4', number: 4, title: 'Autonomy and handoff', items: ['Scheduled runs', 'Failure alerts', 'In-house operation'] },
];

export const domains: Domain[] = [
  { id: 'brm-1', number: 1, title: 'Command and Memory', color: GRAY.white, items: ['G-Brain', 'brain-store markdown', 'Agent run history', 'Operator console'] },
  { id: 'brm-2', number: 2, title: 'Evidence Base', color: GRAY.light, items: ['Patent family', 'Study chain', 'Clinician positions', 'Claims allowlist'] },
  { id: 'brm-3', number: 3, title: 'Brand Pack', color: GRAY.light, items: ['Brand context', 'Approved photography', 'Templates', 'Versioned releases'] },
  { id: 'brm-4', number: 4, title: 'Ad Accounts', color: GRAY.mid, items: ['Meta', 'TikTok', 'Google', 'Tracking and attribution'] },
  { id: 'brm-5', number: 5, title: 'Content Vault', color: GRAY.mid, items: ['Creator watchlist', 'Hook templates', 'Scripts', 'Publishing log'] },
  { id: 'brm-6', number: 6, title: 'Lifecycle Email', color: GRAY.dim, items: ['Klaviyo flows', 'Segments', '21 Nights Coach', 'SMS'] },
  { id: 'brm-7', number: 7, title: 'Customer Voice', color: GRAY.dim, items: ['Support triage', 'Reviews', 'DMs', 'Weekly synthesis'] },
  { id: 'brm-8', number: 8, title: 'Finance', color: GRAY.dark, items: ['Payouts', 'Ad spend ledger', 'Contribution margin', 'Month close'] },
];

export const metrics: Metric[] = [
  { id: 'metric-sessions', key: 'sessions', label: 'Sessions (7d)', value: 48200, unit: 'sessions', delta: 6.4, period: 'seeded' },
  { id: 'metric-cvr', key: 'conversion_rate', label: 'Conversion rate', value: 2.4, unit: '%', delta: 0.3, period: 'seeded' },
  { id: 'metric-aov', key: 'aov', label: 'Average order', value: 152, unit: 'usd', delta: 4, period: 'seeded' },
  { id: 'metric-mer', key: 'mer', label: 'Blended MER', value: 3.1, unit: 'x', delta: 0.2, period: 'seeded' },
  { id: 'metric-repeat', key: 'repeat_rate', label: 'Repeat rate (90d)', value: 11, unit: '%', delta: 1.2, period: 'seeded' },
  { id: 'metric-refunds', key: 'refund_rate', label: 'Refund rate (60d window)', value: 4.2, unit: '%', delta: -0.6, period: 'seeded' },
];
```

- [ ] **Step 2: Check the pages that read metrics by key**

Run: `grep -rn "unread_total\|brain_pages\|stripe_available\|agent_runs" app components lib | grep -v lib/seed`
For each hit, either keep a metric with that key in the list above (add `{ id: 'metric-runs', key: 'agent_runs', label: 'Agent runs logged', value: 0, unit: 'runs', delta: 0, period: 'all time' }`) or change the reader to a new key. Do not leave a reader pointing at a missing key.

- [ ] **Step 3: Run tests and commit**

Run: `npx vitest run tests/seed.test.ts && npm run typecheck`

```bash
git add lib/seed/roadmap.ts
git commit -m "feat: Helight roadmap, phases, brain modules and pulse metrics"
```

---

### Task 15: Social, comms, workflows, skills, tasks

**Files:**
- Rewrite: `lib/seed/social.ts`, `lib/seed/workflows.ts`
- Modify: `app/social/page.tsx:182`, `components/SocialStatStrip.tsx:214`, `app/analytics/page.tsx:200`, `app/content/page.tsx:115-125`, `components/SparkIcon.tsx:24`, `lib/brain-docs.ts:107`

- [ ] **Step 1: Verify Helight's public handles**

Run: `curl -sL https://helight.com | grep -oE 'https://(www\.)?(instagram|tiktok|youtube|facebook|x|twitter)\.com/[^"'"'"' ]+' | sort -u`
Use the handles found. Any platform not found gets `handle: '', url: null` and is left out of `FOLLOWER_TARGETS`.

- [ ] **Step 2: Write `lib/seed/social.ts`**

Keep `SERIES_END` (set to `'2026-09-12'`), `SERIES_LEN`, `SERIES_DATES`, `ramp`, the snapshot derivations and the email list derivation from the old file. Replace:

- `socialAccounts`: the verified handles, platforms `instagram`, `tiktok`, `youtube` (and `facebook` if found), orders 1 to 4.
- `FOLLOWER_TARGETS`: instagram 18000 to 21500, tiktok 4000 to 9800, youtube 900 to 1400 (facebook 12000 to 12400 if present). Illustrative.
- `DM_TARGETS`: instagram 140 to 260, tiktok 90 to 210.
- `socialDmMessages`: four threads, customers asking (a parent about a 2-year-old, a traveller about the plug and size, a nurse about day sleep, a buyer about the guarantee), inbound and outbound, replies inside the allowlist, no medical promises. Same tuple shape as the old file, dates in the last ten days.
- `socialPosts`: one queued post: `'Night 7 of 21 with a nurse on rotating shifts. Deep sleep on screen, no app, no account. Full series this month.'`, platforms `['tiktok', 'instagram']`.
- Email list baseline: rename the Beehiiv comment to Klaviyo; the series ramps 6200 to 8900 subscribers.

- [ ] **Step 3: Write `lib/seed/workflows.ts`**

Three workflows, each five steps, `ownerKind` `agent` with the agent's display name as `owner`, or `human` with `'Yannick · Operator'`:

| id | name | subtitle | revenueUsd | steps (title, owner, hoursPerWeek, tools, edgeLabel, leakUsd, automation) |
|---|---|---|---|---|
| wf-content-engine | Content engine | Signal to publish to analysis, weekly. | 38000 | Watch the creators (Creator Watcher, 2, apify, "25 outliers", null, live "Watchlist scrape" 900) → Mine hooks and write scripts (Hook Miner, 4, claude-code, "19 scripts", null, live "Vault templates" 1400) → Produce and edit (Video Producer, 6, arcads remotion, "19 cuts", 1200, suggested "Human edit queue" 600) → Approve the week (Yannick · Operator, 1, [], "yes", null, null) → Publish and read (Publisher, 3, zernio, "2 winners", null, live "Kill and promote" 2100) |
| wf-paid-amplification | Paid amplification | Winner to launch to Monday brief. | 52000 | Take the winner (Performance Reader, 1, zernio, "winner", null, live) → Gate the claims (Compliance Auditor, 1, claude-code gbrain, "cleared", null, live "Allowlist gate" 3000) → Approve spend (Yannick · Operator, 0.5, [], "amount", null, null) → Launch per platform (Campaign Launcher, 2, meta-ads tiktok-ads google-ads, "live", null, live) → Pace and report (Budget Auditor, 3, meta-ads tiktok-ads google-ads, "brief", 800, suggested "Daily pacing alerts" 1600) |
| wf-first-to-second | First order to second device | Klaviyo flows from welcome to referral. | 21000 | Capture the email (Segment Builder, 1, klaviyo, "captured", null, live) → Coach 21 nights (21 Nights Coach, 2, klaviyo shopify, "night 21", 1500, live "Day 1, 7, 21 sequence" 2400) → Ask for the review (21 Nights Coach, 0.5, klaviyo, "review", null, live) → Offer the second device (Offer Designer, 1, shopify klaviyo, "bundle", null, suggested "Partner device at day 30" 1800) → Run the referral (Referral Runner, 1, klaviyo, "referred order", null, suggested "Referral reward" 900) |

Write each `automation` as `{ title, state, recoveredUsd }` or `null` as in the table.

Twelve skills, `category` one of `Growth`, `Content`, `Retention`, `Store`, `Care`, `Ops`, each with `ownerAgentId` set to a roster id and `status` `live`, `learning` or `planned`:

```ts
export const skills: Omit<Skill, 'markdown'>[] = [
  { id: 'skill-claims-gate', name: 'Claims gate', category: 'Growth', description: 'Blocks any claim outside the substantiated allowlist before it ships.', ownerAgentId: 'compliance-auditor', status: 'live', tools: ['claude-code', 'gbrain'], order: 0 },
  { id: 'skill-hooks', name: 'Hook writing', category: 'Growth', description: 'Hooks at volume against structures proven in the category.', ownerAgentId: 'ad-copywriter', status: 'live', tools: ['claude-code'], order: 1 },
  { id: 'skill-meta-audit', name: 'Meta account audit', category: 'Growth', description: 'Pixel, CAPI, audiences, fatigue, structure.', ownerAgentId: 'meta-ads-auditor', status: 'live', tools: ['meta-ads'], order: 2 },
  { id: 'skill-pacing', name: 'Budget pacing', category: 'Growth', description: 'Daily pacing and marginal return against the CPA ceiling.', ownerAgentId: 'budget-auditor', status: 'live', tools: ['meta-ads', 'tiktok-ads', 'google-ads'], order: 3 },
  { id: 'skill-teardown', name: 'Video teardown', category: 'Content', description: 'Seven attributes per winning video.', ownerAgentId: 'video-analyst', status: 'learning', tools: ['claude-code'], order: 4 },
  { id: 'skill-vault', name: 'Hook vault', category: 'Content', description: 'Winning hooks turned into slotted templates.', ownerAgentId: 'hook-miner', status: 'live', tools: ['gbrain'], order: 5 },
  { id: 'skill-publish', name: 'Cadence publishing', category: 'Content', description: 'Daily posts across three platforms, never dark.', ownerAgentId: 'publisher', status: 'live', tools: ['zernio'], order: 6 },
  { id: 'skill-21-nights', name: '21 Nights coaching', category: 'Retention', description: 'Day 1, 7, 21 post-purchase sequence.', ownerAgentId: 'twenty-one-nights-coach', status: 'learning', tools: ['klaviyo'], order: 7 },
  { id: 'skill-evidence', name: 'Evidence curation', category: 'Store', description: 'Sourced, dated, checkable claims.', ownerAgentId: 'evidence-curator', status: 'live', tools: ['gbrain'], order: 8 },
  { id: 'skill-ai-answers', name: 'AI answer optimisation', category: 'Store', description: 'agents.md, llms.txt, schema, citation tracking.', ownerAgentId: 'ai-answer-optimizer', status: 'learning', tools: ['claude-code'], order: 9 },
  { id: 'skill-triage', name: 'Inbound triage', category: 'Care', description: 'Skip, info, action, urgent.', ownerAgentId: 'support-triage', status: 'live', tools: ['support-inbox'], order: 10 },
  { id: 'skill-margin', name: 'Contribution margin', category: 'Ops', description: 'Margin per SKU after ads, shipping, refunds.', ownerAgentId: 'contribution-margin', status: 'live', tools: ['shopify'], order: 11 },
];
```

Eleven agent tasks, same shape as the old list. Define `const SEED_TS = '2026-09-12T08:00:00Z';` locally in this file; importing it from `lib/seed.ts` would be circular:

```ts
export const agentTasks: AgentTask[] = [
  { id: 'task-seed-1', agentId: 'ad-copywriter', title: 'Write 8 hooks for the shift-worker lane', status: 'open', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-2', agentId: 'compliance-auditor', title: 'Clear batch 37-C before Thursday launch', status: 'open', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-3', agentId: 'creator-watcher', title: 'Add 4 creators in the menopause lane', status: 'open', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-4', agentId: 'page-writer', title: 'Draft the science page from the evidence base', status: 'open', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-5', agentId: 'publisher', title: 'Schedule this week\'s 21 posts', status: 'doing', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-6', agentId: 'twenty-one-nights-coach', title: 'Localise the day-7 email to French', status: 'doing', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-7', agentId: 'meta-ads-auditor', title: 'Fix the purchase event dedup key', status: 'doing', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-8', agentId: 'ads-reporter', title: 'Send the week 36 brief', status: 'done', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-9', agentId: 'voice-of-customer', title: 'File the week 36 synthesis', status: 'done', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-10', agentId: 'catalog-keeper', title: 'Hide the out-of-stock nightlight from the nav', status: 'done', createdAt: SEED_TS, updatedAt: SEED_TS },
  { id: 'task-seed-11', agentId: 'brand-pack-keeper', title: 'Publish brand pack 2.4.0', status: 'done', createdAt: SEED_TS, updatedAt: SEED_TS },
];
```

- [ ] **Step 4: Visible strings**

- `app/social/page.tsx:182`: `Klaviyo · Helight list`.
- `components/SocialStatStrip.tsx:214`: the email branch reads `'email tracks the Klaviyo list (seeded until the key lands)'`.
- `app/analytics/page.tsx:200`: `source: 'Klaviyo'`.
- `app/content/page.tsx:115-125`: remove the "Vantage Intel" backlink block entirely.
- `components/SparkIcon.tsx:24`: `aria-label="Helight"`.
- `lib/brain-docs.ts:107`: both `'Alex'` literals become `IDENTITY.firstName` (import `IDENTITY` from `@/lib/identity`).

- [ ] **Step 5: Sweep for leftovers**

Run: `grep -rn "Vantage\|Launchpad\|launchpad-cohort\|FanBasis\|Skool\|Beehiiv\|Alex\b\|NODE AI\|founderos.ai" app components lib tests --include=*.ts --include=*.tsx | grep -v "lib/connectors/" | grep -v ":[0-9]*: *\(//\|\*\|/\*\)"`
Expected: no user-visible string remains. Comments may stay. Connector files stay as they are (unwired modules are kept, per the roadmap decision).

- [ ] **Step 6: Full suite, typecheck, commit**

Run: `npm test && npm run typecheck`
Expected: all green.

```bash
git add lib/seed/social.ts lib/seed/workflows.ts app/social/page.tsx components/SocialStatStrip.tsx app/analytics/page.tsx app/content/page.tsx components/SparkIcon.tsx lib/brain-docs.ts
git commit -m "feat: Helight social, workflows, skills and shell strings"
```

---

### Task 16: Build, reseed, walk the pages, push

**Files:**
- None in the repo. Worktree `.env.local` and `data/` only.

- [ ] **Step 1: Build**

Run: `cd ~/code/node-ai/founderos-helight && NEXT_DIST_DIR=.next-prod NEXT_TELEMETRY_DISABLED=1 npm run build`
Expected: build completes, no type errors.

- [ ] **Step 2: Reseed**

```bash
cd ~/code/node-ai/founderos-helight
launchctl bootout gui/$(id -u)/ai.nodeagency.founderos-helight
rm -f data/founder-os.db data/founder-os.db-shm data/founder-os.db-wal
printf '\nFOUNDER_OS_DEMO_SEED=1\n' >> .env.local
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ai.nodeagency.founderos-helight.plist
launchctl kickstart -k gui/$(id -u)/ai.nodeagency.founderos-helight
for i in $(seq 1 40); do [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4102/)" = "307" ] && break; sleep 1; done
TOKEN=$(grep '^FOUNDER_OS_ACCESS_TOKEN=' .env.local | cut -d= -f2); J=$(mktemp)
curl -s -o /dev/null -c $J -H 'content-type: application/json' -d "{\"token\":\"$TOKEN\"}" http://127.0.0.1:4102/api/unlock
curl -s -b $J http://127.0.0.1:4102/api/agents | head -c 200; echo
sqlite3 data/founder-os.db "select count(*) from agents; select count(*) from departments; select count(*) from funnel_contacts;"
sed -i '' '/^FOUNDER_OS_DEMO_SEED=1$/d' .env.local
launchctl kickstart -k gui/$(id -u)/ai.nodeagency.founderos-helight
```

Expected: 75 agents, 7 departments, 14 contacts. Table names: check `lib/db.ts` if `funnel_contacts` differs.

- [ ] **Step 3: Walk every page**

With the cookie jar from Step 2, fetch each and check for a 200 and the absence of "Vantage", "Launchpad", "NODE AI":

```bash
for p in / /agents /org /brain /funnel /social /comms /workflows /roadmap /analytics /integrations /content /finances /reference; do
  code=$(curl -s -b $J -o /tmp/page.html -w '%{http_code}' "http://127.0.0.1:4102$p")
  bad=$(grep -c "Vantage\|Launchpad\|NODE AI OS" /tmp/page.html)
  echo "$p $code leftovers=$bad"
done
```

Expected: every page 200, leftovers 0. Then open `http://127.0.0.1:4102` in the browser, unlock with the token from 1Password, and look at `/org`, `/agents`, `/funnel` and `/integrations` by eye: seven columns, 75 agents, one lane, honest tiles.

- [ ] **Step 4: Push the branch**

```bash
cd ~/code/node-ai/founderos-helight
git push -u origin demo/helight
```

No pull request. Confirm the Alex board still answers: `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4101/` gives 307.

- [ ] **Step 5: Update the memory note**

In `~/.claude/projects/-Users-cristoforoperrone-code-node-ai-founderos/memory/founderos-helight-demo-instance.md`, change the DB line to say the board was reseeded with Helight content on the date of this task and holds 75 agents, 7 pillars, 14 journeys.

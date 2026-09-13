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

const SKILL_STATUS_NOTE: Record<string, string> = {
  live: 'Live in production. The owning agent runs this today.',
  learning: 'In training. Runs with a human in the loop while it calibrates.',
  planned: 'Planned. Scoped and queued, not yet wired.',
};

/** Compose a real-ready SKILL.md doc from a skill's fields (viewed from its card). */
function skillDoc(s: Omit<Skill, 'markdown'>): string {
  const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const toolLine = s.tools.length ? s.tools.map((t) => `\`${t}\``).join(', ') : 'no external tools';
  return `---
name: ${slug}
description: ${s.description}
category: ${s.category}
status: ${s.status}
---

# ${s.name}

${s.description}

## When to use
Reach for this when the ${s.category.toLowerCase()} flow needs to ${s.name.toLowerCase()}. It runs on ${toolLine}.

## Status
${SKILL_STATUS_NOTE[s.status] ?? s.status}
`;
}

// A deterministic xorshift stream seeded from a string (no Math.random), so the
// seeded run history is stable across re-seeds.
function seedRand(str: string): () => number {
  let h = 2166136261 >>> 0;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5; h >>>= 0;
    return (h >>> 0) / 4294967295;
  };
}

// Leads/specialists run on the bigger model, workers on the cheaper one, so the
// cost analysis has real spread. About a third of agents are pure-connector and
// carry no token cost.
const RUN_MODEL_BY_TIER: Record<string, string> = {
  lead: 'claude-sonnet-5',
  specialist: 'claude-sonnet-5',
  worker: 'claude-haiku-4.5',
};

/**
 * Seeded agent-run history so /agents shows live runtimes and estimated spend
 * out of the box (larp-first). Heroes get denser, name-specific run summaries;
 * everyone else gets a shorter run of a generic one. Stable ids (`seed-run-*`)
 * keep re-seeds idempotent and let the operator's own real runs coexist. Real
 * token usage flows in through lib/agents/runtime as agents actually run.
 */
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

export function seedDatabase(db: FounderDb): void {
  // INSERT OR REPLACE in every repo makes re-seeding idempotent by id.
  for (const d of DEPARTMENTS) db.departments.insert(d);
  for (const a of agents) db.agents.insert(a);
  // The roster IS the runtime: rows that left the roster leave the DB too,
  // and departments that left the operating model go with them.
  db.agents.deleteWhereIdNotIn(agents.map((a) => a.id));
  db.departments.deleteWhereIdNotIn(DEPARTMENTS.map((d) => d.id));
  for (const p of PEOPLE) db.people.insert(p);
  db.people.deleteWhereIdNotIn(PEOPLE.map((p) => p.id));
  for (const t of sopTasks) db.sopTasks.insert(t);
  db.sopTasks.deleteWhereIdNotIn(sopTasks.map((t) => t.id));
  for (const w of workflows) db.workflows.insert(w);
  db.workflows.deleteWhereIdNotIn(workflows.map((w) => w.id));
  for (const s of skills) db.skills.insert({ ...s, markdown: skillDoc(s) });
  db.skills.deleteWhereIdNotIn(skills.map((s) => s.id));
  for (const t of agentTasks) db.agentTasks.insert(t); // insert-by-id; user tasks coexist
  // Seeded run history (idempotent by id) so /agents shows runtimes + spend; the
  // operator's own real runs (uuid ids) coexist and add real token cost over time.
  for (const r of seededAgentRuns(agents)) db.agentRuns.insert(r);
  for (const t of tools) db.tools.insert(t);
  for (const r of roadmap) db.roadmap.insert(r);
  for (const m of metrics) db.metrics.insert(m);
  for (const d of domains) db.domains.insert(d);
  for (const p of PERSONAS) db.personas.insert(p);
  for (const p of phases) db.phases.insert(p);
  for (const a of socialAccounts) db.social.upsertAccount(a);
  for (const s of socialBaseline) db.social.insertSnapshot(s);
  for (const d of socialDms) db.social.upsertDm(d);
  for (const s of socialDmSnapshots) db.social.insertDmSnapshot(s);
  for (const m of socialDmMessages) db.social.upsertDmMessage(m);
  // Retired dummy email history leaves the DB on re-seed; the real Beehiiv
  // baseline is authoritative. Live-synced snapshots survive.
  db.emailList.deleteSeeded();
  for (const s of emailListBaseline) db.emailList.insertSnapshot(s);
  for (const p of socialPosts) db.socialPosts.enqueue(p);
  for (const c of funnelContacts) db.funnel.insertContact(c);
  for (const t of funnelTouches) db.funnel.insertTouch(t);
}

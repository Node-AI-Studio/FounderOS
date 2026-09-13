import { afterEach, describe, expect, test } from 'vitest';
import { openDb, type FounderDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

let db: FounderDb;

afterEach(() => {
  db?.close();
});

describe('seedDatabase', () => {
  test('populates every entity', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    expect(db.departments.all().length).toBeGreaterThanOrEqual(5);
    expect(db.agents.all().length).toBeGreaterThanOrEqual(5);
    expect(db.tools.all().length).toBeGreaterThanOrEqual(8);
    expect(db.roadmap.all().length).toBeGreaterThanOrEqual(10);
    expect(db.metrics.all().length).toBeGreaterThanOrEqual(4);
    expect(db.domains.all().length).toBeGreaterThanOrEqual(8);
    expect(db.phases.all().length).toBeGreaterThanOrEqual(3);
    expect(db.workflows.all().length).toBeGreaterThanOrEqual(2);
    expect(db.workflows.all().every((w) => w.steps.length >= 3)).toBe(true);
    expect(db.skills.all().length).toBeGreaterThanOrEqual(8);
    expect(db.agentTasks.all().length).toBeGreaterThanOrEqual(8);
  });

  test('every agent belongs to an existing department', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    const deptIds = new Set(db.departments.all().map((d) => d.id));
    for (const agent of db.agents.all()) {
      expect(deptIds.has(agent.departmentId)).toBe(true);
    }
  });

  test('every seeded agent maps to a real runtime agent — no larp', async () => {
    const { realAgents } = await import('@/lib/agents/real');
    db = openDb(':memory:');
    seedDatabase(db);
    const runtimeIds = new Set(realAgents.map((a) => a.id));
    for (const agent of db.agents.all()) {
      expect(runtimeIds.has(agent.id)).toBe(true);
    }
  });

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

  test('re-seeding removes agents that left the roster', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    db.agents.insert({
      id: 'ghost', departmentId: 'dept-tech', name: 'Ghost', role: 'r', status: 'active',
      tier: 'lead', description: '', model: 'm', tools: [], parentId: null, instance: 'builtin',
    });
    seedDatabase(db);
    expect(db.agents.all().some((a) => a.id === 'ghost')).toBe(false);
  });

  test('is idempotent — seeding twice does not duplicate rows', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    const counts = {
      departments: db.departments.all().length,
      agents: db.agents.all().length,
      tools: db.tools.all().length,
    };
    seedDatabase(db);
    expect(db.departments.all().length).toBe(counts.departments);
    expect(db.agents.all().length).toBe(counts.agents);
    expect(db.tools.all().length).toBe(counts.tools);
  });

  test('email list reflects the real Beehiiv account, not the retired ~30k larp', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    const snaps = db.emailList.snapshots();
    expect(snaps.length).toBeGreaterThan(0);
    // Latest count is the real "Alex's Newsletter" active subscriber count
    // (pulled from Beehiiv 2026-07-07). Bumped deliberately as the list grows.
    expect(db.emailList.latest()?.subscribers).toBe(2141);
    // Honest shape: the list only exists from its 2026-05-28 bulk import — no
    // pre-import history, and nowhere near the old dummy ~30k ramp.
    expect(snaps[0].capturedAt >= '2026-05-28').toBe(true);
    for (const s of snaps) expect(s.subscribers).toBeLessThan(6000);
  });

  test('re-seeding reconciles email history: stale dummy dropped, live snapshots kept', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    // an older DB still holding retired ~30k dummy history + a live Beehiiv snapshot
    db.emailList.insertSnapshot({ capturedAt: '2026-03-14', subscribers: 25800, source: 'seed-dummy' });
    db.emailList.insertSnapshot({ capturedAt: '2026-07-07', subscribers: 4830, source: 'beehiiv' });
    seedDatabase(db);
    const snaps = db.emailList.snapshots();
    // retired dummy history is reconciled away on re-seed...
    expect(snaps.some((s) => s.source === 'seed-dummy')).toBe(false);
    expect(snaps.some((s) => s.subscribers > 6000)).toBe(false);
    // ...but a real live-synced snapshot survives
    expect(snaps.find((s) => s.capturedAt === '2026-07-07')?.source).toBe('beehiiv');
  });

  test('seeded data passes schema validation end to end', () => {
    db = openDb(':memory:');
    seedDatabase(db);
    // openDb repos parse rows through Zod on the way out, so a full read
    // of every table proves the seed data conforms to every schema.
    expect(() => {
      db.departments.all();
      db.agents.all();
      db.tools.all();
      db.roadmap.all();
      db.metrics.all();
      db.domains.all();
      db.phases.all();
    }).not.toThrow();
  });
});

describe('roadmap grouping', () => {
  test('groups roadmap items by quarter in chronological order', async () => {
    const { groupRoadmapByQuarter } = await import('@/lib/roadmap');
    db = openDb(':memory:');
    seedDatabase(db);
    const grouped = groupRoadmapByQuarter(db.roadmap.all());
    const quarters = grouped.map((g) => g.quarter);
    expect(quarters.length).toBeGreaterThanOrEqual(3);
    expect([...quarters].sort()).toEqual(quarters);
    for (const group of grouped) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });
});

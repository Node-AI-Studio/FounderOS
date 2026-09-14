import { describe, expect, test } from 'vitest';
import { workflows } from '@/lib/seed/workflows';
import { DEPARTMENTS, ROSTER } from '@/lib/roster';

// The workflows page maps one machine per pillar. Every agent-owned step must
// name an agent that exists on the org board, so the two pages never disagree.
describe('seeded workflows', () => {
  test('one workflow per pillar', () => {
    expect(workflows.length).toBe(DEPARTMENTS.length);
  });

  test('ids and orders are unique', () => {
    expect(new Set(workflows.map((w) => w.id)).size).toBe(workflows.length);
    expect(new Set(workflows.map((w) => w.order)).size).toBe(workflows.length);
    const stepIds = workflows.flatMap((w) => w.steps.map((s) => s.id));
    expect(new Set(stepIds).size).toBe(stepIds.length);
  });

  test('every agent-owned step names a roster agent', () => {
    const names = new Set(ROSTER.map((e) => e.name));
    for (const w of workflows) {
      for (const s of w.steps) {
        if (s.ownerKind === 'agent') {
          expect(names.has(s.owner), `${w.id}/${s.id}: '${s.owner}' is not on the roster`).toBe(true);
        }
      }
    }
  });

  test('every workflow has at least four steps', () => {
    for (const w of workflows) expect(w.steps.length).toBeGreaterThanOrEqual(4);
  });
});

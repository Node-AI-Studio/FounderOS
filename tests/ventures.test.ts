import { describe, expect, test } from 'vitest';
import { LIFE_AREAS } from '@/lib/life-map';
import { VENTURES, ventureAgentSet, venturesForAgent, getVenture, ventureAreaAgents } from '@/lib/ventures';
import { realAgents } from '@/lib/agents/real';
import { ROSTER } from '@/lib/roster';

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
  test('every areaAgents id across every venture equals the ROSTER, exactly', () => {
    const rosterIds = new Set(ROSTER.map((e) => e.id));
    const areaAgentIds = new Set(VENTURES.flatMap((v) => Object.values(v.areaAgents).flat()));
    expect(areaAgentIds).toEqual(rosterIds);
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

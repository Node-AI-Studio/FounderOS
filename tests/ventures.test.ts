import { describe, expect, test } from 'vitest';
import { LIFE_AREAS } from '@/lib/life-map';
import {
  VENTURES,
  ventureAgentSet,
  venturesForAgent,
  getVenture,
} from '@/lib/ventures';

import { realAgents } from '@/lib/agents/real';

const KNOWN_AGENTS = new Set(realAgents.map((a) => a.id));

describe('VENTURES', () => {
  test("Node AI's three lines of business, each with a distinct color and brain tag", () => {
    expect(VENTURES.map((v) => v.id)).toEqual(['agency', 'clientos', 'leadgenos']);
    expect(VENTURES.map((v) => v.label)).toEqual(['Agency', 'ClientOS', 'LeadGenOS']);
    expect(new Set(VENTURES.map((v) => v.color)).size).toBe(3);
    expect(new Set(VENTURES.map((v) => v.brainTag)).size).toBe(3);
    for (const v of VENTURES) {
      expect(v.focus.length).toBeGreaterThan(0); // executive task list
      expect(v.detail.length).toBeGreaterThan(0);
    }
  });

  test('venture colors do not collide with life-area colors', () => {
    const areaColors = new Set(LIFE_AREAS.map((a) => a.color));
    for (const v of VENTURES) expect(areaColors.has(v.color)).toBe(false);
  });

  test('every areaAgents key is a real life area; every agent id is real', () => {
    const areaIds = new Set(LIFE_AREAS.map((a) => a.id));
    for (const v of VENTURES) {
      for (const [areaId, agents] of Object.entries(v.areaAgents)) {
        expect(areaIds.has(areaId), `unknown area ${areaId} in ${v.id}`).toBe(true);
        for (const id of agents) {
          expect(KNOWN_AGENTS.has(id), `unknown agent ${id} in ${v.id}/${areaId}`).toBe(true);
        }
      }
    }
  });

  test('every venture staffs marketing, communication, and finances at minimum', () => {
    for (const v of VENTURES) {
      for (const required of ['marketing', 'communication', 'finances']) {
        expect(
          (v.areaAgents[required] ?? []).length,
          `${v.id} has no agents on ${required}`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe('lookups', () => {
  test('getVenture resolves by id and returns null for unknowns', () => {
    expect(getVenture('agency')?.label).toBe('Agency');
    expect(getVenture('nope')).toBeNull();
  });

  test('ventureAgentSet unions all areas for a venture', () => {
    const set = ventureAgentSet('agency');
    const agency = getVenture('agency')!;
    for (const agents of Object.values(agency.areaAgents)) {
      for (const id of agents) expect(set.has(id)).toBe(true);
    }
  });

  test('venturesForAgent reverse lookup: shared infra agents serve all three', () => {
    expect(venturesForAgent('conductor').map((v) => v.id)).toEqual(['agency', 'clientos', 'leadgenos']);
  });

  test('whatsapp-worker serves the agency (client teams live on WhatsApp)', () => {
    expect(venturesForAgent('whatsapp-worker').some((v) => v.id === 'agency')).toBe(true);
  });
});

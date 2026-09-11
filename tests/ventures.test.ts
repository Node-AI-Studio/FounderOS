import { describe, expect, test } from 'vitest';
import { VENTURES, ventureAgentSet, venturesForAgent, getVenture, ventureAreaAgents } from '@/lib/ventures';
import { FunnelVentureSchema } from '@/lib/schemas';

/**
 * The venture registry is empty on purpose (2026-09-11): Node AI's lines of
 * business are added in a second moment. Until then every lookup is honest
 * empty and the funnel schema carries one placeholder value.
 */
describe('VENTURES (empty registry)', () => {
  test('no ventures are registered yet', () => {
    expect(VENTURES).toEqual([]);
  });

  test('the funnel schema has only the placeholder value', () => {
    expect(FunnelVentureSchema.options).toEqual(['unassigned']);
  });

  test('lookups return empty or null, never a stale venture', () => {
    expect(getVenture('unassigned')).toBeNull();
    expect(getVenture('vantage')).toBeNull();
    expect(ventureAgentSet('unassigned').size).toBe(0);
    expect(venturesForAgent('conductor')).toEqual([]);
    expect(ventureAreaAgents('unassigned', 'sales')).toEqual([]);
  });
});

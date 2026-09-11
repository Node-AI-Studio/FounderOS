/**
 * The venture lens over the OS: one saved filter per line of business.
 *
 * One database, one G-Brain, one agent roster: ventures never partition the
 * data. They are saved filters — each one names the agents that serve it per
 * life area, the brain tag that marks its pages, and the current executive
 * focus. Switching venture in the hierarchy or life map swaps which crew
 * lights up; the agents themselves keep full visibility of everything.
 */
import type { LifeArea } from '@/lib/life-map';
import { LIFE_AREAS } from '@/lib/life-map';

export type Venture = {
  id: string;
  label: string;
  kind: string;
  color: string;
  detail: string;
  /** Tag that marks this venture's pages inside the single shared G-Brain. */
  brainTag: string;
  /** Current executive priorities, edit freely, this is the operator's list. */
  focus: string[];
  /** life-area id → the agents working that area FOR this venture. */
  areaAgents: Record<string, string[]>;
};

/**
 * Empty on purpose (2026-09-11): Node AI's lines of business are added in a
 * second moment. While this is empty the funnel tabs, the org switcher, the
 * brain-dump venture tags and the graph team lenses hide themselves. To add a
 * line of business: one entry here, its id in FunnelVentureSchema, and a rule
 * in classifyVenture (lib/funnel-live.ts).
 */
export const VENTURES: Venture[] = [];

export function getVenture(id: string): Venture | null {
  return VENTURES.find((v) => v.id === id) ?? null;
}

/** Every agent serving a venture, across all its life areas. */
export function ventureAgentSet(ventureId: string): Set<string> {
  const v = getVenture(ventureId);
  return new Set(v ? Object.values(v.areaAgents).flat() : []);
}

/** Which ventures an agent works for (shared infra agents serve all). */
export function venturesForAgent(agentId: string): Venture[] {
  return VENTURES.filter((v) => ventureAgentSet(v.id).has(agentId));
}

/** Agents on one life area for one venture (the click-through the operator described). */
export function ventureAreaAgents(ventureId: string, areaId: string): string[] {
  return getVenture(ventureId)?.areaAgents[areaId] ?? [];
}

export function lifeAreaById(areaId: string): LifeArea | null {
  return LIFE_AREAS.find((a) => a.id === areaId) ?? null;
}

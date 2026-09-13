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

/**
 * Department id constants for the seven Helight pillars. Defined here (not
 * in ./index) so pillar-roster files added in Tasks 2-8 can import DEPT
 * without pulling in ./index and its (eventually large) ROSTER array, which
 * would be a circular import once index re-exports the pillar arrays.
 */
export const DEPT = {
  growth: 'dept-marketing-growth',
  content: 'dept-content',
  retention: 'dept-clients',
  store: 'dept-sales',
  care: 'dept-comms',
  finance: 'dept-finance',
  operations: 'dept-tech',
} as const;

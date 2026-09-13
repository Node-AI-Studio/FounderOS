import type { Agent } from '@/lib/schemas';

/**
 * The content-creation crew: the Content pillar, where the lead
 * (`content-planner`) and the organic/creator workers live. The lead comes
 * first, then the workers alphabetically.
 */
export const CONTENT_DEPT_ID = 'dept-content';

export function contentAgents(agents: Agent[]): Agent[] {
  const isLead = (a: Agent) => (a.tier === 'lead' || a.parentId === null ? 0 : 1);
  return agents
    .filter((a) => a.departmentId === CONTENT_DEPT_ID)
    .sort((a, b) => isLead(a) - isLead(b) || a.name.localeCompare(b.name));
}

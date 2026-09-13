/**
 * Lenses over the operating knowledge graph: slice the same node set three
 * ways, by ENTITY TYPE, by BUSINESS FUNCTION (core vs enabling, plus the
 * Growth and Content pillar teams), and by ACTION (what a thing is actually
 * used for). Picking a lens lights the matching nodes and dims the rest.
 * Pure data + matchers; the component supplies the node list and a
 * department resolver.
 */

export type LensGroup = 'entity' | 'function' | 'action';

export type Lens = { id: string; group: LensGroup; label: string };

export type LensNode = { id: string; kind: string };

export type LensContext = {
  nodes: LensNode[];
  /** resolves any node to its pillar's team node id (`team:dept-…`), or null */
  teamOf: (nodeId: string) => string | null;
};

export const ENTITY_LENSES: Lens[] = [
  { id: 'ent-people', group: 'entity', label: 'All people' },
  { id: 'ent-subagents', group: 'entity', label: 'Sub-agents' },
  { id: 'ent-tools', group: 'entity', label: 'Tools' },
  { id: 'ent-workflows', group: 'entity', label: 'Workflows' },
  { id: 'ent-sops', group: 'entity', label: 'SOPs' },
  { id: 'ent-projects', group: 'entity', label: 'Projects' },
  { id: 'ent-teams', group: 'entity', label: 'Teams' },
  { id: 'ent-departments', group: 'entity', label: 'Departments' },
];

export const FUNCTION_LENSES: Lens[] = [
  { id: 'fn-core', group: 'function', label: 'Core' },
  { id: 'fn-enabling', group: 'function', label: 'Enabling' },
  { id: 'fn-growth-team', group: 'function', label: 'Growth team' },
  { id: 'fn-content-team', group: 'function', label: 'Content team' },
];

export const ACTION_LENSES: Lens[] = [
  { id: 'act-ad-creation', group: 'action', label: 'Ad creation' },
  { id: 'act-lead-generation', group: 'action', label: 'Acquisition' },
  { id: 'act-content-repurposing', group: 'action', label: 'Content repurposing' },
  { id: 'act-content-ideation', group: 'action', label: 'Content ideation' },
  { id: 'act-content-scripts', group: 'action', label: 'Content script creation' },
  { id: 'act-social-sentiment', group: 'action', label: 'Customer voice' },
  { id: 'act-social-scheduler', group: 'action', label: 'Social posting & scheduler' },
  { id: 'act-ai-visuals', group: 'action', label: 'AI-generated visual assets' },
  { id: 'act-competitor-intel', group: 'action', label: 'Competitor ad intelligence' },
  { id: 'act-icp-simulation', group: 'action', label: 'Audience lanes' },
  { id: 'act-channel-budget', group: 'action', label: 'Channel & budget allocation' },
];

export const ALL_LENSES: Lens[] = [...ENTITY_LENSES, ...FUNCTION_LENSES, ...ACTION_LENSES];

/** Revenue-driving pillars vs the ones that keep the machine running.
 * Content is core too: it finds the winners the rest of the machine funds
 * and fulfils. */
const CORE_DEPTS = new Set([
  'team:dept-sales',
  'team:dept-marketing-growth',
  'team:dept-clients',
  'team:dept-content',
]);
const ENABLING_DEPTS = new Set(['team:dept-tech', 'team:dept-finance', 'team:dept-comms']);

/** Growth and Content pillar rosters: seeded agent ids (graph nodes are `emp:<id>`). */
const VENTURE_TEAMS: Record<string, string[]> = {
  'fn-growth-team': ['growth-planner', 'competitor-researcher', 'creative-strategist', 'ad-copywriter', 'visual-designer', 'format-checker', 'compliance-auditor', 'translator', 'campaign-launcher', 'meta-ads-auditor', 'tiktok-ads-auditor', 'google-ads-auditor', 'budget-auditor', 'experiment-designer', 'tracking-auditor', 'landing-page-auditor', 'ads-reporter'],
  'fn-content-team': ['content-planner', 'creator-watcher', 'video-analyst', 'comment-reader', 'hook-miner', 'script-writer', 'video-producer', 'edit-assistant', 'publisher', 'creator-recruiter', 'creator-briefer', 'twenty-one-nights-producer', 'performance-reader'],
};

/** What each action actually runs on — seeded agent ids, honest best-fit. */
const ACTION_AGENTS: Record<string, string[]> = {
  'act-ad-creation': ['ad-copywriter', 'visual-designer', 'creative-strategist'],
  'act-lead-generation': ['growth-planner', 'campaign-launcher', 'creator-recruiter', 'dm-responder'],
  'act-content-repurposing': ['edit-assistant', 'video-producer', 'publisher'],
  'act-content-ideation': ['hook-miner', 'content-planner', 'comment-reader'],
  'act-content-scripts': ['script-writer', 'creator-briefer'],
  'act-social-sentiment': ['comment-reader', 'video-analyst', 'review-monitor'],
  'act-social-scheduler': ['publisher', 'scheduler'],
  'act-ai-visuals': ['visual-designer', 'edit-assistant'],
  'act-competitor-intel': ['competitor-researcher', 'creator-watcher'],
  'act-icp-simulation': ['growth-planner', 'segment-builder'],
  'act-channel-budget': ['growth-planner', 'budget-auditor', 'ad-spend-ledger'],
};

const idSet = (ids: string[]) => new Set(ids.map((id) => `emp:${id}`));

/**
 * The node ids a lens lights. Unknown lens → empty set. Workflows and
 * projects are not modeled as graph entities yet — their lenses honestly
 * return empty until those tables exist (larp-first, real-ready).
 */
export function lensNodeSet(lensId: string, ctx: LensContext): Set<string> {
  const out = new Set<string>();
  const byKind = (kind: string) => {
    for (const n of ctx.nodes) if (n.kind === kind) out.add(n.id);
  };
  switch (lensId) {
    case 'ent-people':
      byKind('person');
      break;
    case 'ent-subagents':
      byKind('employee');
      break;
    case 'ent-tools':
      byKind('tool');
      break;
    case 'ent-sops':
      byKind('task');
      break;
    case 'ent-departments':
      byKind('team');
      break;
    case 'ent-teams': {
      const members = idSet([...VENTURE_TEAMS['fn-growth-team'], ...VENTURE_TEAMS['fn-content-team']]);
      for (const n of ctx.nodes) if (members.has(n.id)) out.add(n.id);
      break;
    }
    case 'ent-workflows':
    case 'ent-projects':
      break; // not modeled yet — honest empty
    case 'fn-core':
    case 'fn-enabling': {
      const depts = lensId === 'fn-core' ? CORE_DEPTS : ENABLING_DEPTS;
      for (const n of ctx.nodes) {
        const team = n.kind === 'team' ? n.id : ctx.teamOf(n.id);
        if (team && depts.has(team)) out.add(n.id);
      }
      break;
    }
    case 'fn-growth-team':
    case 'fn-content-team': {
      const members = idSet(VENTURE_TEAMS[lensId]);
      for (const n of ctx.nodes) if (members.has(n.id)) out.add(n.id);
      break;
    }
    default: {
      const agents = ACTION_AGENTS[lensId];
      if (!agents) break;
      const members = idSet(agents);
      for (const n of ctx.nodes) if (members.has(n.id)) out.add(n.id);
    }
  }
  return out;
}

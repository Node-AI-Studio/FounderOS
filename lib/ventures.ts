/**
 * Node AI's three lines of business, the venture lens over the OS.
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

const SHARED_OPS = ['conductor', 'stack-monitor'];
const SHARED_KNOWLEDGE = ['data-agent', 'markdown-auditor', 'vector-auditor'];

export const VENTURES: Venture[] = [
  {
    id: 'agency',
    label: 'Agency',
    kind: 'AI software agency',
    color: '#00ffaa',
    detail: 'Client builds and retainers, delivered by Node AI.',
    brainTag: 'agency',
    focus: [
      'Active client builds shipped on schedule',
      'Pipeline: proposals out, deals advanced in Attio',
      'Every handoff documented in the brain',
    ],
    areaAgents: {
      marketing: ['social-agent', 'zernio-publisher', 'remotion-editor', 'higgsfield-creative'],
      sales: ['vantage-sales', 'vantage-fanbasis', 'sales-agent', 'sales-calls-data'],
      communication: ['comms-agent', 'gmail-worker', 'slack-worker', 'whatsapp-worker', 'crm-pulse'],
      finances: ['payments-pulse', 'stripe-sales', 'processor-confirmation'],
      knowledge: [...SHARED_KNOWLEDGE, 'notion-sync'],
      operations: SHARED_OPS,
    },
  },
  {
    id: 'clientos',
    label: 'ClientOS',
    kind: 'Product',
    color: '#d9263f',
    detail: 'The client portal: discovery, proposals, signing, onboarding.',
    brainTag: 'clientos',
    focus: [
      'Proposals signed through the portal',
      'Onboarding completed without manual steps',
      'Portal uptime and support response',
    ],
    areaAgents: {
      marketing: ['social-agent', 'zernio-publisher', 'remotion-editor'],
      sales: ['launchpad-cohort-sales', 'sales-agent', 'sales-calls-data'],
      communication: ['gmail-worker', 'comms-agent', 'crm-pulse'],
      finances: ['payments-pulse', 'stripe-sales', 'processor-confirmation'],
      knowledge: SHARED_KNOWLEDGE,
      operations: SHARED_OPS,
    },
  },
  {
    id: 'leadgenos',
    label: 'LeadGenOS',
    kind: 'Product',
    color: '#a3e635',
    detail: 'Lead scraping, enrichment and outbound campaigns for clients.',
    brainTag: 'leadgenos',
    focus: [
      'Tenant campaigns sending on schedule',
      'Enrichment cost per lead within budget',
      'Replies routed to the client CRM',
    ],
    areaAgents: {
      marketing: ['social-agent', 'zernio-publisher'],
      sales: ['sales-agent', 'crm-pulse'],
      communication: ['gmail-worker', 'crm-pulse', 'comms-agent'],
      finances: ['payments-pulse', 'stripe-sales'],
      knowledge: SHARED_KNOWLEDGE,
      operations: SHARED_OPS,
    },
  },
];

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

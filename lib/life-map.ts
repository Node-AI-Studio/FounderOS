import { IDENTITY } from '@/lib/identity';
/**
 * Alex's life map: the radial taxonomy at the heart of the OS.
 * Center = Alex's life; ring 1 = color-coded life areas; ring 2 = the
 * modules inside each area. Communication additionally carries the contact
 * tier system — the numbered/colored response-priority ladder for people.
 *
 * This is the one place colors enter the otherwise black & white OS:
 * each life area owns a hue, and everything underneath inherits it.
 */
import type { LifeMap, LifeMapNode } from '@/lib/schemas';

export type LifeModule = { id: string; label: string; detail: string };

export type LifeArea = {
  id: string;
  label: string;
  color: string;
  detail: string;
  modules: LifeModule[];
  agents: string[]; // RuntimeAgent ids working this area
  brainFolders: string[]; // brain-store folders feeding this area
  departmentIds: string[]; // seeded departments that roll up to this area
};

export const LIFE_AREAS: LifeArea[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    color: '#f59e0b',
    detail: 'Everything that earns attention.',
    modules: [
      { id: 'content', label: 'Content', detail: 'Organic posts and creator content across IG/TikTok/YT.' },
      { id: 'paid', label: 'Paid', detail: 'Meta, TikTok, and Google ad accounts.' },
      { id: 'email', label: 'Email', detail: 'Klaviyo campaigns and sequences.' },
      { id: 'sms', label: 'SMS', detail: 'Text blasts and reminders.' },
      { id: 'creators', label: 'Creators', detail: 'UGC sourcing and creator briefs.' },
    ],
    agents: ['growth-planner', 'ad-copywriter', 'meta-ads-auditor', 'budget-auditor', 'content-planner', 'publisher', 'hook-miner', 'performance-reader'],
    brainFolders: ['media', 'writing', 'ideas'],
    departmentIds: ['dept-marketing-growth', 'dept-content'],
  },
  {
    id: 'sales',
    label: 'Store',
    color: '#ef4444',
    detail: 'The Shopify storefront and its proof.',
    modules: [
      { id: 'storefront', label: 'Storefront', detail: 'Product and collection pages.' },
      { id: 'catalog', label: 'Catalog', detail: 'SKUs, variants, and listings.' },
      { id: 'proof', label: 'Proof', detail: 'Reviews, UGC, and social proof on-page.' },
      { id: 'amazon', label: 'Amazon', detail: 'Seller Central listings and health.' },
    ],
    agents: ['store-auditor', 'product-page-optimizer', 'ai-answer-optimizer', 'evidence-curator', 'catalog-keeper'],
    brainFolders: ['people', 'companies', 'hiring'],
    departmentIds: ['dept-sales'],
  },
  {
    id: 'finances',
    label: 'Finances',
    color: '#22c55e',
    detail: 'Money in, ad money out, margin per SKU.',
    modules: [
      { id: 'payouts', label: 'Payouts', detail: 'Shopify and Amazon payout ledgers.' },
      { id: 'ad-spend', label: 'Ad spend', detail: 'What went out across every ad account.' },
      { id: 'margin', label: 'Margin', detail: 'Contribution margin per SKU.' },
      { id: 'close', label: 'Close', detail: 'The monthly close checklist.' },
    ],
    agents: ['payments-pulse', 'ad-spend-ledger', 'contribution-margin', 'month-close'],
    brainFolders: ['companies'],
    departmentIds: ['dept-finance'],
  },
  {
    id: 'communication',
    label: 'Customer Care',
    color: '#3b82f6',
    detail: 'Every inbound customer voice.',
    modules: [
      { id: 'support', label: 'Support', detail: 'Tagged tickets with response tiers, who needs an answer ASAP.' },
      { id: 'dms', label: 'DMs', detail: 'Instagram and TikTok direct messages.' },
      { id: 'reviews', label: 'Reviews', detail: 'Storefront and Amazon review replies.' },
      { id: 'escalations', label: 'Escalations', detail: 'Refunds and cases that need a human call.' },
    ],
    agents: ['support-triage', 'reply-drafter', 'dm-responder', 'refund-handler', 'voice-of-customer'],
    brainFolders: ['inbox', 'meetings', 'people'],
    departmentIds: ['dept-comms'],
  },
  {
    id: 'clients',
    label: 'Retention',
    color: '#14b8a6',
    detail: 'Klaviyo and everything after the first order.',
    modules: [
      { id: 'flows', label: 'Flows', detail: 'Klaviyo lifecycle automations.' },
      { id: 'segments', label: 'Segments', detail: 'Who gets which message, and when.' },
      { id: 'offers', label: 'Offers', detail: 'Discounts, bundles, and subscription offers.' },
      { id: 'win-back', label: 'Win-back', detail: 'Lapsed-customer recovery sends.' },
    ],
    agents: ['lifecycle-planner', 'twenty-one-nights-coach', 'offer-designer', 'win-back-writer'],
    brainFolders: ['people', 'companies'],
    departmentIds: ['dept-clients'],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    color: '#a855f7',
    detail: 'G-Brain: markdown, vectors, and recall.',
    modules: [
      { id: 'brain-store', label: 'Brain store', detail: 'Markdown source of truth on disk.' },
      { id: 'vector-db', label: 'Vector DB', detail: 'Chunks → embeddings → pgvector.' },
      { id: 'prompts', label: 'Prompts', detail: 'Reusable prompt library.' },
      { id: 'sources', label: 'Sources', detail: 'Reference material and citations.' },
    ],
    agents: ['knowledge-agent', 'brand-pack-keeper', 'brain-auditor', 'data-agent'],
    brainFolders: ['concepts', 'prompts', 'sources', 'archive'],
    departmentIds: ['dept-tech'],
  },
  {
    id: 'operations',
    label: 'Operations',
    color: '#fafafa',
    detail: 'The machine that runs the machine.',
    modules: [
      { id: 'agents', label: 'Agents', detail: 'The roster and its hierarchy.' },
      { id: 'automations', label: 'Automations', detail: 'Scheduled and self-healing jobs.' },
      { id: 'infra', label: 'Infra', detail: 'Local stack, ports, dedicated host target.' },
      { id: 'hiring', label: 'Hiring', detail: 'Candidates and roles.' },
    ],
    // dept-tech rolls up to knowledge first (lifeAreaForDepartment takes the
    // first match); operations still owns the conductor + stack agents.
    agents: ['conductor', 'connector-monitor', 'scheduler'],
    brainFolders: ['org', 'projects', 'hiring'],
    departmentIds: ['dept-tech'],
  },
];

export type ContactTier = {
  tier: number;
  label: string;
  color: string;
  respond: string;
  tags: string[];
};

/**
 * The DTC support ladder: response priority for people who reach Helight.
 * 1 = red (refund and guarantee asks), 2 = yellow (order, shipping, creator
 * outreach), 3 = green (general, press, community). Specific people get
 * overrides via the contact_tags table.
 */
export const CONTACT_TIERS: ContactTier[] = [
  { tier: 1, label: 'Priority 1', color: '#ef4444', respond: 'ASAP', tags: ['refund', 'guarantee'] },
  { tier: 2, label: 'Priority 2', color: '#eab308', respond: 'same day', tags: ['order', 'shipping', 'creator'] },
  { tier: 3, label: 'Priority 3', color: '#22c55e', respond: 'when free', tags: ['general', 'press', 'community'] },
];

export function lifeAreaForDepartment(departmentId: string): LifeArea | null {
  return LIFE_AREAS.find((a) => a.departmentIds.includes(departmentId)) ?? null;
}

export function buildLifeMap(): LifeMap {
  const nodes: LifeMapNode[] = [
    {
      id: 'center',
      type: 'center',
      label: `${IDENTITY.firstName}'s Life`,
      color: '#fafafa',
      parent: null,
      detail: 'The core. Everything orbits this.',
      agents: [],
      brainFolders: [],
    },
  ];
  const edges: LifeMap['edges'] = [];

  for (const area of LIFE_AREAS) {
    nodes.push({
      id: area.id,
      type: 'area',
      label: area.label,
      color: area.color,
      parent: 'center',
      detail: area.detail,
      agents: area.agents,
      brainFolders: area.brainFolders,
    });
    edges.push({ source: 'center', target: area.id });

    for (const mod of area.modules) {
      const id = `${area.id}/${mod.id}`;
      nodes.push({
        id,
        type: 'module',
        label: mod.label,
        color: area.color,
        parent: area.id,
        detail: mod.detail,
        agents: [],
        brainFolders: [],
      });
      edges.push({ source: area.id, target: id });
    }
  }

  // the contact priority ladder hangs off client management
  for (const t of CONTACT_TIERS) {
    const id = `tier-${t.tier}`;
    nodes.push({
      id,
      type: 'tier',
      label: `T${t.tier} ${t.label}`,
      color: t.color,
      parent: 'communication/support',
      detail: `${t.tags.join(', ')}, respond ${t.respond}`,
      agents: [],
      brainFolders: [],
    });
    edges.push({ source: 'communication/support', target: id });
  }

  return { nodes, edges };
}

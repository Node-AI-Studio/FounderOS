/**
 * Helight: one lane, one venture. The venture lens over the OS.
 *
 * One database, one G-Brain, one agent roster: the venture never partitions
 * the data. It names the agents that serve it per life area, the brain tag
 * that marks its pages, and the current executive focus. The shape stays a
 * list (`VENTURES: Venture[]`) even with a single entry, so every consumer
 * that iterates ventures keeps working unchanged.
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
  /** Current executive priorities. Edit freely, this is the operator's list. */
  focus: string[];
  /** life-area id → the agents working that area FOR this venture. */
  areaAgents: Record<string, string[]>;
};

export const VENTURES: Venture[] = [
  {
    id: 'helight',
    label: 'helight.com',
    kind: 'DTC store',
    color: '#fafafa',
    detail: 'The Shopify store: Helight Sleep, Kidzzz, Nightlight. Every lane serves it.',
    brainTag: 'helight',
    focus: [
      'Content finds winners, Growth funds them, Retention keeps the buyer',
      'Every claim inside the allowlist before it ships',
      'Contribution margin per SKU decides what scales',
    ],
    areaAgents: {
      marketing: ['growth-planner', 'competitor-researcher', 'creative-strategist', 'ad-copywriter', 'visual-designer', 'format-checker', 'compliance-auditor', 'translator', 'campaign-launcher', 'meta-ads-auditor', 'tiktok-ads-auditor', 'google-ads-auditor', 'budget-auditor', 'experiment-designer', 'tracking-auditor', 'landing-page-auditor', 'ads-reporter', 'content-planner', 'creator-watcher', 'video-analyst', 'comment-reader', 'hook-miner', 'script-writer', 'video-producer', 'edit-assistant', 'publisher', 'creator-recruiter', 'creator-briefer', 'twenty-one-nights-producer', 'performance-reader'],
      sales: ['store-auditor', 'seo-auditor', 'evidence-curator', 'page-writer', 'ai-answer-optimizer', 'product-page-optimizer', 'storefront-tester', 'blog-writer', 'catalog-keeper', 'promo-planner', 'amazon-listing-auditor', 'store-reporter'],
      clients: ['lifecycle-planner', 'segment-builder', 'email-writer', 'sms-writer', 'campaign-composer', 'twenty-one-nights-coach', 'offer-designer', 'referral-runner', 'win-back-writer', 'flow-auditor', 'retention-reporter'],
      communication: ['support-triage', 'reply-drafter', 'dm-responder', 'refund-handler', 'shipping-tracker', 'faq-keeper', 'escalation-manager', 'review-monitor', 'voice-of-customer', 'team-feed', 'care-reporter'],
      finances: ['payments-pulse', 'ad-spend-ledger', 'contribution-margin', 'month-close'],
      knowledge: ['knowledge-agent', 'brand-pack-keeper', 'brain-auditor', 'data-agent'],
      operations: ['conductor', 'connector-monitor', 'scheduler'],
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

/** Agents on one life area for one venture (the click-through demo view). */
export function ventureAreaAgents(ventureId: string, areaId: string): string[] {
  return getVenture(ventureId)?.areaAgents[areaId] ?? [];
}

export function lifeAreaById(areaId: string): LifeArea | null {
  return LIFE_AREAS.find((a) => a.id === areaId) ?? null;
}

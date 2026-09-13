import type { Department, Person } from '@/lib/schemas';
import type { RosterEntry } from './types';
import { GROWTH } from './growth';
import { CONTENT } from './content';
import { RETENTION } from './retention';

export { DEPT } from './types';
export { toAgent } from './types';
export type { RosterEntry } from './types';
import { DEPT } from './types';

const GRAY = { white: '#fafafa', light: '#d4d4d4', mid: '#a3a3a3', dim: '#737373', dark: '#525252' };

export const DEPARTMENTS: Department[] = [
  { id: DEPT.growth, name: 'Growth', slug: 'growth', tagline: 'Paid: Meta, TikTok, Google.', color: GRAY.white, order: 1 },
  { id: DEPT.content, name: 'Content', slug: 'content', tagline: 'Organic and creators. Finds the winners.', color: GRAY.light, order: 2 },
  { id: DEPT.retention, name: 'Retention', slug: 'retention', tagline: 'Klaviyo and everything after the first order.', color: GRAY.light, order: 3 },
  { id: DEPT.store, name: 'Store', slug: 'store', tagline: 'The Shopify storefront and its proof.', color: GRAY.mid, order: 4 },
  { id: DEPT.care, name: 'Customer Care', slug: 'customer-care', tagline: 'Every inbound customer voice.', color: GRAY.mid, order: 5 },
  { id: DEPT.finance, name: 'Finance', slug: 'finance', tagline: 'Money in, ad money out, margin per SKU.', color: GRAY.dim, order: 6 },
  { id: DEPT.operations, name: 'Operations', slug: 'operations', tagline: 'The OS itself: memory, conduct, schedule.', color: GRAY.dark, order: 7 },
];

export const PEOPLE: Person[] = [
  { id: 'person-yannick', departmentId: DEPT.growth, name: 'Yannick Kiefer', role: 'Operator', tools: ['shopify', 'meta-ads'] },
  { id: 'person-head-growth', departmentId: DEPT.growth, name: 'Head of Growth', role: 'Head of Growth', tools: ['meta-ads', 'tiktok-ads'] },
  { id: 'person-content-lead', departmentId: DEPT.content, name: 'Content Lead', role: 'Content Lead', tools: ['zernio', 'apify'] },
  { id: 'person-retention-lead', departmentId: DEPT.retention, name: 'Retention Lead', role: 'Retention Lead', tools: ['klaviyo', 'shopify'] },
  { id: 'person-store-manager', departmentId: DEPT.store, name: 'Store Manager', role: 'Store Manager', tools: ['shopify', 'amazon'] },
  { id: 'person-care-lead', departmentId: DEPT.care, name: 'Customer Care Lead', role: 'Customer Care Lead', tools: ['support-inbox', 'gmail'] },
  { id: 'person-bookkeeper', departmentId: DEPT.finance, name: 'Bookkeeper', role: 'Bookkeeper', tools: ['shopify', 'amazon'] },
  { id: 'person-ops-assistant', departmentId: DEPT.operations, name: 'Operations Assistant', role: 'Operations Assistant', tools: ['gbrain', 'slack'] },
];

// Filled by Tasks 2 to 8: one import per pillar, concatenated in pillar order.
export const ROSTER: RosterEntry[] = [...GROWTH, ...CONTENT, ...RETENTION];

export function rosterById(id: string): RosterEntry | undefined {
  return ROSTER.find((e) => e.id === id);
}

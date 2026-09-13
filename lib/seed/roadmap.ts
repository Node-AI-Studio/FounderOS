import type { Domain, Metric, Phase, RoadmapItem } from '@/lib/schemas';
import { DEPT } from '@/lib/roster';

const GRAY = { white: '#fafafa', light: '#d4d4d4', mid: '#a3a3a3', dim: '#737373', dark: '#525252' };

export const roadmap: RoadmapItem[] = [
  { id: 'rm-evidence', title: 'Evidence base curated and the claims allowlist published', quarter: '2026-Q3', status: 'done', departmentId: DEPT.store, description: 'Patents, studies, clinicians, awards, survey with method note.' },
  { id: 'rm-brand-pack', title: 'Brand pack 2.4 with approved product photography', quarter: '2026-Q3', status: 'done', departmentId: DEPT.operations, description: 'Templates and photography the producers draw from.' },
  { id: 'rm-connect-shopify', title: 'Connect Shopify', quarter: '2026-Q3', status: 'now', departmentId: DEPT.store, description: 'Admin API token for orders, products, customers.' },
  { id: 'rm-connect-ads', title: 'Connect Meta, TikTok and Google Ads', quarter: '2026-Q3', status: 'now', departmentId: DEPT.growth, description: 'Marketing API access per platform; TikTok app approval is the lead time.' },
  { id: 'rm-connect-klaviyo', title: 'Connect Klaviyo', quarter: '2026-Q3', status: 'now', departmentId: DEPT.retention, description: 'Private API key; flows and segments read and write.' },
  { id: 'rm-content-engine', title: 'Content engine live at 60 posts a month', quarter: '2026-Q4', status: 'next', departmentId: DEPT.content, description: 'Watchlist, vault, scripts, publishing, kill and promote.' },
  { id: 'rm-21-nights', title: '21 Nights series with six creators', quarter: '2026-Q4', status: 'next', departmentId: DEPT.content, description: 'Day 1, 7, 21, wearable data on screen.' },
  { id: 'rm-paid-loop', title: 'Paid amplification of organic winners', quarter: '2026-Q4', status: 'next', departmentId: DEPT.growth, description: 'Performance Reader to Campaign Launcher, on Yannick\'s spend approval.' },
  { id: 'rm-flows', title: 'Seven Klaviyo flows live', quarter: '2026-Q4', status: 'next', departmentId: DEPT.retention, description: 'Welcome to win-back, 21 Nights Coach in the middle.' },
  { id: 'rm-proof-pages', title: 'Fill the four empty proof pages', quarter: '2026-Q4', status: 'next', departmentId: DEPT.store, description: 'Science, doctor-recommended, compare, better-sleep from the evidence base.' },
  { id: 'rm-ai-answers', title: 'Cited by assistants for sleep questions', quarter: '2027-Q1', status: 'later', departmentId: DEPT.store, description: 'agents.md, llms.txt, schema, weekly citation check.' },
  { id: 'rm-autonomy', title: 'Scheduled runs and failure alerts', quarter: '2027-Q1', status: 'later', departmentId: DEPT.operations, description: 'Every agent on cron, Monday reports without a prompt.' },
  { id: 'rm-handoff', title: 'Handoff to Helight\'s team', quarter: '2027-Q2', status: 'later', departmentId: DEPT.operations, description: 'The board runs in-house; Node AI on retainer for the engine.' },
];

export const phases: Phase[] = [
  { id: 'phase-1', number: 1, title: 'Connect the stack', items: ['Shopify', 'Meta, TikTok, Google', 'Klaviyo', 'Amazon', 'G-Brain'] },
  { id: 'phase-2', number: 2, title: 'Content engine live', items: ['Watchlist and vault', '60 to 90 posts a month', '21 Nights series', 'Compliance gate'] },
  { id: 'phase-3', number: 3, title: 'Amplify and retain', items: ['Winners into paid', 'Seven flows', 'Proof pages', 'Monday briefs'] },
  { id: 'phase-4', number: 4, title: 'Autonomy and handoff', items: ['Scheduled runs', 'Failure alerts', 'In-house operation'] },
];

export const domains: Domain[] = [
  { id: 'brm-1', number: 1, title: 'Command and Memory', color: GRAY.white, items: ['G-Brain', 'brain-store markdown', 'Agent run history', 'Operator console'] },
  { id: 'brm-2', number: 2, title: 'Evidence Base', color: GRAY.light, items: ['Patent family', 'Study chain', 'Clinician positions', 'Claims allowlist'] },
  { id: 'brm-3', number: 3, title: 'Brand Pack', color: GRAY.light, items: ['Brand context', 'Approved photography', 'Templates', 'Versioned releases'] },
  { id: 'brm-4', number: 4, title: 'Ad Accounts', color: GRAY.mid, items: ['Meta', 'TikTok', 'Google', 'Tracking and attribution'] },
  { id: 'brm-5', number: 5, title: 'Content Vault', color: GRAY.mid, items: ['Creator watchlist', 'Hook templates', 'Scripts', 'Publishing log'] },
  { id: 'brm-6', number: 6, title: 'Lifecycle Email', color: GRAY.dim, items: ['Klaviyo flows', 'Segments', '21 Nights Coach', 'SMS'] },
  { id: 'brm-7', number: 7, title: 'Customer Voice', color: GRAY.dim, items: ['Support triage', 'Reviews', 'DMs', 'Weekly synthesis'] },
  { id: 'brm-8', number: 8, title: 'Finance', color: GRAY.dark, items: ['Payouts', 'Ad spend ledger', 'Contribution margin', 'Month close'] },
];

export const metrics: Metric[] = [
  { id: 'metric-sessions', key: 'sessions', label: 'Sessions (7d)', value: 48200, unit: 'sessions', delta: 6.4, period: 'seeded' },
  { id: 'metric-cvr', key: 'conversion_rate', label: 'Conversion rate', value: 2.4, unit: '%', delta: 0.3, period: 'seeded' },
  { id: 'metric-aov', key: 'aov', label: 'Average order', value: 152, unit: 'usd', delta: 4, period: 'seeded' },
  { id: 'metric-mer', key: 'mer', label: 'Blended MER', value: 3.1, unit: 'x', delta: 0.2, period: 'seeded' },
  { id: 'metric-repeat', key: 'repeat_rate', label: 'Repeat rate (90d)', value: 11, unit: '%', delta: 1.2, period: 'seeded' },
  { id: 'metric-refunds', key: 'refund_rate', label: 'Refund rate (60d window)', value: 4.2, unit: '%', delta: -0.6, period: 'seeded' },
];

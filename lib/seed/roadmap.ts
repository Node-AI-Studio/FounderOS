import type { RoadmapItem, Metric, Domain, Phase } from '@/lib/schemas';

// Monochrome palette — the UI is strict black & white; "color" fields carry
// grayscale steps used only for subtle hierarchy.
const GRAY = {
  white: '#fafafa',
  light: '#d4d4d4',
  mid: '#a3a3a3',
  dim: '#737373',
  dark: '#525252',
};

export const roadmap: RoadmapItem[] = [
  { id: 'rm-v1', title: 'FOUNDER OS v1 baseline', quarter: '2026-Q2', status: 'done', departmentId: 'dept-tech', description: 'Six views, SQLite repos, 32 tests.' },
  { id: 'rm-mono', title: 'Monochrome rebuild + real connectors', quarter: '2026-Q2', status: 'done', departmentId: 'dept-tech', description: 'Black & white theme; IMAP, Slack, Stripe, Notion, gbrain wired.' },
  { id: 'rm-gbrain', title: 'G-Brain provider live', quarter: '2026-Q2', status: 'done', departmentId: 'dept-tech', description: 'gbrain CLI doctor/query + brain-store local fallback.' },
  { id: 'rm-creds-email', title: 'Connect 4 email inboxes', quarter: '2026-Q2', status: 'now', departmentId: 'dept-comms', description: 'App passwords / IMAP creds into .env.local slots 1-4.' },
  { id: 'rm-creds-slack', title: 'Connect Slack workspace', quarter: '2026-Q2', status: 'now', departmentId: 'dept-comms', description: 'Bot token with channels:read, channels:history.' },
  { id: 'rm-creds-payments', title: 'Connect payment processors', quarter: '2026-Q2', status: 'now', departmentId: 'dept-finance', description: 'Stripe first; PayPal/Square/Whop as keys land.' },
  { id: 'rm-creds-notion', title: 'Connect Notion workspace', quarter: '2026-Q2', status: 'now', departmentId: 'dept-tech', description: 'Internal integration secret + page shares.' },
  { id: 'rm-supabase', title: 'Revive Supabase Second Brain', quarter: '2026-Q2', status: 'now', departmentId: 'dept-tech', description: 'Unpause free-tier project so gbrain hybrid queries resolve again.' },
  { id: 'rm-scheduler', title: 'Agent scheduler (cron runs)', quarter: '2026-Q3', status: 'next', departmentId: 'dept-tech', description: 'Recurring agent runs with run history and failure alerts.' },
  { id: 'rm-llm', title: 'LLM summarization layer', quarter: '2026-Q3', status: 'next', departmentId: 'dept-tech', description: 'Claude API digests over inbox/Slack/payments data.' },
  { id: 'rm-dedicated-host', title: 'Migrate to a dedicated host', quarter: '2026-Q3', status: 'next', departmentId: 'dept-tech', description: 'Host app + gbrain + agents on the dedicated host; Supabase stays managed.' },
  { id: 'rm-ui', title: 'UI design pass', quarter: '2026-Q4', status: 'later', departmentId: 'dept-tech', description: 'Alex-led redesign once all integrations are live.' },
  { id: 'rm-auth', title: 'Auth + remote access', quarter: '2026-Q4', status: 'later', departmentId: 'dept-tech', description: 'Reach FOUNDER OS on the mini from anywhere, safely.' },
];

// Honest zeros — these flip to live numbers as connectors come online.
export const metrics: Metric[] = [
  { id: 'metric-unread', key: 'unread_total', label: 'Unread (all inboxes)', value: 0, unit: 'emails', delta: 0, period: 'pending creds' },
  { id: 'metric-brain', key: 'brain_pages', label: 'Brain-store Pages', value: 0, unit: 'pages', delta: 0, period: 'run Data Agent' },
  { id: 'metric-balance', key: 'stripe_available', label: 'Stripe Available', value: 0, unit: 'usd', delta: 0, period: 'pending creds' },
  { id: 'metric-runs', key: 'agent_runs', label: 'Agent Runs Logged', value: 0, unit: 'runs', delta: 0, period: 'all time' },
];

export const domains: Domain[] = [
  { id: 'brm-1', number: 1, title: 'Command & Memory', color: GRAY.white, items: ['G-Brain (gbrain CLI)', 'brain-store markdown', 'Agent run history', 'Operator dashboard'] },
  { id: 'brm-2', number: 2, title: 'Email Operations', color: GRAY.light, items: ['Four IMAP inboxes', 'Unread triage', 'Per-inbox health', 'Digest (planned)'] },
  { id: 'brm-3', number: 3, title: 'Team Comms', color: GRAY.light, items: ['Slack channels', 'Message digests', 'Mention tracking (planned)'] },
  { id: 'brm-4', number: 4, title: 'Payments & Revenue', color: GRAY.mid, items: ['Stripe balance + charges', 'PayPal / Square / Whop registry', 'Reconciliation (planned)'] },
  { id: 'brm-5', number: 5, title: 'Knowledge & Docs', color: GRAY.mid, items: ['Notion workspace', 'ZeroEntropy embeddings', 'Supabase Second Brain'] },
  { id: 'brm-6', number: 6, title: 'Agent Runtime', color: GRAY.dim, items: ['Registry + run()', 'Persisted run log', 'Honest failure states'] },
  { id: 'brm-7', number: 7, title: 'Infrastructure', color: GRAY.dim, items: ['Laptop (now)', 'Dedicated host (next)', 'SQLite local', 'Supabase managed'] },
  { id: 'brm-8', number: 8, title: 'Security', color: GRAY.dark, items: ['.env.local secrets (gitignored)', 'Read-only connector scopes', 'No keys in repo'] },
];

export const phases: Phase[] = [
  { id: 'phase-1', number: 1, title: 'Real Connections', items: ['4 email inboxes', 'Slack', 'Payment processors', 'Notion', 'G-Brain'] },
  { id: 'phase-2', number: 2, title: 'Real Agents', items: ['Runtime + run log', 'Honest status board', 'On-demand runs'] },
  { id: 'phase-3', number: 3, title: 'Autonomy', items: ['Scheduled runs', 'LLM digests', 'Failure alerts'] },
  { id: 'phase-4', number: 4, title: 'Dedicated Host', items: ['Migrate compute', 'Remote access + auth', '24/7 uptime'] },
];

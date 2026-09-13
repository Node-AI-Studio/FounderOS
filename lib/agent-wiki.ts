import type { Agent } from '@/lib/schemas';

/**
 * The wiki-style detail shown when you click an agent in the knowledge graph:
 * the markdown files that define the agent and the servers/tools it connects to
 * (flagged when they're MCP servers). Brain-store paths are seeded/derived,
 * real-ready for when each agent's actual definition files get wired in.
 */

// Tools that are backed by an MCP server (vs. a plain integration/local tool).
const MCP_SLUGS = new Set([
  'attio', 'notion', 'slack', 'gbrain', 'obsidian', 'miro', 'playwright', 'figma',
  'serena', 'context7', 'zernio', 'arcads', 'wispr', 'higgsfield', 'canva', 'gmail',
  'google-calendar', 'calendar', 'vercel',
]);

export type WikiServer = { slug: string; name: string; mcp: boolean };
export type AgentWiki = {
  id: string;
  name: string;
  role: string;
  model: string;
  path: string; // brain-store definition folder
  files: string[]; // markdown files that make up the agent
  servers: WikiServer[]; // tools / MCP servers the agent is wired to
};

/** 'comms-feed' → 'Comms Feed' */
export function prettifySlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function buildAgentWiki(agent: Agent): AgentWiki {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    model: agent.model,
    path: `brain-store/agents/${agent.id}`,
    files: ['system.md', 'playbook.md', 'memory.md', `${agent.id}.config.md`],
    servers: agent.tools.map((slug) => ({ slug, name: prettifySlug(slug), mcp: MCP_SLUGS.has(slug) })),
  };
}

// Short, real-ready summaries for the tools agents lean on most. Anything not
// listed falls back to a generic line. Swap for live tool docs later.
const TOOL_SUMMARY: Record<string, string> = {
  gbrain: 'The G-Brain CLI: hybrid search over the markdown brain-store + Supabase second brain.',
  'brain-store': 'Local markdown knowledge base; the source of truth G-Brain syncs from.',
  supabase: 'Postgres + pgvector "second brain" holding chunked embeddings.',
  zeroentropy: 'Embedding provider behind G-Brain hybrid retrieval.',
  zernio: 'Publishing and audience sync across TikTok, Instagram, YouTube.',
  arcads: 'UGC ad generation for volume testing.',
  higgsfield: 'AI image / video / audio generation.',
  remotion: 'Short-form editing, captions, crops.',
  slack: 'Team channels, read + post via the bot.',
  ollama: 'Local model runtime.',
  gmail: 'IMAP inbox for the contact form and escalations.',
  'claude-code': 'The claude-ads and marketing skill sets every agent runs on: plan, audit, monitor, optimise, report.',
  shopify: 'Orders, products, customers, Shopify Payments.',
  klaviyo: 'Flows, campaigns, SMS, segments, list growth.',
  'meta-ads': 'Campaigns, insights, ads library, experiments on Meta.',
  'tiktok-ads': 'Campaigns, Smart+, Shop, Events API on TikTok.',
  'google-ads': 'Search, Shopping, Performance Max on Google.',
  amazon: 'Listing, reviews, Sponsored Products, settlements on Seller Central.',
  'support-inbox': 'Slot for the helpdesk of choice. Would feed triage, drafts and response times.',
  reviews: 'Slot for the reviews app of choice. Would feed Review Monitor and Voice of Customer.',
  attribution: 'Slot for the attribution tool of choice. Would feed MER and per-platform CPA.',
  retail: 'Shelf presence at Ulta and Goop. No integration; sell-through arrives by report.',
  apify: 'Creator watchlist scraping and transcription across TikTok.',
  broadcast: 'Conductor fan-out to every agent.',
  whisper: 'Local transcription. Nothing leaves the machine.',
  tmux: 'Session orchestration on the host.',
  vercel: 'Deploy target when the OS leaves the laptop.',
  gh: 'GitHub CLI, authenticated.',
};

export type ToolWiki = {
  slug: string;
  name: string;
  mcp: boolean;
  kind: string;
  path: string;
  summary: string;
  usedBy: string[];
};

export function buildToolWiki(slug: string, usedBy: string[] = []): ToolWiki {
  const mcp = MCP_SLUGS.has(slug);
  const name = prettifySlug(slug);
  return {
    slug,
    name,
    mcp,
    kind: mcp ? 'MCP server' : 'integration',
    path: `brain-store/tools/${slug}.md`,
    summary: TOOL_SUMMARY[slug] ?? `${name}: wired in through the ${mcp ? 'MCP server' : 'tool'} layer.`,
    usedBy,
  };
}

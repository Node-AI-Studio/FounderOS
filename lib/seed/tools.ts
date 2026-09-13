import type { Tool } from '@/lib/schemas';

// Monochrome palette — the UI is strict black & white; "color" fields carry
// grayscale steps used only for subtle hierarchy.
const GRAY = { white: '#fafafa', light: '#d4d4d4', mid: '#a3a3a3', dim: '#737373', dark: '#525252' };

// The Helight connections board: what the operator has, what's still a slot
// waiting on a key, and what Node AI brings that never shows up on a bill.
export const tools: Tool[] = [
  // Store and channels
  { id: 'shopify', name: 'Shopify', category: 'Store', status: 'available', color: GRAY.white, description: 'Orders, products, customers, Shopify Payments. Needs an Admin API token.' },
  { id: 'amazon', name: 'Amazon Seller Central', category: 'Store', status: 'available', color: GRAY.light, description: 'Listing, reviews, Sponsored Products, settlements. Needs SP-API credentials.' },
  { id: 'retail', name: 'Retail (Ulta, Goop)', category: 'Store', status: 'planned', color: GRAY.dim, description: 'Shelf presence only. No integration claimed; sell-through arrives by report.' },
  // Marketing
  { id: 'meta-ads', name: 'Meta Ads', category: 'Marketing', status: 'available', color: GRAY.white, description: 'Campaigns, insights, ads library, experiments. Needs a Marketing API token.' },
  { id: 'tiktok-ads', name: 'TikTok Ads', category: 'Marketing', status: 'available', color: GRAY.light, description: 'Campaigns, Smart+, Shop, Events API. Needs Marketing API app approval.' },
  { id: 'google-ads', name: 'Google Ads', category: 'Marketing', status: 'available', color: GRAY.mid, description: 'Search, Shopping, Performance Max. Needs a developer token and OAuth.' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Marketing', status: 'available', color: GRAY.light, description: 'Flows, campaigns, SMS, segments, list growth. Needs a private API key.' },
  { id: 'attribution', name: 'Attribution', category: 'Marketing', status: 'planned', color: GRAY.dim, description: 'Slot for the attribution tool of choice. Would feed MER and per-platform CPA.' },
  { id: 'zernio', name: 'Zernio', category: 'Marketing', status: 'connected', color: GRAY.white, description: 'Publishing and audience sync across TikTok, Instagram, YouTube. Node AI\'s publisher.' },
  { id: 'apify', name: 'Apify (TikTok actors)', category: 'Marketing', status: 'available', color: GRAY.mid, description: 'Creator watchlist scraping and transcription. Node AI\'s actors; about $9 a month at this scale.' },
  // Creative, what Node AI brings
  { id: 'arcads', name: 'Arcads', category: 'Creative', status: 'connected', color: GRAY.white, description: 'UGC ad generation for volume testing. Node AI tooling.' },
  { id: 'remotion', name: 'Remotion pipeline', category: 'Creative', status: 'connected', color: GRAY.light, description: 'Short-form editing, captions, crops. Node AI tooling.' },
  { id: 'higgsfield', name: 'Higgsfield', category: 'Creative', status: 'connected', color: GRAY.mid, description: 'AI visuals and product scenes from the brand pack. Node AI tooling.' },
  { id: 'whisper', name: 'Whisper (local)', category: 'Creative', status: 'connected', color: GRAY.dim, description: 'Local transcription. Nothing leaves the machine.' },
  // Customers
  { id: 'support-inbox', name: 'Support inbox', category: 'Customers', status: 'planned', color: GRAY.dim, description: 'Slot for the helpdesk of choice. Would feed triage, drafts and response times.' },
  { id: 'reviews', name: 'Reviews', category: 'Customers', status: 'planned', color: GRAY.dim, description: 'Slot for the reviews app of choice. Would feed Review Monitor and Voice of Customer.' },
  { id: 'gmail', name: 'Email', category: 'Customers', status: 'available', color: GRAY.light, description: 'IMAP inbox for the contact form and escalations. Set INBOX_1_HOST/_USER/_PASS.' },
  { id: 'slack', name: 'Slack', category: 'Customers', status: 'available', color: GRAY.mid, description: 'Team feed and alerts. Needs a bot token with channels:read and channels:history.' },
  // Knowledge
  { id: 'gbrain', name: 'G-Brain', category: 'Knowledge', status: 'connected', color: GRAY.white, description: 'The company brain: evidence base, claims allowlist, brand pack, decisions.' },
  { id: 'brain-store', name: 'brain-store/', category: 'Knowledge', status: 'connected', color: GRAY.light, description: 'Markdown source of truth on disk.' },
  { id: 'zeroentropy', name: 'ZeroEntropy', category: 'Knowledge', status: 'connected', color: GRAY.mid, description: 'Embeddings behind hybrid search.' },
  { id: 'supabase', name: 'Supabase', category: 'Knowledge', status: 'available', color: GRAY.mid, description: 'Managed store behind the brain index.' },
  // Orchestration
  { id: 'claude-code', name: 'Claude Code skills', category: 'Orchestration', status: 'connected', color: GRAY.white, description: 'The claude-ads and marketing skill sets every agent runs on: plan, audit, monitor, optimise, report.' },
  { id: 'broadcast', name: 'Broadcast', category: 'Orchestration', status: 'connected', color: GRAY.light, description: 'Conductor fan-out to every agent.' },
  { id: 'tmux', name: 'tmux', category: 'Orchestration', status: 'connected', color: GRAY.mid, description: 'Session orchestration on the host.' },
  { id: 'ollama', name: 'Ollama', category: 'Orchestration', status: 'connected', color: GRAY.dim, description: 'Local model server for cheap passes.' },
  { id: 'vercel', name: 'Vercel CLI', category: 'Orchestration', status: 'connected', color: GRAY.dim, description: 'Deploy target when the OS leaves the laptop.' },
  { id: 'gh', name: 'GitHub CLI', category: 'Orchestration', status: 'connected', color: GRAY.dark, description: 'Authenticated.' },
];

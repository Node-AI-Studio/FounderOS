import type { Tool } from '@/lib/schemas';

// Monochrome palette — the UI is strict black & white; "color" fields carry
// grayscale steps used only for subtle hierarchy.
const GRAY = {
  white: '#fafafa',
  light: '#d4d4d4',
  mid: '#a3a3a3',
  dim: '#737373',
  dark: '#525252',
};


// Curated from the 2026-06-11 full-filesystem discovery sweep (104 findings).
// status reflects what was VERIFIED on this machine: connected = creds/binary
// exist and worked; available = installed/configured but needs a key or start.
export const tools: Tool[] = [
  // Knowledge
  { id: 'tool-gbrain', name: 'G-Brain (gbrain CLI)', category: 'Knowledge', status: 'connected', color: GRAY.white, description: 'v0.41 · brain-store markdown + Supabase + ZeroEntropy embeddings. Live, health 90/100.' },
  { id: 'tool-brain-store', name: 'brain-store/', category: 'Knowledge', status: 'connected', color: GRAY.light, description: 'Local markdown knowledge base at knowledge/brain-store.' },
  { id: 'tool-zeroentropy', name: 'ZeroEntropy', category: 'Knowledge', status: 'connected', color: GRAY.mid, description: 'Vector embeddings behind gbrain hybrid search. Key in ~/.config/knowledge/config.json.' },
  { id: 'tool-supabase', name: 'Supabase (Second Brain)', category: 'Knowledge', status: 'available', color: GRAY.mid, description: '918 pages / 11k chunks. Free tier pauses on idle — unpause from dashboard when queries fail.' },
  { id: 'tool-obsidian', name: 'Notes Vault', category: 'Knowledge', status: 'connected', color: GRAY.light, description: '~/Documents/Notes Vault incl. archived-conversation Chat Archive. Direct filesystem access.' },
  { id: 'tool-notion', name: 'Notion', category: 'Knowledge', status: 'available', color: GRAY.dim, description: 'Client implemented. Set NOTION_API_KEY and share pages with the integration.' },
  // Social & growth
  { id: 'tool-zernio', name: 'Zernio', category: 'Social', status: 'connected', color: GRAY.white, description: '6 platforms under @founderos.ai (IG, TikTok, X…). Key at ~/.config/social/.env — live.' },
  { id: 'tool-manychat', name: 'ManyChat', category: 'Social', status: 'available', color: GRAY.dim, description: 'DM automation. Endpoint map fully documented in shared-config; needs MANYCHAT_API_KEY.' },
  { id: 'tool-skool', name: 'Skool (via Playwright)', category: 'Social', status: 'connected', color: GRAY.mid, description: 'launchpad-cohort community, driven by the documented Playwright workflow.' },
  // CRM & revenue
  { id: 'tool-attio', name: 'Attio', category: 'CRM & Revenue', status: 'connected', color: GRAY.white, description: 'Vantage + LC deals. Key reused from MCP config (read-scoped: query records, not lists).' },
  { id: 'tool-fanbasis', name: 'FanBasis', category: 'CRM & Revenue', status: 'planned', color: GRAY.light, description: 'Offer/payment/customer context for Sales, including the Vantage FanBasis lane.' },
  { id: 'tool-pava', name: 'PAVA', category: 'CRM & Revenue', status: 'planned', color: GRAY.mid, description: 'Financing options for sales offers and payment-plan context.' },
  { id: 'tool-stripe', name: 'Stripe', category: 'CRM & Revenue', status: 'available', color: GRAY.light, description: 'Full client implemented — balance + charges live once STRIPE_SECRET_KEY is set.' },
  { id: 'tool-ghl', name: 'GoHighLevel', category: 'CRM & Revenue', status: 'planned', color: GRAY.dark, description: 'CLI wrapper scaffolded in knowledge/scripts; keys never added.' },
  { id: 'tool-fathom', name: 'Fathom', category: 'CRM & Revenue', status: 'available', color: GRAY.mid, description: 'AI meeting notetaker, used daily. Needs FATHOM_API_KEY from settings for API access.' },
  { id: 'tool-webinarjam', name: 'WebinarJam', category: 'CRM & Revenue', status: 'available', color: GRAY.light, description: 'Launchpad Cohort webinar funnel — registrants & attendees are leads. Client implemented; set WEBINARJAM_API_KEY (account-wide).' },
  { id: 'tool-trakyo', name: 'Trakyo', category: 'CRM & Revenue', status: 'planned', color: GRAY.dim, description: 'Revenue attribution for Launchpad Cohort: content → booked calls → payments. Status-only until Trakyo ships a public API (TRAKYO_API_KEY).' },
  // Creative studio
  { id: 'tool-remotion', name: 'Remotion Pipeline', category: 'Creative', status: 'connected', color: GRAY.white, description: '~/Projects/remotion-pipeline · studio :3789 · LC + Vantage themes · 7 skills. Active Jun 10.' },
  { id: 'tool-higgsfield', name: 'Higgsfield CLI', category: 'Creative', status: 'connected', color: GRAY.light, description: 'v0.1.40, auth in keychain. generate / product-photoshoot / marketing-studio / soul-id.' },
  { id: 'tool-arcads', name: 'Arcads', category: 'Creative', status: 'connected', color: GRAY.mid, description: 'UGC ads for Vantage (Veo/Sora/Kling). Basic auth at ~/Projects/arcads-agent-skills/.env.' },
  { id: 'tool-whisper', name: 'Whisper (local)', category: 'Creative', status: 'connected', color: GRAY.dim, description: 'whisper-cli + ffmpeg via brew. Local transcription, nothing leaves the machine.' },
  { id: 'tool-miro', name: 'Miro', category: 'Creative', status: 'connected', color: GRAY.mid, description: 'REST API with token from knowledge/.env.agents. GBrain architecture board exists.' },
  { id: 'tool-canva-figma', name: 'Canva + Figma', category: 'Creative', status: 'available', color: GRAY.dark, description: 'Connected as Claude MCPs (session-scoped). Standalone API needs separate keys.' },
  // Comms
  { id: 'tool-imap', name: 'Email (4 IMAP slots)', category: 'Comms', status: 'available', color: GRAY.light, description: 'Client implemented for 4 inboxes — set INBOX_1..4_HOST/_USER/_PASS.' },
  { id: 'tool-slack', name: 'Slack', category: 'Comms', status: 'available', color: GRAY.mid, description: 'Client implemented. Needs a bot token with channels:read/history scopes.' },
  { id: 'tool-wispr', name: 'Wispr Flow', category: 'Comms', status: 'connected', color: GRAY.white, description: 'Voice dictation — heaviest daily-use tool found. Local flow.sqlite read live.' },
  { id: 'tool-whatsapp', name: 'WhatsApp', category: 'Comms', status: 'connected', color: GRAY.white, description: 'Desktop app local ChatStorage.sqlite, read-only: 600+ chats incl. LC + Vantage teams.' },
  // Orchestration & infra
  { id: 'tool-command-center', name: 'Command Center (:4000)', category: 'Orchestration', status: 'available', color: GRAY.light, description: 'command-center: kanban, brand deals, sales calls, SOPs, dispatch. Start with npm run dev.' },
  { id: 'tool-openclaw', name: 'OpenClaw Gateway', category: 'Orchestration', status: 'available', color: GRAY.dim, description: 'Dormant — gateway :18789 down, token exists at ~/.openclaw/openclaw.json. Needs repair/reinstall.' },
  { id: 'tool-tmux', name: 'tmux', category: 'Orchestration', status: 'connected', color: GRAY.mid, description: 'Multi-Claude session orchestration. Dashboard reads live session list.' },
  { id: 'tool-ollama', name: 'Ollama', category: 'Orchestration', status: 'connected', color: GRAY.light, description: 'Local LLM server :11434, no auth. Pull a model to enable free local inference.' },
  { id: 'tool-vercel', name: 'Vercel CLI', category: 'Orchestration', status: 'connected', color: GRAY.mid, description: 'v50, authenticated. Deploy target when FOUNDER OS goes public.' },
  { id: 'tool-gh', name: 'GitHub CLI', category: 'Orchestration', status: 'connected', color: GRAY.dim, description: 'gh 2.89, authenticated.' },
  // Payments (registry awaiting keys)
  { id: 'tool-paypal', name: 'PayPal', category: 'Payments', status: 'planned', color: GRAY.mid, description: 'Registered in the processor registry; client lands when keys do.' },
  { id: 'tool-square', name: 'Square', category: 'Payments', status: 'planned', color: GRAY.dim, description: 'Registered in the processor registry; client lands when keys do.' },
  { id: 'tool-whop', name: 'Whop', category: 'Payments', status: 'planned', color: GRAY.dark, description: 'Registered in the processor registry; client lands when keys do.' },
];

/**
 * Workflow step tools are stored as short ids ('ghl', 'calendar', 'gmail');
 * the map cards render them with the actual company logo. This is the id →
 * brand bridge: every id used by seeded workflows has an explicit entry
 * (enforced by tests/workflow-tool-brands.test.ts against hasBrandMark), and
 * unknown ids degrade to an identity that BrandLogo renders as a lettermark.
 * Pure data — safe to import anywhere; the logo rendering itself stays
 * server-side (BrandLogo pulls simple-icons, which must not enter the client
 * bundle).
 */

export type ToolBrand = { slug: string; name: string };

export const TOOL_BRANDS: Record<string, ToolBrand> = {
  // Helight tool ids (lib/seed/tools.ts / the roster).
  shopify: { slug: 'shopify', name: 'Shopify' },
  klaviyo: { slug: 'klaviyo', name: 'Klaviyo' },
  'meta-ads': { slug: 'meta', name: 'Meta Ads' },
  'tiktok-ads': { slug: 'tiktok', name: 'TikTok Ads' },
  'google-ads': { slug: 'googleads', name: 'Google Ads' },
  amazon: { slug: 'amazon', name: 'Amazon' },
  zernio: { slug: 'zernio', name: 'Zernio' },
  arcads: { slug: 'arcads', name: 'Arcads' },
  remotion: { slug: 'remotion', name: 'Remotion' },
  gmail: { slug: 'gmail', name: 'Gmail' },
  slack: { slug: 'slack', name: 'Slack' },
  gbrain: { slug: 'gbrain', name: 'G-Brain' },
  apify: { slug: 'apify', name: 'Apify' },
  'claude-code': { slug: 'claude', name: 'Claude Code' },
  // Old-venture tool ids: lib/seed/workflows.ts still uses these until Task 15
  // rewrites it for Helight. Keeping them here (rather than a hard replace)
  // is what keeps tests/workflow-tool-brands.test.ts green in the meantime.
  attio: { slug: 'attio', name: 'Attio' },
  calendar: { slug: 'googlecalendar', name: 'Google Calendar' },
  ghl: { slug: 'gohighlevel', name: 'GoHighLevel' },
  manychat: { slug: 'manychat', name: 'ManyChat' },
  notion: { slug: 'notion', name: 'Notion' },
  'proposal-gen': { slug: 'proposal-gen', name: 'Proposal Generator' },
  skool: { slug: 'skool', name: 'Skool' },
  trakyo: { slug: 'trakyo', name: 'Trakyo' },
  webinarjam: { slug: 'webinarjam', name: 'WebinarJam' },
};

export function toolBrand(toolId: string): ToolBrand {
  return TOOL_BRANDS[toolId] ?? { slug: toolId, name: toolId };
}

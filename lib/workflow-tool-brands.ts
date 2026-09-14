/**
 * Workflow step tools are stored as short ids ('zernio', 'gmail', 'shopify');
 * the map cards render them with the actual company logo. This is the id to
 * brand bridge: every id used by seeded workflows has an explicit entry
 * (enforced by tests/workflow-tool-brands.test.ts against hasBrandMark), and
 * unknown ids degrade to an identity that BrandLogo renders as a lettermark.
 * Pure data, safe to import anywhere; the logo rendering itself stays
 * server-side (BrandLogo pulls simple-icons, which must not enter the client
 * bundle).
 */

export type ToolBrand = { slug: string; name: string };

export const TOOL_BRANDS: Record<string, ToolBrand> = {
  // Helight tool ids (lib/seed/tools.ts / the roster / lib/seed/workflows.ts).
  shopify: { slug: 'shopify', name: 'Shopify' },
  klaviyo: { slug: 'klaviyo', name: 'Klaviyo' },
  'meta-ads': { slug: 'meta', name: 'Meta Ads' },
  'tiktok-ads': { slug: 'tiktok', name: 'TikTok Ads' },
  'google-ads': { slug: 'googleads', name: 'Google Ads' },
  // simple-icons carries no Amazon mark; the catalog's lettermark stands in.
  amazon: { slug: 'amazonsellercentral', name: 'Amazon Seller Central' },
  zernio: { slug: 'zernio', name: 'Zernio' },
  arcads: { slug: 'arcads', name: 'Arcads' },
  remotion: { slug: 'remotion', name: 'Remotion' },
  gmail: { slug: 'gmail', name: 'Gmail' },
  slack: { slug: 'slack', name: 'Slack' },
  gbrain: { slug: 'gbrain', name: 'G-Brain' },
  apify: { slug: 'apify', name: 'Apify' },
  'claude-code': { slug: 'claude', name: 'Claude Code' },
};

export function toolBrand(toolId: string): ToolBrand {
  return TOOL_BRANDS[toolId] ?? { slug: toolId, name: toolId };
}

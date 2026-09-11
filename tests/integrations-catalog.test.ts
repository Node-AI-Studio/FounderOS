import { describe, expect, test } from 'vitest';
import {
  INTEGRATIONS,
  integrationsByCategory,
  connectionCatalog,
  connectKeysFor,
} from '@/lib/integrations-catalog';
import { IntegrationSchema, INTEGRATION_CATEGORIES } from '@/lib/schemas';
import { hasBrandMark } from '@/lib/brand-logos';
import type { ConnectorStatus } from '@/lib/connectors/types';

describe('INTEGRATIONS catalog', () => {
  test('a rich catalog, every entry valid against the schema', () => {
    expect(INTEGRATIONS.length).toBeGreaterThanOrEqual(30);
    for (const i of INTEGRATIONS) {
      expect(() => IntegrationSchema.parse(i)).not.toThrow();
    }
  });

  test('slugs are unique', () => {
    const slugs = INTEGRATIONS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('every integration resolves to a real brand mark (logo or lettermark)', () => {
    for (const i of INTEGRATIONS) {
      expect(hasBrandMark(i.slug, i.name)).toBe(true);
    }
  });

  test('categories are allowed and established categories have at least 3 tools', () => {
    const byCat = integrationsByCategory();
    for (const [cat, tools] of byCat) {
      expect(INTEGRATION_CATEGORIES).toContain(cat);
      expect(tools.length).toBeGreaterThanOrEqual(cat === 'Orchestration' ? 1 : 3);
    }
  });

  test('Paperclip is listed under Orchestration with its connector and credentials', () => {
    const paperclip = INTEGRATIONS.find((entry) => entry.slug === 'paperclip');
    expect(paperclip).toMatchObject({
      name: 'Paperclip',
      category: 'Orchestration',
      connectorId: 'paperclip',
      envKeys: ['PAPERCLIP_URL', 'PAPERCLIP_API_KEY'],
    });
    expect(INTEGRATION_CATEGORIES).toContain('Orchestration');
    expect(integrationsByCategory().get('Orchestration')).toEqual([paperclip]);
  });

  test('at least 6 tools are flagged popular', () => {
    expect(INTEGRATIONS.filter((i) => i.popular).length).toBeGreaterThanOrEqual(6);
  });

  test('connectorIds point at ids that exist in the given status set', () => {
    const ids = new Set(INTEGRATIONS.map((i) => i.connectorId).filter(Boolean));
    // spot-check a few expected wirings
    expect(ids.has('slack')).toBe(true);
    expect(ids.has('notion')).toBe(true);
    expect(ids.has('payments')).toBe(true);
  });
});

describe('connectionCatalog — merges live connector state onto the catalog', () => {
  const statuses: ConnectorStatus[] = [
    { id: 'slack', name: 'Slack', kind: 'slack', state: 'connected', detail: 'ok' },
    { id: 'notion', name: 'Notion', kind: 'notion', state: 'not_configured', detail: 'no key' },
    { id: 'payments', name: 'Payments', kind: 'payments', state: 'error', detail: 'bad key' },
  ];

  test('a connected connector marks its catalog entry connected', () => {
    const rows = connectionCatalog(statuses);
    const slack = rows.find((r) => r.slug === 'slack');
    expect(slack?.connected).toBe(true);
  });

  test('a not_configured or error connector is not connected', () => {
    const rows = connectionCatalog(statuses);
    expect(rows.find((r) => r.slug === 'notion')?.connected).toBe(false);
    expect(rows.find((r) => r.slug === 'stripe')?.connected).toBe(false);
  });

  test('an integration with no connectorId is never connected', () => {
    const rows = connectionCatalog(statuses);
    const noConnector = rows.find((r) => !r.connectorId);
    expect(noConnector?.connected).toBe(false);
  });

  test('every catalog row survives the merge (count preserved)', () => {
    expect(connectionCatalog(statuses)).toHaveLength(INTEGRATIONS.length);
  });
});

describe('connect flow (paste a key on the board)', () => {
  test('connectKeysFor: explicit envKeys win, generic falls back, [] means guidance-only', () => {
    const notion = INTEGRATIONS.find((i) => i.slug === 'notion')!;
    expect(connectKeysFor(notion)).toEqual(['NOTION_API_KEY']);
    const discord = INTEGRATIONS.find((i) => i.slug === 'discord')!;
    expect(connectKeysFor(discord)).toEqual(['DISCORD_API_KEY']);
    const whatsapp = INTEGRATIONS.find((i) => i.slug === 'whatsapp')!;
    expect(connectKeysFor(whatsapp)).toEqual([]);
  });

  test('no tile points at a connector that is not registered', async () => {
    const { CONNECTOR_IDS } = await import('@/lib/connectors');
    const registered = new Set(CONNECTOR_IDS);
    for (const i of INTEGRATIONS) {
      if (i.connectorId) expect(registered.has(i.connectorId), `${i.slug} -> ${i.connectorId}`).toBe(true);
    }
  });

  test('the tiles that reported connected without a network call are gone', () => {
    const slugs = new Set(INTEGRATIONS.map((i) => i.slug));
    for (const gone of ['gohighlevel', 'meta', 'trakyo', 'skool']) expect(slugs.has(gone), gone).toBe(false);
  });

  test('keySaved reflects env.local coverage of the entry keys, never fakes connected', () => {
    const catalog = connectionCatalog([], { NOTION_API_KEY: 'x', PAYPAL_CLIENT_ID: 'a' });
    const bySlug = new Map(catalog.map((c) => [c.slug, c]));
    expect(bySlug.get('notion')?.keySaved).toBe(true);
    expect(bySlug.get('notion')?.connected).toBe(false);
    // multi-key entries need every key before keySaved
    expect(bySlug.get('paypal')?.keySaved).toBe(false);
    expect(bySlug.get('discord')?.keySaved).toBe(false);
  });
});

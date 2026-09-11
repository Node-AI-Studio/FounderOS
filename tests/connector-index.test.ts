import { afterEach, expect, test, vi } from 'vitest';
import { CONNECTOR_IDS, allConnectorStatuses } from '@/lib/connectors';

vi.mock('@/lib/connectors/email', () => ({ emailStatus: async () => ({}) }));
vi.mock('@/lib/connectors/gcal', () => ({ calendarStatus: async () => ({}) }));
vi.mock('@/lib/connectors/slack', () => ({ slackStatus: async () => ({}) }));
vi.mock('@/lib/connectors/payments', () => ({ paymentsStatus: async () => ({}) }));
vi.mock('@/lib/connectors/notion', () => ({ notionStatus: async () => ({}) }));
vi.mock('@/lib/connectors/attio', () => ({ attioStatus: async () => ({}) }));
vi.mock('@/lib/connectors/wispr', () => ({ wisprStatus: async () => ({}) }));
vi.mock('@/lib/connectors/whatsapp', () => ({ whatsappStatus: async () => ({}) }));
vi.mock('@/lib/connectors/obsidian', () => ({ obsidianStatus: async () => ({}) }));
vi.mock('@/lib/connectors/local-stack', () => ({ localStackStatus: async () => ({}) }));
vi.mock('@/lib/connectors/llm', () => ({ llmStatus: async () => ({}) }));
vi.mock('@/lib/brain', () => ({
  getBrainProvider: () => ({ status: async () => ({ connected: false }) }),
}));
vi.mock('@/lib/creds', () => ({ runtimeEnv: () => ({}), resolveManychatKey: () => undefined }));

afterEach(() => {
  vi.unstubAllEnvs();
});

test('allConnectorStatuses includes Paperclip orchestration status', async () => {
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
  vi.stubEnv('PAPERCLIP_URL', '');

  expect(await allConnectorStatuses()).toContainEqual(expect.objectContaining({
    id: 'paperclip',
    name: 'Paperclip',
    kind: 'orchestration',
    state: 'not_configured',
  }));
});

test('the registry lists exactly the connectors with a real status function', () => {
  const ids = [...CONNECTOR_IDS].sort();
  expect(ids).toEqual(['attio', 'calendar', 'email', 'gbrain', 'llm', 'local-stack', 'notion', 'obsidian', 'paperclip', 'payments', 'slack', 'whatsapp', 'wispr']);
  for (const gone of ['ghl', 'meta-ads', 'trakyo', 'skool']) expect(ids).not.toContain(gone);
});

import { afterEach, expect, test, vi } from 'vitest';
import { allConnectorStatuses } from '@/lib/connectors';

vi.mock('@/lib/connectors/email', () => ({ emailStatus: async () => ({}) }));
vi.mock('@/lib/connectors/gcal', () => ({ calendarStatus: async () => ({}) }));
vi.mock('@/lib/connectors/slack', () => ({ slackStatus: async () => ({}) }));
vi.mock('@/lib/connectors/payments', () => ({ paymentsStatus: async () => ({}) }));
vi.mock('@/lib/connectors/notion', () => ({ notionStatus: async () => ({}) }));
vi.mock('@/lib/connectors/zernio', () => ({ zernioStatus: async () => ({}) }));
vi.mock('@/lib/connectors/beehiiv', () => ({ beehiivStatus: async () => ({}) }));
vi.mock('@/lib/connectors/manychat', () => ({ manychatStatus: async () => ({}) }));
vi.mock('@/lib/connectors/attio', () => ({ attioStatus: async () => ({}) }));
vi.mock('@/lib/connectors/arcads', () => ({ arcadsStatus: async () => ({}) }));
vi.mock('@/lib/connectors/miro', () => ({ miroStatus: async () => ({}) }));
vi.mock('@/lib/connectors/wispr', () => ({ wisprStatus: async () => ({}) }));
vi.mock('@/lib/connectors/whatsapp', () => ({ whatsappStatus: async () => ({}) }));
vi.mock('@/lib/connectors/obsidian', () => ({ obsidianStatus: async () => ({}) }));
vi.mock('@/lib/connectors/local-stack', () => ({ localStackStatus: async () => ({}) }));
vi.mock('@/lib/connectors/llm', () => ({ llmStatus: async () => ({}) }));
vi.mock('@/lib/connectors/webinarjam', () => ({ webinarjamStatus: async () => ({}) }));
vi.mock('@/lib/connectors/trakyo', () => ({ trakyoStatus: async () => ({}) }));
vi.mock('@/lib/connectors/meta-ads', () => ({ metaAdsStatus: async () => ({}) }));
vi.mock('@/lib/connectors/ghl', () => ({ ghlStatus: async () => ({}) }));
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

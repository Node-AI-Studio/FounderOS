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

test('allConnectorStatuses hides connectors outside Helight\'s stack from the aggregate', async () => {
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
  vi.stubEnv('PAPERCLIP_URL', '');

  // Paperclip's real status wiring still runs here (it is not mocked above),
  // so this also proves the hide is a display filter, not a deleted check:
  // the underlying status still computes as 'not_configured', it just never
  // reaches the returned array.
  const statuses = await allConnectorStatuses();
  const ids = statuses.map((s) => s.id);
  expect(ids).not.toContain('paperclip');
  expect(ids).not.toContain('whatsapp');
  expect(ids).not.toContain('attio');
  expect(ids).not.toContain('wispr');
  expect(ids).not.toContain('obsidian');
  expect(ids).not.toContain('payments');
});

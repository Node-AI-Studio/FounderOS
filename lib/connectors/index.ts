import { emailStatus } from '@/lib/connectors/email';
import { calendarStatus } from '@/lib/connectors/gcal';
import { slackStatus } from '@/lib/connectors/slack';
import { paymentsStatus } from '@/lib/connectors/payments';
import { notionStatus } from '@/lib/connectors/notion';
import { attioStatus } from '@/lib/connectors/attio';
import { wisprStatus } from '@/lib/connectors/wispr';
import { whatsappStatus } from '@/lib/connectors/whatsapp';
import { obsidianStatus } from '@/lib/connectors/obsidian';
import { localStackStatus } from '@/lib/connectors/local-stack';
import { llmStatus } from '@/lib/connectors/llm';
import { paperclipStatus } from '@/lib/connectors/paperclip';
import { getBrainProvider } from '@/lib/brain';
import { runtimeEnv } from '@/lib/creds';
import type { ConnectorStatus } from '@/lib/connectors/types';
import { createStatusCache } from '@/lib/connectors/status-cache';

async function brainConnectorStatus(): Promise<ConnectorStatus> {
  const status = await getBrainProvider().status();
  return {
    id: 'gbrain',
    name: 'G-Brain',
    kind: 'brain',
    state: status.connected ? 'connected' : 'error',
    detail: status.detail,
    meta: { provider: status.provider },
  };
}

// Only the connectors Node AI runs. The previous owner's stack (Zernio,
// Beehiiv, ManyChat, WebinarJam, Trakyo, Meta Ads, GHL, Arcads, Miro) was
// unregistered 2026-09-10: their modules and catalog tiles remain, but they no
// longer count as "systems" that can be down.
const CHECKS: [string, ConnectorStatus['kind'], () => Promise<ConnectorStatus>][] = [
  ['gbrain', 'brain', brainConnectorStatus],
  ['llm', 'orchestration', llmStatus],
  ['paperclip', 'orchestration', () => paperclipStatus(runtimeEnv())],
  ['whatsapp', 'social', whatsappStatus],
  ['attio', 'crm', attioStatus],
  ['wispr', 'local', wisprStatus],
  ['local-stack', 'local', localStackStatus],
  ['obsidian', 'knowledge', obsidianStatus],
  ['email', 'email', () => emailStatus(runtimeEnv())],
  ['calendar', 'calendar', calendarStatus],
  ['slack', 'slack', () => slackStatus(runtimeEnv())],
  ['payments', 'payments', () => paymentsStatus(runtimeEnv())],
  ['notion', 'notion', () => notionStatus(runtimeEnv())],
];

async function runAllChecks(): Promise<ConnectorStatus[]> {
  return Promise.all(
    CHECKS.map(([id, kind, check]) =>
      check().catch(
        (err): ConnectorStatus => ({
          id,
          name: id,
          kind,
          state: 'error',
          detail: err instanceof Error ? err.message : String(err),
        }),
      ),
    ),
  );
}

// One cache per server process. Pages read it instantly; a background refresh
// runs once the snapshot is older than the TTL. Tests that want live results
// pass { fresh: true }; the connect flow calls invalidateConnectorStatuses()
// so a freshly pasted key shows up on the next render, not a minute later.
const STATUS_TTL_MS = 60_000;
const statusCache = createStatusCache(runAllChecks, { ttlMs: STATUS_TTL_MS });

export async function allConnectorStatuses(opts?: { fresh?: boolean }): Promise<ConnectorStatus[]> {
  return statusCache.get(opts);
}

export function invalidateConnectorStatuses(): void {
  statusCache.invalidate();
}

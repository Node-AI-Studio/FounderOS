import { beforeAll, describe, expect, test } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Own temp DB so ingest is observable in isolation. Secret read at request
// time, so tests can toggle MANYCHAT_WEBHOOK_SECRET between calls.
beforeAll(() => {
  process.env.FOUNDER_OS_DB = path.join(mkdtempSync(path.join(tmpdir(), 'founder-os-mc-wh-')), 'test.db');
});

const ROUTE = '@/app/api/webhooks/manychat/route';
const URL = 'http://localhost/api/webhooks/manychat';
const SECRET = 'fake-webhook-secret';
const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(URL, { method: 'POST', headers, body: JSON.stringify(body) });

describe('POST /api/webhooks/manychat', () => {
  test('503s when the secret is blank or unset: never open by default', async () => {
    const { POST } = await import(ROUTE);
    delete process.env.MANYCHAT_WEBHOOK_SECRET;
    expect((await POST(post({ subscriber_id: 'x', text: 'hi' }, { 'x-manychat-secret': 'fake-anything' }))).status).toBe(503);
    process.env.MANYCHAT_WEBHOOK_SECRET = '';
    expect((await POST(post({ subscriber_id: 'x', text: 'hi' }))).status).toBe(503);
  });

  test('401s on a missing or wrong header', async () => {
    const { POST } = await import(ROUTE);
    process.env.MANYCHAT_WEBHOOK_SECRET = SECRET;
    expect((await POST(post({ subscriber_id: 'x', text: 'hi' }))).status).toBe(401);
    expect((await POST(post({ subscriber_id: 'x', text: 'hi' }, { 'x-manychat-secret': SECRET.slice(0, -1) }))).status).toBe(401);
    expect((await POST(post({ subscriber_id: 'x', text: 'hi' }, { 'x-manychat-secret': `${SECRET}x` }))).status).toBe(401);
  });

  test('ingests a DM on a matching header and it lands in the inbox as source=manychat', async () => {
    const { POST } = await import(ROUTE);
    process.env.MANYCHAT_WEBHOOK_SECRET = SECRET;
    const res = await POST(
      post(
        { subscriber_id: 'wh-1', name: 'Webhook Wendy', handle: 'wendy', text: 'came from manychat', ts: '2026-07-18T16:00:00.000Z' },
        { 'x-manychat-secret': SECRET },
      ),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.subscriberId).toBe('wh-1');

    const { getDb } = await import('@/lib/data');
    const found = getDb().social.dmMessages('instagram').find((m) => m.subscriberId === 'wh-1');
    expect(found?.text).toBe('came from manychat');
    expect(found?.source).toBe('manychat');
  });

  test('rejects an unparseable payload with 400', async () => {
    const { POST } = await import(ROUTE);
    process.env.MANYCHAT_WEBHOOK_SECRET = SECRET;
    const res = await POST(post({ text: 'no subscriber id' }, { 'x-manychat-secret': SECRET }));
    expect(res.status).toBe(400);
  });

  test('exposes no GET handler', async () => {
    const mod = await import(ROUTE);
    expect('GET' in mod).toBe(false);
  });
});

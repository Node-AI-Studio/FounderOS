import { describe, expect, test } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { KEY_SLOTS, listKeyStatuses, maskSecret, upsertEnvLocal } from '@/lib/keys';

describe('maskSecret', () => {
  test('shows only the tail, never short secrets', () => {
    expect(maskSecret('sk-live-abcdef123456')).toBe('••••3456');
    expect(maskSecret('abc')).toBe('••••');
    expect(maskSecret('')).toBe('');
  });
});

describe('KEY_SLOTS', () => {
  test('covers the canonical connector slots with groups', () => {
    const vars = KEY_SLOTS.map((s) => s.envVar);
    expect(vars).toEqual(
      expect.arrayContaining(['SLACK_BOT_TOKEN', 'STRIPE_SECRET_KEY', 'NOTION_API_KEY', 'INBOX_1_PASS']),
    );
    for (const slot of KEY_SLOTS) {
      expect(slot.group.length).toBeGreaterThan(0);
      expect(slot.envVar).toMatch(/^[A-Z][A-Z0-9_]*$/);
    }
  });
});

describe('listKeyStatuses', () => {
  test('reports presence with masked values only — never the raw secret', () => {
    const env = { SLACK_BOT_TOKEN: 'fake-xoxb-very-secret-9876', STRIPE_SECRET_KEY: '' };
    const statuses = listKeyStatuses(env);
    const slack = statuses.find((s) => s.envVar === 'SLACK_BOT_TOKEN')!;
    expect(slack.present).toBe(true);
    expect(slack.masked).toBe('••••9876');
    expect(JSON.stringify(statuses)).not.toContain('fake-xoxb-very-secret-9876');
    expect(statuses.find((s) => s.envVar === 'STRIPE_SECRET_KEY')!.present).toBe(false);
  });
});

describe('KEY_SLOTS', () => {
  test('the Square and Whop slots are gone: nothing read them', () => {
    const vars = KEY_SLOTS.map((s) => s.envVar);
    expect(vars).not.toContain('SQUARE_ACCESS_TOKEN');
    expect(vars).not.toContain('WHOP_API_KEY');
  });
});

describe('upsertEnvLocal', () => {
  test('appends a new key and updates an existing one in place', () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), 'keys-')), '.env.local');
    writeFileSync(file, '# comment\nSLACK_BOT_TOKEN=old\nNOTION_API_KEY=keep\n');
    upsertEnvLocal(file, 'SLACK_BOT_TOKEN', 'xoxb-new');
    upsertEnvLocal(file, 'PAYPAL_CLIENT_ID', 'fake-pp-123');
    const content = readFileSync(file, 'utf8');
    expect(content).toContain('SLACK_BOT_TOKEN=xoxb-new');
    expect(content).not.toContain('SLACK_BOT_TOKEN=old');
    expect(content).toContain('NOTION_API_KEY=keep');
    expect(content).toContain('# comment');
    expect(content.trim().endsWith('PAYPAL_CLIENT_ID=fake-pp-123')).toBe(true);
  });

  test('creates the file when missing and rejects bad names', () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), 'keys-')), '.env.local');
    upsertEnvLocal(file, 'STRIPE_SECRET_KEY', 'sk_test_1');
    expect(readFileSync(file, 'utf8')).toContain('STRIPE_SECRET_KEY=sk_test_1');
    expect(() => upsertEnvLocal(file, 'bad-name', 'x')).toThrow();
    expect(() => upsertEnvLocal(file, 'HAS SPACE', 'x')).toThrow();
  });
});

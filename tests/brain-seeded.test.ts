import { afterEach, describe, expect, test } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createSeededBrainProvider } from '@/lib/connectors/gbrain';
import { getBrainProvider } from '@/lib/brain';

function makeStore(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'seeded-brain-store-'));
  mkdirSync(path.join(dir, 'projects'));
  mkdirSync(path.join(dir, 'sops'));
  writeFileSync(
    path.join(dir, 'projects', 'founder-os.md'),
    '# FOUNDER OS\nThe personal OS rebuild uses a revenue split model for Launchpad Cohort.\n',
  );
  writeFileSync(
    path.join(dir, 'sops', 'routine.md'),
    '# Routine\nA good night of sleep matters more than a perfect morning routine.\n',
  );
  writeFileSync(
    path.join(dir, 'sops', 'standup.md'),
    '# Standup\nDaily standup notes, nothing about rest here.\n',
  );
  return dir;
}

afterEach(() => {
  delete process.env.BRAIN_PROVIDER;
});

describe('seeded G-Brain provider', () => {
  test('status reports connected and calls out the seeded numbers', async () => {
    const brain = createSeededBrainProvider({ storePath: makeStore() });
    const status = await brain.status();
    expect(status.connected).toBe(true);
    expect(status.provider).toBe('seeded');
    expect(status.detail).toContain('seeded');
  });

  test('overview reads the real folder and reports a seeded doctor', async () => {
    const brain = createSeededBrainProvider({ storePath: makeStore() });
    const overview = await brain.overview();
    expect(overview.store.totalFiles).toBe(3);
    expect(overview.store.folders).toHaveLength(2);
    expect(overview.doctor.status).toBe('seeded');
    expect(overview.doctor.healthScore).toBe(95);
    expect(overview.doctor.connected).toBe(true);
    expect(overview.doctor.checks.length).toBeGreaterThan(0);
    for (const check of overview.doctor.checks) {
      expect(check.status).toBe('ok');
      expect(check.message.toLowerCase()).toContain('seeded');
    }
  });

  test('stats derive page/chunk counts from the on-disk folder', async () => {
    const brain = createSeededBrainProvider({ storePath: makeStore() });
    const stats = await brain.stats();
    expect(stats?.pages).toBe(3);
    expect(stats?.chunks).toBe(9);
    expect(stats?.embedded).toBe(9);
  });

  test('search finds a real page by content', async () => {
    const brain = createSeededBrainProvider({ storePath: makeStore() });
    const results = await brain.search('sleep');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.title.includes('routine'))).toBe(true);
  });

  test('capture is disabled on the seeded brain', async () => {
    const brain = createSeededBrainProvider({ storePath: makeStore() });
    const outcome = await brain.capture({ text: 'hello' });
    expect(outcome.ok).toBe(false);
  });

  test('getBrainProvider resolves to the seeded provider when BRAIN_PROVIDER=seeded', () => {
    process.env.BRAIN_PROVIDER = 'seeded';
    const brain = getBrainProvider();
    expect(brain.name).toBe('seeded');
  });
});

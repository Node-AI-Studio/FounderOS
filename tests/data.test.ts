import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { openDb, type FounderDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

let db: FounderDb | undefined;

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
});

afterEach(() => {
  db?.close();
  db = undefined;
  vi.unstubAllEnvs();
});

describe('getDb', () => {
  test.each([undefined, '', '0', 'true', '01'])('does not seed when demo seed is %s', async (value) => {
    vi.stubEnv('FOUNDER_OS_DEMO_SEED', value);
    const { getDb } = await import('@/lib/data');
    db = getDb();
    expect(db.agents.all()).toHaveLength(0);
  });

  test('preserves the seeded agent count when demo seed is 1', async () => {
    const reference = openDb(':memory:');
    let seededCount: number;
    try {
      seedDatabase(reference);
      seededCount = reference.agents.all().length;
    } finally {
      reference.close();
    }
    expect(seededCount).toBeGreaterThan(0);
    vi.stubEnv('FOUNDER_OS_DEMO_SEED', '1');
    const { getDb } = await import('@/lib/data');
    db = getDb();
    expect(db.agents.all()).toHaveLength(seededCount);
    expect(getDb()).toBe(db);
  });
});

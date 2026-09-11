import { describe, expect, it } from 'vitest';
import { createCommsFeedCache } from '@/lib/comms-feed-cache';
import type { CommsItem } from '@/lib/comms';

function item(n: number): CommsItem {
  return {
    source: 'email',
    title: `mail ${n}`,
    sender: 'someone@example.com',
    preview: '',
    ts: new Date(2026, 8, 10, 12, 0, n).toISOString(),
  };
}

function producer(total = 10) {
  const calls: number[] = [];
  let run = 0;
  return {
    calls,
    gather: async (limit: number) => {
      run += 1;
      calls.push(limit);
      // newest first, like mergeFeed
      return Array.from({ length: Math.min(total, limit) }, (_, i) => ({
        ...item(total - i),
        preview: `run ${run}`,
      }));
    },
  };
}

describe('createCommsFeedCache', () => {
  it('gathers once at the cache limit and slices per caller', async () => {
    const p = producer();
    const cache = createCommsFeedCache(p.gather, { ttlMs: 60_000, cacheLimit: 8, now: () => 0 });
    const a = await cache.read(3);
    const b = await cache.read(5);
    expect(a).toHaveLength(3);
    expect(b).toHaveLength(5);
    expect(a[0].title).toBe('mail 10');
    expect(p.calls).toEqual([8]);
  });

  it('serves the stale feed after the TTL and refreshes in the background', async () => {
    const p = producer();
    let now = 0;
    const cache = createCommsFeedCache(p.gather, { ttlMs: 60_000, now: () => now });
    await cache.read();
    now = 61_000;
    const stale = await cache.read();
    expect(stale[0].preview).toBe('run 1');
    await cache.settle();
    const fresh = await cache.read();
    expect(fresh[0].preview).toBe('run 2');
    expect(p.calls).toHaveLength(2);
  });

  it('invalidate() and { fresh: true } both force a new gather', async () => {
    const p = producer();
    const cache = createCommsFeedCache(p.gather, { ttlMs: 60_000, now: () => 0 });
    await cache.read();
    await cache.read(40, { fresh: true });
    cache.invalidate();
    await cache.read();
    expect(p.calls).toHaveLength(3);
  });

  it('keeps the last good feed when a refresh throws', async () => {
    let fail = false;
    let now = 0;
    const cache = createCommsFeedCache(
      async () => {
        if (fail) throw new Error('imap down');
        return [item(1)];
      },
      { ttlMs: 1_000, now: () => now },
    );
    await cache.read();
    fail = true;
    now = 5_000;
    expect(await cache.read()).toHaveLength(1);
    await cache.settle();
    expect(await cache.read()).toHaveLength(1);
  });
});

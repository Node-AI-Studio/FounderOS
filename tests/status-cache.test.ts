import { describe, expect, it } from 'vitest';
import { createStatusCache } from '@/lib/connectors/status-cache';

function producer() {
  let n = 0;
  const calls: number[] = [];
  return {
    calls,
    run: async () => {
      n += 1;
      calls.push(n);
      return [{ id: 'x', n }];
    },
  };
}

describe('createStatusCache', () => {
  it('runs the producer on the first read and serves the cached value inside the TTL', async () => {
    const p = producer();
    let now = 1000;
    const cache = createStatusCache(p.run, { ttlMs: 60_000, now: () => now });
    expect(await cache.get()).toEqual([{ id: 'x', n: 1 }]);
    now += 30_000;
    expect(await cache.get()).toEqual([{ id: 'x', n: 1 }]);
    expect(p.calls).toEqual([1]);
  });

  it('shares one in-flight run between concurrent first readers', async () => {
    const p = producer();
    const cache = createStatusCache(p.run, { ttlMs: 60_000, now: () => 0 });
    const [a, b] = await Promise.all([cache.get(), cache.get()]);
    expect(a).toEqual(b);
    expect(p.calls).toEqual([1]);
  });

  it('serves the stale value immediately after the TTL and refreshes in the background', async () => {
    const p = producer();
    let now = 0;
    const cache = createStatusCache(p.run, { ttlMs: 60_000, now: () => now });
    await cache.get();
    now = 61_000;
    expect(await cache.get()).toEqual([{ id: 'x', n: 1 }]); // stale, instant
    await cache.settle();
    expect(await cache.get()).toEqual([{ id: 'x', n: 2 }]); // refreshed
    expect(p.calls).toEqual([1, 2]);
  });

  it('get({ fresh: true }) and invalidate() both force a new run', async () => {
    const p = producer();
    const cache = createStatusCache(p.run, { ttlMs: 60_000, now: () => 0 });
    await cache.get();
    expect(await cache.get({ fresh: true })).toEqual([{ id: 'x', n: 2 }]);
    cache.invalidate();
    expect(await cache.get()).toEqual([{ id: 'x', n: 3 }]);
  });

  it('keeps the last good value when a background refresh throws', async () => {
    let fail = false;
    let now = 0;
    const cache = createStatusCache(
      async () => {
        if (fail) throw new Error('boom');
        return [{ id: 'x', n: 1 }];
      },
      { ttlMs: 1_000, now: () => now },
    );
    await cache.get();
    fail = true;
    now = 5_000;
    expect(await cache.get()).toEqual([{ id: 'x', n: 1 }]);
    await cache.settle();
    expect(await cache.get()).toEqual([{ id: 'x', n: 1 }]);
  });
});

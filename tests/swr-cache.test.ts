import { describe, expect, test } from 'vitest';
import { createSwrCache } from '@/lib/swr-cache';

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('createSwrCache', () => {
  test('loads once and serves the cached value inside the TTL', async () => {
    let loads = 0;
    const cache = createSwrCache(async () => ++loads, { ttlMs: 10_000 });
    expect(await cache.get()).toBe(1);
    expect(await cache.get()).toBe(1);
    expect(loads).toBe(1);
  });

  test('serves the stale value immediately after the TTL and refreshes in the background', async () => {
    let loads = 0;
    let now = 0;
    const cache = createSwrCache(async () => ++loads, { ttlMs: 100, now: () => now });
    expect(await cache.get()).toBe(1);
    now = 200;
    expect(await cache.get()).toBe(1);
    await tick();
    expect(loads).toBe(2);
    expect(await cache.get()).toBe(2);
  });

  test('keeps the last good value when a background refresh throws', async () => {
    let loads = 0;
    let now = 0;
    const cache = createSwrCache(
      async () => {
        loads += 1;
        if (loads > 1) throw new Error('boom');
        return 'ok';
      },
      { ttlMs: 100, now: () => now },
    );
    expect(await cache.get()).toBe('ok');
    now = 200;
    expect(await cache.get()).toBe('ok');
    await tick();
    expect(await cache.get()).toBe('ok');
  });

  test('a single in-flight load is shared by concurrent callers', async () => {
    let loads = 0;
    const cache = createSwrCache(async () => {
      loads += 1;
      await tick();
      return loads;
    }, { ttlMs: 10_000 });
    const [a, b] = await Promise.all([cache.get(), cache.get()]);
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(loads).toBe(1);
  });
});

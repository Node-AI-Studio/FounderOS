import { createStatusCache } from '@/lib/connectors/status-cache';
import { gatherCommsFeed } from '@/lib/comms-feed';
import type { CommsItem } from '@/lib/comms';

/**
 * Stale-while-revalidate wrapper around the unified comms feed.
 *
 * Home, /comms, /funnel, and two API routes each called gatherCommsFeed() on
 * every render, and each call logs into every IMAP inbox, reads the WhatsApp
 * store, and pages Slack. Measured at 4 to 5 s per page on 2026-09-10. The
 * feed is now gathered once at the widest limit any caller uses and sliced
 * per caller; after the TTL the last result is served while a refresh runs in
 * the background. A failed refresh keeps the last good feed.
 */

type Gather = (limit: number) => Promise<CommsItem[]>;

export type CommsFeedCache = {
  read(limit?: number, opts?: { fresh?: boolean }): Promise<CommsItem[]>;
  invalidate(): void;
  settle(): Promise<void>;
};

export function createCommsFeedCache(
  gather: Gather,
  opts: { ttlMs: number; cacheLimit?: number; now?: () => number },
): CommsFeedCache {
  const cacheLimit = opts.cacheLimit ?? 200;
  const cache = createStatusCache(() => gather(cacheLimit), { ttlMs: opts.ttlMs, now: opts.now });
  return {
    async read(limit = 40, o) {
      const items = await cache.get(o);
      return items.slice(0, limit);
    },
    invalidate: () => cache.invalidate(),
    settle: () => cache.settle(),
  };
}

// One cache per server process, same TTL as the connector status cache.
const FEED_TTL_MS = 60_000;
const feedCache = createCommsFeedCache(gatherCommsFeed, { ttlMs: FEED_TTL_MS });

/** Feed for pages and routes. Pass { fresh: true } to bypass the snapshot. */
export function cachedCommsFeed(limit = 40, opts?: { fresh?: boolean }): Promise<CommsItem[]> {
  return feedCache.read(limit, opts);
}

/** Drop the snapshot, for example after an inbox is added through the connect flow. */
export function invalidateCommsFeed(): void {
  feedCache.invalidate();
}

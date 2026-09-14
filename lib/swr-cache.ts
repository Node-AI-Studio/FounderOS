/**
 * Stale-while-revalidate cache for one expensive async value per process.
 *
 * Inside the TTL callers get the cached value. Past it they still get the
 * cached value immediately and a single background refresh runs; a refresh
 * that throws keeps the last good value. Only the very first call (no value
 * yet) waits on the loader, and concurrent first callers share that load.
 */
export type SwrCache<T> = { get(): Promise<T>; peek(): T | undefined };

export function createSwrCache<T>(
  load: () => Promise<T>,
  opts: { ttlMs: number; now?: () => number },
): SwrCache<T> {
  const now = opts.now ?? Date.now;
  let value: { at: number; data: T } | undefined;
  let inflight: Promise<T> | undefined;

  const refresh = (): Promise<T> => {
    if (!inflight) {
      inflight = load()
        .then((data) => {
          value = { at: now(), data };
          return data;
        })
        .finally(() => {
          inflight = undefined;
        });
    }
    return inflight;
  };

  return {
    async get() {
      if (!value) return refresh();
      if (now() - value.at >= opts.ttlMs) {
        refresh().catch(() => {
          /* keep the stale value */
        });
      }
      return value.data;
    },
    peek() {
      return value?.data;
    },
  };
}

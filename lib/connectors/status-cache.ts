/**
 * Stale-while-revalidate cache for connector status.
 *
 * Every board page used to run all 21 live checks (IMAP login, CalDAV report,
 * Slack, Notion, Attio, Stripe, gbrain doctor …) on every render: measured at
 * 5–7 s per page on 2026-09-10. This serves the last known result instantly
 * and refreshes it in the background once it is older than `ttlMs`. A failed
 * refresh keeps the last good value; the honest per-connector `error` state
 * still comes from the checks themselves, never from here.
 */

export type StatusCache<T> = {
  /** Cached value if any, otherwise the first live run. `fresh` forces a run. */
  get(opts?: { fresh?: boolean }): Promise<T>;
  /** Drop the cached value so the next read runs live (after a key is pasted). */
  invalidate(): void;
  /** Await any in-flight refresh — tests and shutdown only. */
  settle(): Promise<void>;
};

export function createStatusCache<T>(
  run: () => Promise<T>,
  opts: { ttlMs: number; now?: () => number },
): StatusCache<T> {
  const now = opts.now ?? Date.now;
  let value: { at: number; data: T } | null = null;
  let inflight: Promise<T> | null = null;

  const refresh = (): Promise<T> => {
    if (inflight) return inflight;
    inflight = run()
      .then((data) => {
        value = { at: now(), data };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  };

  return {
    async get({ fresh = false } = {}) {
      if (fresh || !value) return refresh();
      if (now() - value.at > opts.ttlMs) refresh().catch(() => {}); // stale: serve, revalidate
      return value.data;
    },
    invalidate() {
      value = null;
    },
    async settle() {
      if (inflight) await inflight.catch(() => {});
    },
  };
}

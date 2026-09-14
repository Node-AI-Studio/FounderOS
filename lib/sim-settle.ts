/**
 * Decides when a d3-force simulation has visibly come to rest so the caller
 * can stop it early. Left alone, a sim restarted at alpha 0.35 with
 * alphaDecay 0.015 ticks ~390 times (6s+ at 60fps) while nothing moves, and
 * every tick re-renders the graph. Measured on /brain: the Escape-home glide
 * spent 6s at 116k DOM mutations per 3s; the visible motion lasts ~1s.
 */
export type Velocity = { vx?: number | null; vy?: number | null };

export function createSettleDetector(opts: { maxSpeed: number; maxAlpha: number; quietTicks: number; minAlpha?: number }) {
  let quiet = 0;
  return (nodes: readonly Velocity[], alpha: number): boolean => {
    // cold enough that the remaining drift is sub-pixel regardless of speed
    if (opts.minAlpha !== undefined && alpha < opts.minAlpha) return true;
    if (alpha > opts.maxAlpha) {
      quiet = 0;
      return false;
    }
    for (const n of nodes) {
      if (Math.abs(n.vx ?? 0) > opts.maxSpeed || Math.abs(n.vy ?? 0) > opts.maxSpeed) {
        quiet = 0;
        return false;
      }
    }
    quiet += 1;
    return quiet >= opts.quietTicks;
  };
}

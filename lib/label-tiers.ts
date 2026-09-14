/**
 * Label placement for one horizontal band of nodes (a task row, a worker
 * row). Labels are monospace and fixed in screen pixels, so a dense pillar
 * (20 tasks across the canvas) overlaps them however they are truncated.
 * Stack neighbours onto up to `maxRows` rows so labels in the same row have
 * room; if even the row cap cannot fit the label, shorten it to what fits,
 * never below `minChars`.
 */
export type LabelTier = { dy: number; maxChars: number };

export function planLabelTiers(
  entries: { id: string; x: number; chars: number }[],
  opts: { charWidth: number; rowHeight: number; maxRows: number; minChars: number },
): Map<string, LabelTier> {
  const out = new Map<string, LabelTier>();
  if (entries.length === 0) return out;
  const sorted = entries.slice().sort((a, b) => a.x - b.x);
  let gap = Infinity;
  for (let i = 1; i < sorted.length; i++) gap = Math.min(gap, sorted[i].x - sorted[i - 1].x);
  const longest = Math.max(...sorted.map((e) => e.chars));
  const width = longest * opts.charWidth;
  const rowsNeeded = gap === Infinity || gap <= 0 ? 1 : Math.ceil(width / gap);
  const rows = Math.max(1, Math.min(opts.maxRows, rowsNeeded));
  const fit = gap === Infinity || gap <= 0 ? longest : Math.floor((gap * rows) / opts.charWidth);
  const maxChars = Math.max(opts.minChars, Math.min(longest, fit));
  sorted.forEach((e, i) => out.set(e.id, { dy: (i % rows) * opts.rowHeight, maxChars }));
  return out;
}

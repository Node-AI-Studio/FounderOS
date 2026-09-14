import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// Measured 2026-09-14 on /brain at 2x: the drifting grid backdrop animated
// `background-position`, which Chrome cannot composite, so every frame
// repainted the grid and re-rasterized the whole graph stacked with it
// (5.7s of raster work per 3s of idle; 0.5s with the drift off). The drift
// must run on the compositor: a transform on an oversized pseudo-layer.
const src = readFileSync(join(process.cwd(), 'components/KnowledgeGraph.tsx'), 'utf8');

describe('knowledge graph ambient animation stays off the raster path', () => {
  test('the grid drift animates transform, never background-position', () => {
    const drift = src.match(/@keyframes kg-drift \{[^}]*\}[^}]*\}/)?.[0] ?? '';
    expect(drift).not.toContain('background-position');
    expect(drift).toContain('transform');
  });

  test('the drifting layer is promoted to its own compositor layer', () => {
    const layer = src.match(/\.kg-grid::before \{[^}]*\}/)?.[0] ?? '';
    expect(layer).toContain('will-change: transform');
    expect(layer).toContain('animation: kg-drift');
  });

  test('reduced motion still stops the drift', () => {
    expect(src).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.kg-grid::before \{ animation: none; \}/);
  });
});

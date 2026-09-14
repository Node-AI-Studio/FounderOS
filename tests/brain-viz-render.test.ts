import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { BrainViz } from '@/components/BrainViz';

describe('BrainViz remote count', () => {
  test('prints the count it is given and a placeholder when unknown, never 918 or a version', () => {
    const given = renderToStaticMarkup(createElement(BrainViz, { clusters: [], health: 95, remotePages: 94 }));
    expect(given).toContain('SUPABASE · 94 PAGES');
    expect(given).not.toMatch(/918|V0\.41/);
    const unknown = renderToStaticMarkup(createElement(BrainViz, { clusters: [], health: null, remotePages: null }));
    expect(unknown).toContain('SUPABASE · ? PAGES');
  });
});

// Measured 2026-09-14: CSS transforms on <g> inside one SVG re-rasterize the
// whole SVG every frame (about half the idle raster on /brain after the grid
// fix). Chrome composites SVG *roots*, so each animated ring is its own
// stacked <svg> and the animation class sits on that root.
describe('BrainViz animates SVG roots, not inner groups', () => {
  const html = renderToStaticMarkup(createElement(BrainViz, { clusters: [], health: 95, remotePages: 94 }));
  test('every animated class is on an <svg> element', () => {
    for (const cls of ['brain-sweep', 'brain-ring r3', 'brain-ring r2', 'brain-ring r1', 'brain-core-pulse']) {
      expect(html).toMatch(new RegExp(`<svg[^>]*class="[^"]*\\b${cls}\\b`));
      expect(html).not.toMatch(new RegExp(`<g[^>]*class="[^"]*\\b${cls.split(' ')[0]}\\b`));
    }
  });
  test('the stack keeps its accessible name and the callouts', () => {
    expect(html).toMatch(/role="img"[^>]*aria-label="G-Brain knowledge core"/);
    expect(html).toContain('SUPABASE · 94 PAGES');
  });
});

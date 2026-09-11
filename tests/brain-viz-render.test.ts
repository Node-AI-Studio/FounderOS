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

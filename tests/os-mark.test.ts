import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OsMark } from '@/components/OsMark';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('OS mark branding', () => {
  test('the mark renders the personal monogram with an accessible owner name', () => {
    const markup = renderToStaticMarkup(createElement(OsMark));
    expect(markup).toContain('aria-label="Cristoforo Perrone"');
    expect(markup).toContain('>CP</text>');
    expect(markup).not.toContain('/os-emblem.png');
  });

  test('the emblem is the favicon; the old OS-lettered svg is gone', () => {
    expect(existsSync(join(process.cwd(), 'app/icon.png'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'app/icon.svg'))).toBe(false);
  });

  test('the sidebar is wordmark-only', () => {
    const sidebar = read('components/Sidebar.tsx');
    expect(sidebar).not.toContain('OsMark');
    expect(sidebar).toContain('FOUNDER OS');
  });

  test('the topbar carries the emblem', () => {
    expect(read('components/Topbar.tsx')).toContain('OsMark');
  });
});

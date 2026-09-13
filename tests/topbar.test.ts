import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { Topbar } from '@/components/Topbar';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

test('renders the HELIGHT OS title in the topbar', () => {
  const markup = renderToStaticMarkup(createElement(Topbar));
  expect(markup).toContain('<span>HELIGHT OS</span>');
});

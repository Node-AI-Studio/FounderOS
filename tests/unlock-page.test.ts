import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import UnlockPage from '@/app/unlock/page';

test('renders the HELIGHT OS title on the unlock screen', () => {
  const markup = renderToStaticMarkup(createElement(UnlockPage, {}));
  expect(markup).toMatch(/<h1\b[^>]*>HELIGHT OS<\/h1>/);
});

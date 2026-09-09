import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import UnlockPage from '@/app/unlock/page';

test('renders the NODE AI OS title on the unlock screen', () => {
  const markup = renderToStaticMarkup(createElement(UnlockPage, {}));
  expect(markup).toMatch(/<h1\b[^>]*>NODE AI OS<\/h1>/);
});

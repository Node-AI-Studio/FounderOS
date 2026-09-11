import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  test('renders title, detail and the optional next step with a stable marker', () => {
    const markup = renderToStaticMarkup(
      createElement(EmptyState, { title: 'No roadmap items', detail: 'Nothing has been planned yet.', next: 'Add items in phase 3.' }),
    );
    expect(markup).toContain('data-empty-state');
    expect(markup).toContain('No roadmap items');
    expect(markup).toContain('Nothing has been planned yet.');
    expect(markup).toContain('Add items in phase 3.');
  });

  test('omits the next line when not given', () => {
    const markup = renderToStaticMarkup(createElement(EmptyState, { title: 'Empty', detail: 'Nothing here.' }));
    expect(markup).not.toContain('next');
  });
});

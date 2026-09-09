import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageHeader } from '@/components/PageHeader';

beforeEach(() => {
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('PageHeader', () => {
  it('renders the demo mark when demo seeding is enabled', () => {
    vi.stubEnv('FOUNDER_OS_DEMO_SEED', '1');
    const markup = renderToStaticMarkup(createElement(PageHeader, { title: 'Tasks' }));
    expect(markup).toContain('DEMO DATA');
    expect(markup).toContain('Tasks');
  });

  it.each([undefined, '', '0', 'true', '2'])('omits the demo mark for %s', (value) => {
    vi.stubEnv('FOUNDER_OS_DEMO_SEED', value);
    const markup = renderToStaticMarkup(createElement(PageHeader, { title: 'Tasks' }));
    expect(markup).not.toContain('DEMO DATA');
  });
});

import { afterEach, describe, expect, test, vi } from 'vitest';

// The cookie name must be per instance: two boards behind one hostname on
// different ports share the cookie jar, so a shared name logs each other out.
describe('SESSION_COOKIE', () => {
  afterEach(() => {
    delete process.env.FOUNDER_OS_SESSION_COOKIE;
    vi.resetModules();
  });

  test('defaults to founder_os_session', async () => {
    delete process.env.FOUNDER_OS_SESSION_COOKIE;
    vi.resetModules();
    const { SESSION_COOKIE } = await import('@/lib/auth');
    expect(SESSION_COOKIE).toBe('founder_os_session');
  });

  test('takes its name from FOUNDER_OS_SESSION_COOKIE', async () => {
    process.env.FOUNDER_OS_SESSION_COOKIE = 'founder_os_helight_session';
    vi.resetModules();
    const { SESSION_COOKIE } = await import('@/lib/auth');
    expect(SESSION_COOKIE).toBe('founder_os_helight_session');
  });
});

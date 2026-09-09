import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { paperclipStatus } from '@/lib/connectors/paperclip';

const fetchStub = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
  vi.stubEnv('PAPERCLIP_URL', undefined);
  vi.stubGlobal('fetch', fetchStub);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchStub.mockReset();
});

describe('paperclipStatus', () => {
  it('returns not_configured without making a request when the URL is unset', async () => {
    expect(await paperclipStatus()).toMatchObject({ state: 'not_configured' });
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it('returns error when the service is unreachable', async () => {
    vi.stubEnv('PAPERCLIP_URL', 'http://localhost:3100');
    fetchStub.mockRejectedValue(new TypeError('fetch failed'));
    expect(await paperclipStatus()).toMatchObject({ state: 'error' });
  });

  it('returns error at the deadline when fetch remains pending until aborted', async () => {
    vi.useFakeTimers();
    vi.stubEnv('PAPERCLIP_URL', 'http://localhost:3100');
    // Native AbortSignal.timeout uses internal timers, so bridge it to fake time.
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockImplementation((delay) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), delay);
      return controller.signal;
    });
    fetchStub.mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
    }));

    const settled = vi.fn();
    const result = paperclipStatus().then((status) => {
      settled(status);
      return status;
    });

    expect(timeout).toHaveBeenCalledWith(5000);
    await vi.advanceTimersByTimeAsync(4999);
    expect(settled).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toHaveBeenCalledWith(expect.objectContaining({ state: 'error' }));
    expect(await result).toMatchObject({ state: 'error' });
  });

  it.each(['http://localhost:3100', 'http://localhost:3100/'])(
    'returns connected on a 200 from the health endpoint at %s', async (url) => {
      vi.stubEnv('PAPERCLIP_URL', url);
      fetchStub.mockResolvedValue(new Response(null, { status: 200 }));
      expect(await paperclipStatus()).toMatchObject({
        id: 'paperclip', name: 'Paperclip', kind: 'orchestration', state: 'connected',
      });
      expect(fetchStub).toHaveBeenCalledWith('http://localhost:3100/api/health', {
        signal: expect.any(AbortSignal), cache: 'no-store',
      });
    },
  );

  it.each([204, 401, 503])('returns error for HTTP %s', async (status) => {
    vi.stubEnv('PAPERCLIP_URL', 'http://localhost:3100');
    fetchStub.mockResolvedValue(new Response(null, { status }));
    expect(await paperclipStatus()).toMatchObject({ state: 'error' });
  });

  it('returns error without fetching an invalid URL', async () => {
    vi.stubEnv('PAPERCLIP_URL', 'invalid');
    expect(await paperclipStatus()).toMatchObject({ state: 'error' });
    expect(fetchStub).not.toHaveBeenCalled();
  });
});

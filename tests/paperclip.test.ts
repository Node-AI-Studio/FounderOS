import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { paperclipStatus } from '@/lib/connectors/paperclip';

const fetchStub = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
  vi.stubEnv('PAPERCLIP_URL', undefined);
  vi.stubGlobal('fetch', fetchStub);
});

afterEach(() => {
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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { paperclipWorkSummary } from '@/lib/connectors/paperclip';

const fetchStub = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('FOUNDER_OS_DB', ':memory:');
  vi.stubEnv('PAPERCLIP_URL', 'http://localhost:3100/');
  vi.stubEnv('PAPERCLIP_API_KEY', 'test-key');
  vi.stubEnv('PAPERCLIP_COMPANY_ID', 'company-1');
  vi.stubGlobal('fetch', fetchStub);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchStub.mockReset();
});

describe('paperclipWorkSummary', () => {
  it.each(['PAPERCLIP_URL', 'PAPERCLIP_API_KEY', 'PAPERCLIP_COMPANY_ID'])(
    'does not fetch when %s is unset', async (key) => {
      vi.stubEnv(key, undefined);
      expect(await paperclipWorkSummary()).toEqual({ state: 'not_configured' });
      expect(fetchStub).not.toHaveBeenCalled();
    },
  );

  it('reports HTTP 401', async () => {
    fetchStub.mockResolvedValue(new Response(null, { status: 401 }));
    expect(await paperclipWorkSummary()).toEqual({
      state: 'error', detail: expect.stringContaining('401'),
    });
  });

  it.each([{}, [{ status: 42 }], [{}], [{ status: '' }]].map((body) => [body]))(
    'rejects malformed issue bodies: %j', async (body) => {
      fetchStub.mockResolvedValue(Response.json(body));
      expect(await paperclipWorkSummary()).toEqual({ state: 'error', detail: expect.any(String) });
    },
  );

  it('reports invalid JSON and network errors', async () => {
    fetchStub.mockResolvedValueOnce(new Response('invalid json'));
    expect(await paperclipWorkSummary()).toMatchObject({ state: 'error' });
    fetchStub.mockRejectedValueOnce(new TypeError('fetch failed'));
    expect(await paperclipWorkSummary()).toMatchObject({ state: 'error' });
  });

  it('counts three statuses and ignores unused fields', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    fetchStub.mockResolvedValue(Response.json([
      { status: 'todo', title: 'First task' },
      { status: 'in_progress', unused: { anything: true } },
      { status: 'todo' },
      { status: 'done' },
    ]));
    expect(await paperclipWorkSummary()).toEqual({
      state: 'connected', counts: { todo: 2, in_progress: 1, done: 1 },
    });
    expect(fetchStub).toHaveBeenCalledWith('http://localhost:3100/api/companies/company-1/issues', {
      headers: { Authorization: 'Bearer test-key' },
      signal: expect.any(AbortSignal), cache: 'no-store',
    });
    expect(timeout).toHaveBeenCalledWith(5000);
  });

  it('returns empty counts for no issues', async () => {
    fetchStub.mockResolvedValue(Response.json([]));
    expect(await paperclipWorkSummary()).toEqual({ state: 'connected', counts: {} });
  });

  it('rejects an invalid URL without fetching', async () => {
    vi.stubEnv('PAPERCLIP_URL', 'invalid');
    expect(await paperclipWorkSummary()).toMatchObject({ state: 'error' });
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it('exposes the summary at GET /api/paperclip', async () => {
    const { GET } = await import('@/app/api/paperclip/route');
    fetchStub.mockResolvedValue(Response.json([{ status: 'done' }]));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ state: 'connected', counts: { done: 1 } });
  });
});

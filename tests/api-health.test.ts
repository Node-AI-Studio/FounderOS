import { afterEach, describe, expect, test, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';
import { HealthSchema } from '@/lib/schemas';
import { middleware } from '@/middleware';

vi.stubEnv('FOUNDER_OS_DB', ':memory:');

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('GET /api/health', () => {
  test('returns a validated 200 response with the current ISO time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-10T04:00:00.000Z'));
    const response = await GET();
    expect(response.status).toBe(200);
    const body = HealthSchema.parse(await response.json());
    expect(body).toEqual({ ok: true, service: 'founderos', time: '2026-09-10T04:00:00.000Z' });
    expect(Number.isNaN(new Date(body.time).getTime())).toBe(false);
  });

  test('passes the middleware without authentication', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('FOUNDER_OS_ACCESS_TOKEN', 'health-test-access-token');
    const response = middleware(new NextRequest('http://localhost/api/health'));
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});

import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/unlock/route';

const TOKEN = 'fake-token-for-unlock-cookie-test';

function formPost(url: string) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token: TOKEN, next: '/' }).toString(),
  });
}

describe('unlock session cookie', () => {
  it('is not marked Secure when the operator is on plain http', async () => {
    process.env.FOUNDER_OS_ACCESS_TOKEN = TOKEN;
    const res = await POST(formPost('http://localhost:4100/api/unlock'));
    expect(res.status).toBe(303);
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('founder_os_session=');
    expect(cookie).not.toMatch(/;\s*Secure/i);
  });

  it('is marked Secure over https', async () => {
    process.env.FOUNDER_OS_ACCESS_TOKEN = TOKEN;
    const res = await POST(formPost('https://founderos.example.ts.net/api/unlock'));
    expect(res.status).toBe(303);
    expect(res.headers.get('set-cookie') ?? '').toMatch(/;\s*Secure/i);
  });
});

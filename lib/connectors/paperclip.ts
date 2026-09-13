import { z } from 'zod';
import type { ConnectorStatus } from '@/lib/connectors/types';

const paperclipUrlSchema = z.string().url().regex(/^https?:\/\//i);

export async function paperclipStatus(
  env: Record<string, string | undefined> = process.env,
): Promise<ConnectorStatus> {
  const base = { id: 'paperclip', name: 'Paperclip', kind: 'orchestration' } as const;
  if (!env.PAPERCLIP_URL) {
    return { ...base, state: 'not_configured', detail: 'Set PAPERCLIP_URL to enable the health check.' };
  }

  const url = paperclipUrlSchema.safeParse(env.PAPERCLIP_URL);
  if (!url.success) {
    return { ...base, state: 'error', detail: 'PAPERCLIP_URL must be a valid HTTP or HTTPS URL.' };
  }

  try {
    const response = await fetch(`${url.data.replace(/\/+$/, '')}/api/health`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    return response.status === 200
      ? { ...base, state: 'connected', detail: 'Paperclip health check passed.' }
      : { ...base, state: 'error', detail: `Paperclip health check returned HTTP ${response.status}.` };
  } catch {
    return { ...base, state: 'error', detail: 'Paperclip health check could not reach the service.' };
  }
}

const paperclipIssuesSchema = z.array(z.object({ status: z.string().min(1) }));

export type PaperclipWorkSummary =
  | { state: 'not_configured' }
  | { state: 'connected'; counts: Record<string, number> }
  | { state: 'error'; detail: string };

export async function paperclipWorkSummary(
  env: Record<string, string | undefined> = process.env,
): Promise<PaperclipWorkSummary> {
  if (!env.PAPERCLIP_URL || !env.PAPERCLIP_API_KEY || !env.PAPERCLIP_COMPANY_ID) {
    return { state: 'not_configured' };
  }

  const url = paperclipUrlSchema.safeParse(env.PAPERCLIP_URL);
  if (!url.success) {
    return { state: 'error', detail: 'PAPERCLIP_URL must be a valid HTTP or HTTPS URL.' };
  }

  try {
    const base = url.data.replace(/\/+$/, '').replace(/\/api$/, '');
    const companyId = encodeURIComponent(env.PAPERCLIP_COMPANY_ID);
    const response = await fetch(`${base}/api/companies/${companyId}/issues`, {
      headers: { Authorization: `Bearer ${env.PAPERCLIP_API_KEY}` },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!response.ok) {
      return { state: 'error', detail: `Paperclip issues request returned HTTP ${response.status}.` };
    }
    const issues = paperclipIssuesSchema.safeParse(await response.json());
    if (!issues.success) {
      return { state: 'error', detail: 'Paperclip returned an invalid issues response.' };
    }
    const counts = new Map<string, number>();
    for (const { status } of issues.data) {
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }
    return { state: 'connected', counts: Object.fromEntries(counts) };
  } catch {
    return { state: 'error', detail: 'Paperclip issues request failed or returned invalid JSON.' };
  }
}

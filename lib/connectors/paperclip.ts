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

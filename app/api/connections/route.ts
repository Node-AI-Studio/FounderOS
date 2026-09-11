import { NextResponse } from 'next/server';
import { allConnectorStatuses } from '@/lib/connectors';

export const dynamic = 'force-dynamic';

/** Cached snapshot by default (see lib/connectors/status-cache.ts); `?fresh=1`
 *  forces a live run of every check, for the board's manual refresh. */
export async function GET(req: Request) {
  const fresh = new URL(req.url).searchParams.get('fresh') === '1';
  const connections = await allConnectorStatuses({ fresh });
  return NextResponse.json({ connections });
}

import { NextResponse } from 'next/server';
import { cachedCommsFeed } from '@/lib/comms-feed-cache';

export const dynamic = 'force-dynamic';

/** `?fresh=1` bypasses the snapshot and gathers live. */
export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.get('fresh') === '1';
  const feed = await cachedCommsFeed(40, { fresh });
  return NextResponse.json({ feed });
}

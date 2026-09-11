import { NextResponse } from 'next/server';
import { getDb } from '@/lib/data';
import { safeEqual } from '@/lib/auth';
import { parseManyChatWebhook } from '@/lib/connectors/manychat-webhook';

export const dynamic = 'force-dynamic';

/**
 * ManyChat "External Request" ingest. ManyChat's API cannot be polled for DMs,
 * so this push endpoint is how the /social Instagram DM inbox goes live: point
 * a ManyChat automation's External Request (POST) at this URL with a JSON body
 * carrying the contact and message. Each message upserts by id, so replays do
 * not duplicate.
 *
 * This route sits outside the operator auth gate (lib/auth.ts PUBLIC_PATHS),
 * so it must gate itself: MANYCHAT_WEBHOOK_SECRET is required. With no secret
 * the endpoint is closed (503), not open. The header is compared in constant
 * time. There is no GET: a public health check leaked whether the secret was
 * set and how many DMs were stored.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET ?? '';
  if (secret.length === 0) {
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }
  const presented = request.headers.get('x-manychat-secret') ?? '';
  if (!safeEqual(presented, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const message = parseManyChatWebhook(raw);
  if (!message) {
    return NextResponse.json({ error: 'payload missing a subscriber id' }, { status: 400 });
  }

  getDb().social.upsertDmMessage(message);
  return NextResponse.json({ ok: true, id: message.id, subscriberId: message.subscriberId });
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/data';
import { funnelSummary, splitFunnelJourneys } from '@/lib/funnel';
import { attioFunnelJourneys } from '@/lib/funnel-live';
import { FunnelVentureSchema, type FunnelVenture } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('venture');
  let venture: FunnelVenture | undefined;
  if (raw !== null) {
    const parsed = FunnelVentureSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: `unknown venture: ${raw}` }, { status: 400 });
    }
    venture = parsed.data;
  }
  const now = new Date();
  // Live Attio when available (venture from the deal-name classifier); the
  // local table otherwise. Quiet >90d splits into `archived`.
  const attioLive = await attioFunnelJourneys(now);
  const liveJourneys = attioLive?.journeys ?? [];
  const isLive = liveJourneys.length > 0;
  const all = isLive ? liveJourneys.filter((j) => !venture || j.venture === venture) : getDb().funnel.journeys(venture);
  const { active, archived } = splitFunnelJourneys(all, now);
  return NextResponse.json({
    summary: funnelSummary(active),
    journeys: active,
    archived,
    source: isLive ? 'attio' : 'local',
    ...(isLive ? { excluded: attioLive?.closedLost ?? 0, total: attioLive?.total ?? 0 } : {}),
  });
}

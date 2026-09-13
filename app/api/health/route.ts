import { NextResponse } from 'next/server';
import { HealthSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(HealthSchema.parse({
    ok: true,
    service: 'founderos',
    time: new Date().toISOString(),
  }));
}

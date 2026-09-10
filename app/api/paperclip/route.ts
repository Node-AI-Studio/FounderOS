import { NextResponse } from 'next/server';
import { paperclipWorkSummary } from '@/lib/connectors/paperclip';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await paperclipWorkSummary());
}

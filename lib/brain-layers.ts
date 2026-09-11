import type { BrainOverview, GBrainStats } from '@/lib/connectors/gbrain';

export type BrainLayer = { name: string; sub: string; val: string; state: 'connected' | 'available' | 'error' };

/**
 * The storage-layer strip on /brain. Every value comes from `gbrain doctor`
 * (overview.doctor), the store walk (overview.store) or `gbrain stats`.
 * Unknown is rendered as unknown; nothing defaults to LIVE.
 */
export function brainLayers(overview: BrainOverview, stats: GBrainStats | null, storeShort: string): BrainLayer[] {
  const { store, doctor } = overview;
  const supabaseCheck = doctor.checks.find((c) => /supabase|database|postgres/i.test(c.name));
  const embedCheck = doctor.checks.find((c) => /zero|embed/i.test(c.name));
  const remoteDown = supabaseCheck ? supabaseCheck.status !== 'ok' : !doctor.connected;
  const counts = stats ? `${stats.pages} pages / ${stats.chunks} chunks · ${stats.embedded} embedded` : 'counts unavailable';
  return [
    {
      name: 'gbrain CLI',
      sub: '~/.bun/bin/gbrain · doctor --fast',
      val: doctor.connected ? 'LIVE' : 'UNREACHABLE',
      state: doctor.connected ? 'connected' : 'error',
    },
    {
      name: 'brain-store/',
      sub: `${storeShort} · markdown knowledge`,
      val: `${store.totalFiles} pages`,
      state: store.totalFiles > 0 ? 'connected' : 'available',
    },
    {
      name: 'ZeroEntropy',
      sub: 'hybrid-search embeddings · key in ~/.config/knowledge',
      val: embedCheck ? (embedCheck.status === 'ok' ? 'LIVE' : embedCheck.status.toUpperCase()) : 'UNKNOWN',
      state: embedCheck && embedCheck.status === 'ok' ? 'connected' : 'available',
    },
    {
      name: 'Supabase Second Brain',
      sub: `${counts} · free tier idle-pause`,
      val: !doctor.connected ? 'UNREACHABLE' : remoteDown ? 'PAUSED' : 'LIVE',
      state: !doctor.connected ? 'error' : remoteDown ? 'available' : 'connected',
    },
  ];
}

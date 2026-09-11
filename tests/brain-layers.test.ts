import { describe, expect, test } from 'vitest';
import { brainLayers } from '@/lib/brain-layers';
import type { BrainOverview, GBrainStats } from '@/lib/connectors/gbrain';

const overview = (checks: BrainOverview['doctor']['checks'], connected = true): BrainOverview => ({
  store: { path: '/tmp/store', totalFiles: 94, folders: [] },
  doctor: { connected, status: connected ? 'ok' : 'unreachable', healthScore: connected ? 95 : null, checks, detail: '' },
});
const stats: GBrainStats = { pages: 94, chunks: 183, embedded: 182, byType: [] };

describe('brainLayers', () => {
  test('embeddings are UNKNOWN, not LIVE, when doctor has no embedding check', () => {
    const layers = brainLayers(overview([]), stats, '~/store');
    const embed = layers.find((l) => l.name === 'ZeroEntropy')!;
    expect(embed.val).toBe('UNKNOWN');
    expect(embed.state).toBe('available');
  });

  test('embeddings follow the doctor check when present', () => {
    const ok = brainLayers(overview([{ name: 'embeddings', status: 'ok', message: '' }]), stats, '~/store');
    expect(ok.find((l) => l.name === 'ZeroEntropy')!.val).toBe('LIVE');
    const bad = brainLayers(overview([{ name: 'embeddings', status: 'warning', message: '' }]), stats, '~/store');
    expect(bad.find((l) => l.name === 'ZeroEntropy')!.val).toBe('WARNING');
  });

  test('the remote row shows gbrain stats counts and never a hardcoded number', () => {
    const withStats = brainLayers(overview([]), stats, '~/store').find((l) => l.name === 'Supabase Second Brain')!;
    expect(withStats.sub).toContain('94 pages');
    expect(withStats.sub).toContain('183 chunks');
    const noStats = brainLayers(overview([], false), null, '~/store').find((l) => l.name === 'Supabase Second Brain')!;
    expect(noStats.sub).toContain('counts unavailable');
    expect(noStats.val).toBe('UNREACHABLE');
    for (const l of brainLayers(overview([]), null, '~/store')) {
      expect(l.sub).not.toMatch(/918|11k|0\.41/);
    }
  });

  test('the CLI row carries no version claim', () => {
    const cli = brainLayers(overview([]), stats, '~/store').find((l) => l.name === 'gbrain CLI')!;
    expect(cli.sub).not.toMatch(/v\d/);
  });
});

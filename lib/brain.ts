/**
 * G-Brain adapter. The real provider (default) shells out to the installed
 * gbrain CLI (brain-store markdown + Supabase + ZeroEntropy hybrid search)
 * with a local brain-store fallback when the database is unreachable.
 * BRAIN_PROVIDER=stub selects the inert provider for tests.
 */
import { createGBrainProvider, createSeededBrainProvider, type GBrainProvider } from '@/lib/connectors/gbrain';

export type BrainStatus = {
  connected: boolean;
  provider: string;
  detail: string;
};

export type BrainSearchResult = {
  title: string;
  snippet: string;
  source: string;
};

export interface BrainProvider {
  name: string;
  status(): Promise<BrainStatus>;
  search(query: string): Promise<BrainSearchResult[]>;
}

const stubProvider: BrainProvider = {
  name: 'stub',
  async status() {
    return {
      connected: false,
      provider: 'stub',
      detail:
        'G Brain is not wired yet. Implement a BrainProvider in lib/brain.ts and set BRAIN_PROVIDER to activate it.',
    };
  },
  async search() {
    return [];
  },
};

export function getBrainProvider(): BrainProvider {
  const name = process.env.BRAIN_PROVIDER ?? 'gbrain';
  if (name === 'stub') return stubProvider;
  if (name === 'seeded') return createSeededBrainProvider();
  return createGBrainProvider();
}

/**
 * Pages that need the richer GBrainProvider surface (overview/stats/etc, not
 * just status/search) should call this instead of hardcoding
 * createGBrainProvider() directly, so BRAIN_PROVIDER=seeded swaps them onto
 * the illustrative demo provider too.
 */
export function getBrainOverviewProvider(): GBrainProvider {
  return process.env.BRAIN_PROVIDER === 'seeded' ? createSeededBrainProvider() : createGBrainProvider();
}

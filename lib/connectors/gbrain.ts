import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { BrainProvider, BrainSearchResult, BrainStatus } from '@/lib/brain';

export type ExecResult = { stdout: string; stderr: string; code: number };
export type ExecFn = (cmd: string, args: string[], stdin?: string) => Promise<ExecResult>;

const GBRAIN_BIN = process.env.GBRAIN_BIN ?? path.join(os.homedir(), '.bun', 'bin', 'gbrain');
const DEFAULT_STORE = process.env.GBRAIN_STORE ?? path.join(os.homedir(), 'knowledge', 'brain-store');
const READ_TIMEOUT_MS = 15_000;
const WRITE_TIMEOUT_MS = 60_000;

/**
 * Reads (doctor/query/stats) must fail fast so a paused Supabase never hangs a
 * page render — 15s → local fallback. Writes (capture/import/embed) embed
 * synchronously through ZeroEntropy + Supabase and run 13–24s+, so they get a
 * generous 60s or execFile kills them mid-embed (SIGTERM).
 */
export function execTimeoutFor(args: string[]): number {
  const cmd = args[0];
  return cmd === 'capture' || cmd === 'import' || cmd === 'embed' ? WRITE_TIMEOUT_MS : READ_TIMEOUT_MS;
}

const defaultExec: ExecFn = (cmd, args, stdin) =>
  new Promise((resolve) => {
    const child = execFile(
      cmd,
      args,
      {
        timeout: execTimeoutFor(args),
        maxBuffer: 4 * 1024 * 1024,
        env: { ...process.env, GBRAIN_DISABLE_DIRECT_POOL: process.env.GBRAIN_DISABLE_DIRECT_POOL ?? '1' },
      },
      (err, stdout, stderr) => {
        resolve({
          stdout: stdout?.toString() ?? '',
          // `||` not `??`: on timeout/kill stderr is an empty string, so surface
          // the real error (e.g. "Command failed … SIGTERM") instead of losing it.
          stderr: stderr?.toString() || (err ? err.message : ''),
          code: err ? 1 : 0,
        });
      },
    );
    if (stdin !== undefined) {
      child.stdin?.write(stdin);
      child.stdin?.end();
    }
  });

function walkMarkdown(dir: string, files: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMarkdown(full, files);
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

/**
 * Ranked search over the local brain clone. The store is the same 113-odd
 * pages the database holds, so this answers a `gbrain ›` prompt in a few
 * milliseconds where the CLI's vector arm takes 10s+ from this machine.
 * Score: any term qualifies a page; slug and title hits outweigh body hits,
 * covering every term earns a bonus, and more mentions rank higher.
 */
function localSearch(storePath: string, query: string, limit = 8): BrainSearchResult[] {
  const terms = Array.from(new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 1)));
  if (terms.length === 0) return [];
  const scored: { score: number; result: BrainSearchResult }[] = [];
  for (const file of walkMarkdown(storePath)) {
    let content: string;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const slug = path.relative(storePath, file).replace(/\.md$/, '').split(path.sep).join('/');
    const lines = content.split('\n');
    const title = (lines.find((l) => l.startsWith('# ')) ?? '').slice(2).toLowerCase();
    const body = content.toLowerCase();
    const slugText = slug.toLowerCase().replace(/[-_/]/g, ' ');
    let score = 0;
    let covered = 0;
    let bestLine: { hits: number; text: string } | null = null;
    for (const term of terms) {
      const bodyHits = body.split(term).length - 1;
      if (bodyHits === 0 && !slugText.includes(term)) continue;
      covered += 1;
      if (slugText.includes(term)) score += 20;
      if (title.includes(term)) score += 10;
      score += Math.min(bodyHits, 5);
    }
    if (covered === 0) continue;
    if (covered === terms.length) score += 15;
    // skip YAML frontmatter so snippets come from prose, not `title:` keys
    const bodyStart = lines[0] === '---' ? lines.indexOf('---', 1) + 1 : 0;
    for (const line of lines.slice(bodyStart)) {
      const lower = line.toLowerCase();
      if (lower.startsWith('# ') || !line.trim()) continue;
      const hits = terms.filter((t) => lower.includes(t)).length;
      if (hits > 0 && (!bestLine || hits > bestLine.hits)) bestLine = { hits, text: line.trim() };
    }
    scored.push({
      score,
      result: { title: slug, snippet: (bestLine?.text ?? title).slice(0, 240), source: 'brain-store' },
    });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
    .slice(0, limit)
    .map((s) => s.result);
}

/** Read every markdown page in the store as { path (posix-relative), content }. */
export function readStoreNotes(storePath: string = DEFAULT_STORE): { path: string; content: string }[] {
  const notes: { path: string; content: string }[] = [];
  for (const file of walkMarkdown(storePath)) {
    try {
      notes.push({
        path: path.relative(storePath, file).split(path.sep).join('/'),
        content: fs.readFileSync(file, 'utf8'),
      });
    } catch {
      // unreadable file — skip it
    }
  }
  return notes.sort((a, b) => a.path.localeCompare(b.path));
}

export type DoctorCheck = { name: string; status: string; message: string };

export type BrainOverview = {
  store: {
    path: string;
    totalFiles: number;
    folders: { name: string; files: number }[];
  };
  doctor: {
    connected: boolean;
    status: string;
    healthScore: number | null;
    checks: DoctorCheck[];
    detail: string;
  };
};

export type GBrainStats = {
  pages: number;
  chunks: number;
  embedded: number;
  byType: { type: string; count: number }[];
};

export type CaptureInput = { text: string; title?: string; type?: string; slug?: string };
export type CaptureOutcome =
  | { ok: true; slug: string; contentHash: string }
  | { ok: false; error: string };

/** Parse the plain-text output of `gbrain stats` into structured counts. */
export function parseGbrainStats(text: string): GBrainStats {
  const num = (label: string): number => {
    const m = text.match(new RegExp(`${label}:\\s*(\\d+)`, 'i'));
    return m ? Number(m[1]) : 0;
  };
  const byType: { type: string; count: number }[] = [];
  const afterHeader = text.split(/By type:/i)[1] ?? '';
  for (const line of afterHeader.split('\n')) {
    const m = line.match(/^\s+([\w-]+):\s*(\d+)\s*$/);
    if (m) byType.push({ type: m[1], count: Number(m[2]) });
  }
  return { pages: num('Pages'), chunks: num('Chunks'), embedded: num('Embedded'), byType };
}

export type GBrainProvider = BrainProvider & {
  localStats(): Promise<{ markdownFiles: number; storePath: string }>;
  overview(): Promise<BrainOverview>;
  stats(): Promise<GBrainStats | null>;
  capture(input: CaptureInput): Promise<CaptureOutcome>;
};

function storeFolders(storePath: string): { name: string; files: number }[] {
  const counts = new Map<string, number>();
  for (const file of walkMarkdown(storePath)) {
    const rel = path.relative(storePath, file);
    const top = rel.includes(path.sep) ? rel.split(path.sep)[0] : '(root)';
    counts.set(top, (counts.get(top) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, files]) => ({ name, files }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type GBrainProviderOptions = {
  exec?: ExecFn;
  storePath?: string;
  /** Route `search()` through the CLI's vector arm (10s+ from this machine). Default: local ranked search. */
  vectorSearch?: boolean;
  /** gbrain source to pin reads to; an unscoped `stats` resolves the federated view and costs ~4s. */
  sourceId?: string;
};

export function createGBrainProvider(opts: GBrainProviderOptions = {}): GBrainProvider {
  const exec = opts.exec ?? defaultExec;
  const storePath = opts.storePath ?? DEFAULT_STORE;
  const vectorSearch = opts.vectorSearch ?? process.env.GBRAIN_VECTOR_SEARCH === '1';
  const sourceId = opts.sourceId ?? process.env.GBRAIN_SOURCE_ID ?? 'brain';

  return {
    name: 'gbrain',

    async status(): Promise<BrainStatus> {
      const localFiles = walkMarkdown(storePath).length;
      const result = await exec(GBRAIN_BIN, ['doctor', '--json', '--fast']);
      if (result.code === 0 && result.stdout.trim()) {
        try {
          const doctor = JSON.parse(result.stdout) as { status?: string; health_score?: number };
          return {
            connected: true,
            provider: 'gbrain',
            detail: `gbrain ${doctor.status ?? 'ok'} · health ${doctor.health_score ?? '?'}/100 · ${localFiles} local pages in brain-store`,
          };
        } catch {
          // fall through to the error path below
        }
      }
      const firstError = (result.stderr || result.stdout).split('\n').find(Boolean) ?? 'gbrain CLI unavailable';
      return {
        connected: false,
        provider: 'gbrain',
        detail: `${firstError.trim().slice(0, 200)} · local fallback active (${localFiles} markdown pages)`,
      };
    },

    async search(query: string): Promise<BrainSearchResult[]> {
      if (!vectorSearch) return localSearch(storePath, query);
      const result = await exec(GBRAIN_BIN, ['query', query, '--no-expand']);
      if (result.code === 0 && result.stdout.trim() && !/cannot connect/i.test(result.stdout)) {
        return result.stdout
          .split('\n')
          .filter(Boolean)
          .slice(0, 8)
          .map((line) => {
            const [slug, ...rest] = line.split(' -- ');
            return { title: slug.trim(), snippet: rest.join(' -- ').trim() || slug.trim(), source: 'gbrain' };
          });
      }
      return localSearch(storePath, query);
    },

    async localStats() {
      return { markdownFiles: walkMarkdown(storePath).length, storePath };
    },

    async overview(): Promise<BrainOverview> {
      const folders = storeFolders(storePath);
      const store = {
        path: storePath,
        totalFiles: folders.reduce((sum, f) => sum + f.files, 0),
        folders,
      };

      const result = await exec(GBRAIN_BIN, ['doctor', '--json', '--fast']);
      if (result.code === 0 && result.stdout.trim()) {
        try {
          const doctor = JSON.parse(result.stdout) as {
            status?: string;
            health_score?: number;
            checks?: { name?: string; status?: string; message?: string }[];
          };
          return {
            store,
            doctor: {
              connected: true,
              status: doctor.status ?? 'ok',
              healthScore: doctor.health_score ?? null,
              checks: (doctor.checks ?? []).map((c) => ({
                name: c.name ?? 'unknown',
                status: c.status ?? 'unknown',
                message: c.message ?? '',
              })),
              detail: `gbrain ${doctor.status ?? 'ok'} · health ${doctor.health_score ?? '?'}/100`,
            },
          };
        } catch {
          // fall through to the disconnected path below
        }
      }
      const firstError = (result.stderr || result.stdout).split('\n').find(Boolean) ?? 'gbrain CLI unavailable';
      return {
        store,
        doctor: {
          connected: false,
          status: 'unreachable',
          healthScore: null,
          checks: [],
          detail: firstError.trim().slice(0, 200),
        },
      };
    },

    async stats(): Promise<GBrainStats | null> {
      const result = await exec(GBRAIN_BIN, ['stats', '--source-id', sourceId]);
      if (result.code === 0 && /Pages:/i.test(result.stdout)) {
        return parseGbrainStats(result.stdout);
      }
      return null;
    },

    async capture(input: CaptureInput): Promise<CaptureOutcome> {
      const title = input.title?.trim();
      const body = input.text.trim();
      if (!body) return { ok: false, error: 'nothing to capture (empty content)' };
      const content = title ? `# ${title}\n\n${body}` : body;

      const args = ['capture', '--stdin', '--json'];
      if (input.type) args.push('--type', input.type);
      if (input.slug) args.push('--slug', input.slug);

      const result = await exec(GBRAIN_BIN, args, content);
      if (result.code === 0 && result.stdout.trim()) {
        try {
          const receipt = JSON.parse(result.stdout) as { slug?: string; content_hash?: string };
          if (receipt.slug) {
            return { ok: true, slug: receipt.slug, contentHash: receipt.content_hash ?? '' };
          }
        } catch {
          // malformed JSON — fall through to the honest error path
        }
      }
      const err = (result.stderr || result.stdout).split('\n').find(Boolean) ?? 'gbrain capture failed';
      return { ok: false, error: err.trim().slice(0, 200) };
    },
  };
}

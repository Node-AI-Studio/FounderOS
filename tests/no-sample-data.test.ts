import { execFileSync } from 'node:child_process';
import { describe, expect, test } from 'vitest';

/**
 * Roadmap 2.9: no placeholder figures in live code. Whole-word "sample" is the
 * marker every placeholder set carried; "sampled" (a real algorithm word in
 * memory-core, growth and BrainViz) is excluded by the word match.
 */
describe('no sample data in live code', () => {
  test('no whole-word "sample" in lib, app or components', () => {
    let out = '';
    try {
      out = execFileSync('grep', ['-rniw', 'sample', 'lib', 'app', 'components'], { encoding: 'utf8' });
    } catch (err) {
      const e = err as { status?: number; stdout?: string };
      if (e.status !== 1) throw err; // exit 1 means no match
      out = e.stdout ?? '';
    }
    expect(out.trim(), out).toBe('');
  });
});

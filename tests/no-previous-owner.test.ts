import { execFileSync } from 'node:child_process';
import { describe, expect, test } from 'vitest';

/**
 * Roadmap 2.6: the previous owner's name must not survive in live code.
 * lib/seed.ts is the demo fixture and is excluded; `-w` keeps identifiers
 * such as `totalExpenses` from matching.
 */
describe('previous owner sweep', () => {
  test('no whole-word Alex in lib, app or components outside the seed fixture', () => {
    let out = '';
    try {
      out = execFileSync('grep', ['-rniw', '--exclude=seed.ts', 'alex', 'lib', 'app', 'components'], { encoding: 'utf8' });
    } catch (err) {
      const e = err as { status?: number; stdout?: string };
      if (e.status !== 1) throw err; // exit 1 means no match
      out = e.stdout ?? '';
    }
    expect(out.trim(), out).toBe('');
  });
});

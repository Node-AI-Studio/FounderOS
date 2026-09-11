import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');

describe('setup documentation', () => {
  it('.env.example names the demo seed flag', () => {
    expect(read('.env.example')).toMatch(/^FOUNDER_OS_DEMO_SEED=/m);
  });

  it('README quick start names the demo seed flag', () => {
    expect(read('README.md')).toContain('FOUNDER_OS_DEMO_SEED=1');
  });

  it('README does not promise Node 18', () => {
    expect(read('README.md')).not.toContain('Node 18+');
  });

  it('package.json pins a Node range that includes the CI version', () => {
    const pkg = JSON.parse(read('package.json')) as { engines?: { node?: string } };
    expect(pkg.engines?.node).toBe('>=20 <25');
  });
});

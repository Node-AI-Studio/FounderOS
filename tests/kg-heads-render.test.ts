import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

/**
 * The C-suite ring (2026-09-14): the pillar node is the executive, so the
 * /brain graph must not advertise a separate "Dept head" node type any more.
 * The radial graph is client-only (ssr:false) so this contract lives at
 * source level; the node shape itself is covered in knowledge-graph.test.ts.
 */
describe('C-suite render wiring', () => {
  test('KnowledgeGraph labels the pillar kind as the C-suite and drops the head legend chip', () => {
    const src = read('components/KnowledgeGraph.tsx');
    expect(src).toContain("label: 'C-suite'");
    expect(src).not.toContain("label: 'Dept head'");
  });

  test('neural strand view names the pillar layer as the C-suite', () => {
    expect(read('lib/neural-layout.ts')).toContain("name: 'HL 3 · C-SUITE'");
  });
});

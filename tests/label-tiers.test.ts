import { describe, expect, test } from 'vitest';
import { planLabelTiers } from '@/lib/label-tiers';

const band = (n: number, gap: number, chars = 20) =>
  Array.from({ length: n }, (_, i) => ({ id: `t${i}`, x: i * gap, chars }));

describe('planLabelTiers', () => {
  test('a sparse band keeps one row and full labels', () => {
    const plan = planLabelTiers(band(5, 200), { charWidth: 5.3, rowHeight: 11, maxRows: 4, minChars: 8 });
    for (const p of plan.values()) {
      expect(p.dy).toBe(0);
      expect(p.maxChars).toBe(20);
    }
  });

  test('a dense band stacks rows so neighbours in a row no longer touch', () => {
    // 20-char labels at 5.3 per char are 106 wide; 40 apart needs 3 rows
    const plan = planLabelTiers(band(20, 40), { charWidth: 5.3, rowHeight: 11, maxRows: 4, minChars: 8 });
    expect(plan.get('t0')!.dy).toBe(0);
    expect(plan.get('t1')!.dy).toBe(11);
    expect(plan.get('t2')!.dy).toBe(22);
    expect(plan.get('t3')!.dy).toBe(0);
    expect(plan.get('t0')!.maxChars).toBe(20);
  });

  test('past the row cap the labels get shorter instead of taller, never below the floor', () => {
    // 20 apart: 106/20 needs 6 rows, capped at 4 -> 80 wide -> 15 chars
    const plan = planLabelTiers(band(30, 20), { charWidth: 5.3, rowHeight: 11, maxRows: 4, minChars: 8 });
    expect(plan.get('t4')!.dy).toBe(0);
    expect(plan.get('t0')!.maxChars).toBe(15);
    const tight = planLabelTiers(band(30, 6), { charWidth: 5.3, rowHeight: 11, maxRows: 4, minChars: 8 });
    expect(tight.get('t0')!.maxChars).toBe(8);
  });

  test('rows are assigned in x order, whatever the input order', () => {
    const shuffled = [{ id: 'b', x: 40, chars: 20 }, { id: 'a', x: 0, chars: 20 }, { id: 'c', x: 80, chars: 20 }];
    const plan = planLabelTiers(shuffled, { charWidth: 5.3, rowHeight: 11, maxRows: 4, minChars: 8 });
    expect(plan.get('a')!.dy).toBe(0);
    expect(plan.get('b')!.dy).toBe(11);
  });
});

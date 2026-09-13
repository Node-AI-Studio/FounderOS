import { describe, expect, test } from 'vitest';
import { DEPARTMENTS, PEOPLE, DEPT } from '@/lib/roster';

describe('departments', () => {
  test('seven pillars, in order, with the agreed names', () => {
    expect(DEPARTMENTS.map((d) => d.name)).toEqual([
      'Growth', 'Content', 'Retention', 'Store', 'Customer Care', 'Finance', 'Operations',
    ]);
    expect(DEPARTMENTS.map((d) => d.id)).toEqual([
      DEPT.growth, DEPT.content, DEPT.retention, DEPT.store, DEPT.care, DEPT.finance, DEPT.operations,
    ]);
    expect(DEPARTMENTS.map((d) => d.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('one role-only head per pillar plus the operator, no invented names', () => {
    const heads = PEOPLE.filter((p) => p.id !== 'person-yannick');
    expect(heads.length).toBe(7);
    expect(new Set(heads.map((p) => p.departmentId)).size).toBe(7);
    for (const p of heads) expect(p.name).toBe(p.role);
    expect(PEOPLE.find((p) => p.id === 'person-yannick')?.name).toBe('Yannick Kiefer');
  });
});

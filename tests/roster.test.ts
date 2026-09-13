import { describe, expect, test } from 'vitest';
import { DEPARTMENTS, PEOPLE, DEPT, ROSTER } from '@/lib/roster';

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

describe('roster', () => {
  test('ids are unique and every entry has a department', () => {
    const ids = ROSTER.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const deptIds = new Set(DEPARTMENTS.map((d) => d.id));
    for (const e of ROSTER) expect(deptIds.has(e.departmentId), e.id).toBe(true);
  });

  test('exactly one lead per pillar; every non-lead reports to its pillar lead', () => {
    for (const d of DEPARTMENTS) {
      const members = ROSTER.filter((e) => e.departmentId === d.id);
      const leads = members.filter((e) => e.tier === 'lead');
      expect(leads.length, d.name).toBe(1);
      for (const m of members) {
        if (m.tier === 'lead') expect(m.parentId).toBeNull();
        else expect(m.parentId).toBe(leads[0].id);
      }
    }
  });

  test('every entry carries five or six SOP steps and at least one run summary', () => {
    for (const e of ROSTER) {
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(5);
      expect(e.steps.length, e.id).toBeLessThanOrEqual(6);
      expect(e.runSummaries.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.sopTitle.length).toBeGreaterThan(0);
    }
  });

  test('pillar sizes match the spec', () => {
    const count = (id: string) => ROSTER.filter((e) => e.departmentId === id).length;
    expect(count(DEPT.growth)).toBe(17);
    expect(count(DEPT.content)).toBe(13);
    expect(count(DEPT.retention)).toBe(11);
    expect(count(DEPT.store)).toBe(12);
    expect(count(DEPT.care)).toBe(11);
    expect(count(DEPT.finance)).toBe(4);
    expect(count(DEPT.operations)).toBe(7);
  });
});

import { describe, expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { openDb } from '@/lib/db';
import { skills } from '@/lib/seed/workflows';
import { LIBRARY_LANES, skillGroup } from '@/lib/skills-catalog';

const LIB = path.join(process.cwd(), 'demo', 'helight-skills');

describe('library skills shipped with the board', () => {
  test('every lane entry has a SKILL.md on disk', () => {
    for (const slug of Object.keys(LIBRARY_LANES)) {
      expect(existsSync(path.join(LIB, slug, 'SKILL.md')), slug).toBe(true);
    }
  });
  test('both licences ship with the copies', () => {
    expect(existsSync(path.join(LIB, 'LICENSE-marketing-skills'))).toBe(true);
    expect(existsSync(path.join(LIB, 'LICENSE-claude-ads'))).toBe(true);
  });
  test('library skills group by lane, other names keep their groups', () => {
    expect(skillGroup('ads-meta')).toBe('Library · Growth');
    expect(skillGroup('emails')).toBe('Library · Retention');
    expect(skillGroup('firecrawl-scrape')).toBe('Firecrawl');
  });
});

describe('operator skills build on the library', () => {
  test('every operator skill names at least one library skill that exists', () => {
    for (const s of skills) {
      expect(s.buildsOn.length, s.id).toBeGreaterThan(0);
      for (const dep of s.buildsOn) expect(LIBRARY_LANES[dep], `${s.id} -> ${dep}`).toBeDefined();
    }
  });
  test('every library skill is built on by at least one operator skill', () => {
    const used = new Set(skills.flatMap((s) => s.buildsOn));
    for (const slug of Object.keys(LIBRARY_LANES)) expect(used.has(slug), slug).toBe(true);
  });
  test('buildsOn round-trips through the skills table', () => {
    const db = openDb(':memory:');
    db.skills.insert({ ...skills[0], markdown: '# x' });
    expect(db.skills.all()[0].buildsOn).toEqual(skills[0].buildsOn);
  });
});

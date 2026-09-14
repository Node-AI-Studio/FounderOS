import { getDb } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { SkillsGrid, type SkillCard } from '@/components/SkillsGrid';
import { readUserSkills } from '@/lib/skills-catalog';

export const dynamic = 'force-dynamic';

const truncate = (t: string, n = 110) => (t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')}…` : t);

// Library SKILL.md descriptions are written as triggers ("When the user wants
// to ..."). On a card that reads as metadata, so lead with the verb instead.
const untrigger = (t: string) => {
  const m = /^(?:use\s+)?when\s+(?:the\s+)?user\s+(?:wants|asks|needs)\s+(?:to\s+|for\s+)?/i.exec(t);
  const rest = m ? t.slice(m[0].length) : t;
  return rest.charAt(0).toUpperCase() + rest.slice(1);
};

export default function SkillsPage() {
  // Both catalogs, side by side: the real Claude Code skills read live from
  // disk (SKILL.md loads on demand via /api/skills/[slug]) AND the operator
  // skill cards that have always lived in this section (docs carried inline).
  const real = readUserSkills();
  const realCards: SkillCard[] = real.map((s) => ({
    id: s.slug,
    name: s.name,
    group: s.group,
    description: truncate(untrigger(s.description)),
    meta: s.path,
    filePath: s.path,
  }));

  const db = getDb();
  const agentNames = Object.fromEntries(db.agents.all().map((a) => [a.id, a.name]));
  const operatorCards: SkillCard[] = db.skills.all().map((s) => ({
    id: s.id,
    name: s.name,
    group: `Operator · ${s.category}`,
    description: truncate(s.description),
    meta: s.ownerAgentId ? (agentNames[s.ownerAgentId] ?? s.ownerAgentId) : 'unassigned',
    filePath: `skills/${s.id}/SKILL.md`,
    status: s.status,
    markdown: s.markdown,
    buildsOn: s.buildsOn,
  }));

  const cards = [...realCards, ...operatorCards];
  const sourceNote =
    real.length > 0
      ? `${operatorCards.length} operator skills, one per lane, built on ${real.length} library skills (marketing-skills by Corey Haines and claude-ads, both MIT). Open any card to read or download its SKILL.md.`
      : `${operatorCards.length} operator skills, one per lane. Open any card to read or download its SKILL.md.`;

  return (
    <div>
      <PageHeader eyebrow="capability library" title="Skills" />
      <SkillsGrid cards={cards} sourceNote={sourceNote} />
    </div>
  );
}

import type { FunnelContact, FunnelTouch } from '@/lib/schemas';

// ── Funnel journeys — DUMMY clients from first touch to conversion ──────────
// Real-ready: `source` on every touch names where it will come from live —
// 'trakyo' (organic attribution), 'meta-ads' (Meta Ads MCP), 'manual' until
// then. Swapping seed for live pulls is a repo-level change; the shape stays.
// Touch dates are DAYS-AGO offsets resolved at seed time, so the space's
// stall coloring (quiet > 7 days pre-conversion → red) stays truthful no
// matter when the DB is re-seeded.
const funnelDay = (daysBack: number): string =>
  new Date(Date.now() - daysBack * 86_400_000).toISOString().slice(0, 10);

type SeededTouch = [FunnelTouch['stage'], FunnelTouch['channel'], string, FunnelTouch['source'], number];
type SeededJourney = {
  id: string;
  name: string;
  venture: FunnelContact['venture'];
  relationship: FunnelContact['relationship'];
  likelihood: number; // 0–100 likelihood-to-buy (dummy; later CRM/Trakyo-scored)
  product?: string;
  amountUsd?: number;
  email?: string; // dummy contact channels so the demo shows outreach actions
  phone?: string;
  person?: string; // the human behind the deal — demo dossier identity
  company?: string;
  role?: string;
  linkedin?: string;
  touches: SeededTouch[]; // 4–5, chronological (last number = days ago)
};

const FUNNEL_JOURNEYS: SeededJourney[] = [
  // — Launchpad Cohort (mentorship) —
  {
    id: 'fc-jake-moreau', name: 'Jake Moreau', venture: 'launchpad-cohort',
    relationship: 'hot', likelihood: 100,
    product: 'Launchpad Cohort — mentorship (PIF)', amountUsd: 6800,
    touches: [
      ['first_touch', 'organic', 'IG reel: "3 AI offers that close themselves"', 'trakyo', 59],
      ['engaged', 'dm', 'Replied to story CTA — "wants out of retainer hell"', 'manual', 57],
      ['nurtured', 'email', 'Day-3 email: student case study (0→22k/mo)', 'manual', 54],
      ['opted_in', 'call', 'Booked strategy call via Trakyo link', 'trakyo', 51],
      ['converted', 'checkout', 'Paid in full — FanBasis checkout', 'manual', 49],
    ],
  },
  {
    id: 'fc-priya-shah', name: 'Priya Shah', venture: 'launchpad-cohort',
    relationship: 'warm', likelihood: 95,
    product: 'Launchpad Cohort — mentorship (3-pay)', amountUsd: 2600,
    touches: [
      ['first_touch', 'ads', 'Meta ad: "Agency owners — install AI in 30 days"', 'meta-ads', 45],
      ['engaged', 'ads', 'Watched VSL to 80% — retarget pool', 'meta-ads', 45],
      ['opted_in', 'webinar', 'Registered + attended WebinarJam training', 'manual', 42],
      ['converted', 'checkout', 'First of 3 payments — FanBasis', 'manual', 40],
    ],
  },
  {
    id: 'fc-danny-okafor', name: 'Danny Okafor', venture: 'launchpad-cohort',
    relationship: 'hot', likelihood: 100,
    product: 'Launchpad Cohort — mentorship (PIF)', amountUsd: 6800,
    touches: [
      ['first_touch', 'organic', 'TikTok: "day in the life running an AI agency"', 'trakyo', 38],
      ['engaged', 'organic', 'Binged 6 reels, followed, saved lead magnet post', 'trakyo', 36],
      ['nurtured', 'ads', 'Retargeting ad: student-wins carousel', 'meta-ads', 33],
      ['opted_in', 'call', 'Booked call from link-in-bio (Trakyo attributed)', 'trakyo', 30],
      ['converted', 'checkout', 'Paid in full — FanBasis checkout', 'manual', 29],
    ],
  },
  {
    id: 'fc-sofia-reyes', name: 'Sofia Reyes', venture: 'launchpad-cohort',
    relationship: 'warm', likelihood: 95,
    product: 'Launchpad Cohort — mentorship (3-pay)', amountUsd: 2600,
    touches: [
      ['first_touch', 'organic', 'YT long-form: "how I\'d start an agency in 2026"', 'trakyo', 31],
      ['engaged', 'email', 'Joined newsletter from YT description', 'manual', 30],
      ['nurtured', 'email', 'Newsletter: pricing-psychology issue clicked', 'manual', 26],
      ['opted_in', 'webinar', 'Attended WebinarJam training, stayed for offer', 'manual', 23],
      ['converted', 'checkout', 'First of 3 payments — FanBasis', 'manual', 22],
    ],
  },
  {
    // Ads ghost — three engaged touches, quiet for 3 weeks: the red node.
    id: 'fc-liam-carter', name: 'Liam Carter', venture: 'launchpad-cohort',
    relationship: 'cold', likelihood: 15,
    touches: [
      ['first_touch', 'ads', 'Meta ad: "stop selling hours" (cold traffic)', 'meta-ads', 27],
      ['engaged', 'ads', 'Clicked through, watched VSL 45%', 'meta-ads', 27],
      ['engaged', 'ads', 'Retarget click — opened application form, abandoned', 'meta-ads', 23],
      ['engaged', 'email', 'Abandoned-form email opened, no reply yet', 'manual', 21],
    ],
  },
  {
    // Warm but drifting — 10 quiet days in nurture: also red until re-touched.
    id: 'fc-marcus-webb', name: 'Marcus Webb', venture: 'launchpad-cohort',
    relationship: 'warm', likelihood: 42,
    touches: [
      ['first_touch', 'organic', 'IG carousel: "agency niches that print in 2026"', 'trakyo', 24],
      ['engaged', 'dm', 'ManyChat keyword "SCALE" → DM flow', 'manual', 24],
      ['nurtured', 'email', 'Lead magnet delivered, day-1 email opened', 'manual', 12],
      ['nurtured', 'email', 'Newsletter: student-win breakdown clicked', 'manual', 10],
    ],
  },
  {
    id: 'fc-tayla-nguyen', name: 'Tayla Nguyen', venture: 'launchpad-cohort',
    relationship: 'hot', likelihood: 84,
    email: 'tayla.nguyen@example.com', phone: '+15550100841',
    touches: [
      ['first_touch', 'organic', 'TikTok: "AI receptionist demo" went semi-viral', 'trakyo', 4],
      ['engaged', 'organic', 'Profile visit → followed + commented', 'trakyo', 4],
      ['nurtured', 'dm', 'DM convo — asked about payment plans', 'manual', 3],
      ['opted_in', 'call', 'Call booked for next week (Trakyo attributed)', 'trakyo', 2],
    ],
  },
  {
    // Mid-decay: 70 quiet days — visibly fading toward red, 20 days from the archive.
    id: 'fc-remy-cole', name: 'Remy Cole', venture: 'launchpad-cohort',
    relationship: 'cold', likelihood: 25,
    touches: [
      ['first_touch', 'organic', 'IG reel: "fire your lead-gen agency"', 'trakyo', 84],
      ['engaged', 'dm', 'Story-reply convo, asked for pricing', 'manual', 80],
      ['engaged', 'email', 'Pricing breakdown sent, opened twice', 'manual', 74],
      ['engaged', 'email', 'Follow-up: "circling back" — no reply since', 'manual', 70],
    ],
  },
  {
    // Went quiet in March — decayed past 90 days into the archive tab.
    id: 'fc-jordan-blake', name: 'Jordan Blake', venture: 'launchpad-cohort',
    relationship: 'cold', likelihood: 20,
    touches: [
      ['first_touch', 'ads', 'Meta ad: "quit your 9-5 with one client" (old campaign)', 'meta-ads', 118],
      ['engaged', 'ads', 'Clicked through, watched VSL 30%', 'meta-ads', 118],
      ['engaged', 'dm', 'One-word DM reply, then silence', 'manual', 112],
      ['engaged', 'email', 'Re-engagement email bounced-opened, no click', 'manual', 104],
    ],
  },
  // — Vantage (AI agency clients) —
  {
    id: 'fc-ava-stone', name: 'Ava Stone — Northwind Legal', venture: 'vantage',
    relationship: 'hot', likelihood: 100,
    product: 'Vantage — AI intake build (sprint)', amountUsd: 12000,
    touches: [
      ['first_touch', 'organic', 'LinkedIn post: legal-intake automation teardown', 'trakyo', 57],
      ['engaged', 'email', 'Replied to newsletter — "this is our exact bottleneck"', 'manual', 55],
      ['opted_in', 'call', 'Discovery call booked via site (Trakyo attributed)', 'trakyo', 50],
      ['nurtured', 'email', 'Proposal + Loom walkthrough sent, viewed 3×', 'manual', 47],
      ['converted', 'checkout', 'Signed — 50% deposit via Stripe invoice', 'manual', 43],
    ],
  },
  {
    id: 'fc-omar-haddad', name: 'Omar Haddad — Pulse Fitness Group', venture: 'vantage',
    relationship: 'warm', likelihood: 95,
    product: 'Vantage — AI ops retainer (monthly)', amountUsd: 4500,
    touches: [
      ['first_touch', 'ads', 'Meta ad: "your gym\'s front desk, automated"', 'meta-ads', 48],
      ['engaged', 'ads', 'Case-study page dwell 4m — retarget pool', 'meta-ads', 47],
      ['nurtured', 'email', 'ROI one-pager emailed after form fill', 'manual', 44],
      ['opted_in', 'call', 'Demo call — 3 locations scoped', 'manual', 41],
      ['converted', 'checkout', 'Retainer live — Stripe subscription', 'manual', 37],
    ],
  },
  {
    id: 'fc-elena-brooks', name: 'Elena Brooks — Harbor Dental', venture: 'vantage',
    relationship: 'hot', likelihood: 100,
    product: 'Vantage — AI intake build (sprint)', amountUsd: 9500,
    touches: [
      ['first_touch', 'organic', 'IG reel: missed-call → booked-patient demo', 'trakyo', 31],
      ['engaged', 'dm', 'DM: "does this work for dental?"', 'manual', 30],
      ['opted_in', 'call', 'Discovery call via link-in-bio (Trakyo attributed)', 'trakyo', 27],
      ['converted', 'checkout', 'Signed — deposit via Stripe invoice', 'manual', 23],
    ],
  },
  {
    id: 'fc-noah-fields', name: 'Noah Fields — Fields Roofing', venture: 'vantage',
    relationship: 'warm', likelihood: 66,
    touches: [
      ['first_touch', 'ads', 'Meta ad: "book 20 estimates/mo on autopilot"', 'meta-ads', 8],
      ['engaged', 'ads', 'Lead form opened, 60% VSL', 'meta-ads', 8],
      ['nurtured', 'email', 'Follow-up sequence day 2 — case study clicked', 'manual', 5],
      ['opted_in', 'call', 'Discovery call booked for Friday', 'manual', 2],
    ],
  },
  {
    id: 'fc-grace-lin', name: 'Grace Lin — Lin & Co Accounting', venture: 'vantage',
    relationship: 'warm', likelihood: 74,
    email: 'grace@linandco.example.com', phone: '+15550100742',
    person: 'Grace Lin', company: 'Lin & Co Accounting', role: 'Managing Partner',
    linkedin: 'https://linkedin.com/in/gracelin-example',
    touches: [
      ['first_touch', 'organic', 'X thread: client-onboarding agent breakdown', 'trakyo', 6],
      ['engaged', 'organic', 'Followed + bookmarked, visited site twice', 'trakyo', 5],
      ['nurtured', 'email', 'Newsletter signup — welcome sequence started', 'manual', 3],
      ['opted_in', 'call', 'Call request form submitted (Trakyo attributed)', 'trakyo', 1],
    ],
  },
];

export const funnelContacts: FunnelContact[] = FUNNEL_JOURNEYS.map((j) => ({
  id: j.id,
  name: j.name,
  venture: j.venture,
  status: j.touches[j.touches.length - 1][0], // furthest stage reached
  product: j.product ?? null,
  amountUsd: j.amountUsd ?? null,
  relationship: j.relationship,
  likelihood: j.likelihood,
  url: null,
  email: j.email ?? null,
  phone: j.phone ?? null,
  person: j.person ?? null,
  company: j.company ?? null,
  role: j.role ?? null,
  linkedin: j.linkedin ?? null,
  createdAt: funnelDay(j.touches[0][4]), // journey starts at the first touch
}));

export const funnelTouches: FunnelTouch[] = FUNNEL_JOURNEYS.flatMap((j) =>
  j.touches.map(([stage, channel, label, source, daysBack], i) => ({
    id: `${j.id}-t${i + 1}`,
    contactId: j.id,
    seq: i + 1,
    stage,
    channel,
    label,
    source,
    at: funnelDay(daysBack),
  })),
);

import type { FunnelContact, FunnelTouch } from '@/lib/schemas';

// ── Funnel journeys: DUMMY customers from first touch to conversion ────────
// Real-ready: `source` on every touch names where it will come from live —
// 'shopify' (storefront visits and checkout), 'klaviyo' (email flows),
// 'meta-ads' / 'tiktok-ads' (paid), 'manual' until the organic-social
// connector lands. Swapping seed for live pulls is a repo-level change; the
// shape stays. Touch dates are DAYS-AGO offsets resolved at seed time, so the
// space's stall coloring (quiet > 7 days pre-conversion → red) stays truthful
// no matter when the DB is re-seeded.
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
  touches: SeededTouch[]; // 1–5, chronological (last number = days ago)
};

const FUNNEL_JOURNEYS: SeededJourney[] = [
  {
    id: 'fc-parent-maya', name: 'Maya (parent, Kidzzz)', venture: 'helight',
    relationship: 'hot', likelihood: 100, product: 'Helight Kidzzz', amountUsd: 139,
    email: 'maya@example.com',
    touches: [
      ['first_touch', 'ads', 'TikTok ad: bedtime battle, parent POV', 'tiktok-ads', 12],
      ['engaged', 'organic', 'Visited the Kidzzz page twice, read the science page', 'shopify', 11],
      ['nurtured', 'email', 'Welcome flow email 2: safe for infants', 'klaviyo', 9],
      ['opted_in', 'checkout', 'Added Kidzzz to cart', 'shopify', 8],
      ['converted', 'checkout', 'Ordered Kidzzz, Quebec', 'shopify', 8],
    ],
  },
  {
    id: 'fc-nurse-dominic', name: 'Dominic (night shift)', venture: 'helight',
    relationship: 'hot', likelihood: 100, product: 'Helight Sleep', amountUsd: 139,
    email: 'dominic@example.com',
    touches: [
      ['first_touch', 'ads', 'Meta ad: night shift sleep debt, ICU nurse testimonial', 'meta-ads', 22],
      ['engaged', 'organic', 'Visited the Helight Sleep page, read the reviews', 'shopify', 20],
      ['nurtured', 'email', 'Welcome flow email 3: daytime darkness without blackout curtains', 'klaviyo', 17],
      ['opted_in', 'checkout', 'Added Helight Sleep to cart', 'shopify', 15],
      ['converted', 'checkout', 'Ordered Helight Sleep, Ontario', 'shopify', 15],
    ],
  },
  {
    id: 'fc-oura-lena', name: 'Lena (Oura user)', venture: 'helight',
    relationship: 'hot', likelihood: 100, product: 'Helight Sleep', amountUsd: 139,
    email: 'lena@example.com',
    touches: [
      ['first_touch', 'organic', 'TikTok creator video: Oura sleep score before and after Helight', 'manual', 25],
      ['engaged', 'organic', 'Compared Oura deep sleep data against the Helight science page', 'shopify', 22],
      ['nurtured', 'email', 'Welcome flow email 1: how red light protects melatonin', 'klaviyo', 18],
      ['opted_in', 'checkout', 'Added Helight Sleep to cart', 'shopify', 14],
      ['converted', 'checkout', 'Ordered Helight Sleep, California', 'shopify', 13],
    ],
  },
  {
    id: 'fc-traveller-sam', name: 'Sam (frequent flyer)', venture: 'helight',
    relationship: 'hot', likelihood: 95, product: 'Helight Sleep', amountUsd: 139,
    touches: [
      ['first_touch', 'ads', 'Meta ad: jet lag reset, travel POV', 'meta-ads', 16],
      ['engaged', 'organic', 'Visited the Helight Sleep page from a layover, read the travel FAQ', 'shopify', 14],
      ['opted_in', 'checkout', 'Added Helight Sleep to cart mid flight', 'shopify', 11],
      ['converted', 'checkout', 'Ordered Helight Sleep, shipped to a hotel address', 'shopify', 11],
    ],
  },
  {
    id: 'fc-couple-ines', name: 'Ines and Marc (couple)', venture: 'helight',
    relationship: 'hot', likelihood: 100, product: 'Helight Sleep x2', amountUsd: 278,
    email: 'ines@example.com',
    touches: [
      ['first_touch', 'ads', 'TikTok ad: couple bedtime routine, two pack offer', 'tiktok-ads', 19],
      ['engaged', 'organic', 'Both visited the two pack bundle page', 'shopify', 17],
      ['nurtured', 'email', 'Welcome flow email 2: safe for co sleeping partners', 'klaviyo', 14],
      ['opted_in', 'checkout', 'Added the two pack to cart', 'shopify', 10],
      ['converted', 'checkout', 'Ordered the Helight Sleep two pack, Texas', 'shopify', 9],
    ],
  },
  {
    id: 'fc-melatonin-jo', name: 'Jo (quitting melatonin)', venture: 'helight',
    relationship: 'warm', likelihood: 68, product: 'Helight Sleep',
    touches: [
      ['first_touch', 'organic', 'Read a blog post comparing red light to melatonin supplements', 'shopify', 13],
      ['engaged', 'organic', 'Read the science page twice, bookmarked the site', 'shopify', 11],
      ['nurtured', 'email', 'Welcome flow email 2: how red light replaces melatonin without rebound', 'klaviyo', 7],
      ['opted_in', 'checkout', 'Added Helight Sleep to cart, has not checked out yet', 'shopify', 3],
    ],
  },
  {
    id: 'fc-student-tariq', name: 'Tariq (student)', venture: 'helight',
    relationship: 'warm', likelihood: 55, product: 'Helight Sleep',
    touches: [
      ['first_touch', 'ads', 'TikTok ad: dorm room sleep hack, student discount mention', 'tiktok-ads', 9],
      ['engaged', 'organic', 'Visited the Helight Sleep page from the student discount link', 'shopify', 7],
      ['nurtured', 'email', 'Welcome flow email 1: how the 28 minute sunset works', 'klaviyo', 5],
    ],
  },
  {
    id: 'fc-menopause-ruth', name: 'Ruth (menopause lane)', venture: 'helight',
    relationship: 'warm', likelihood: 70, product: 'Helight Sleep',
    touches: [
      ['first_touch', 'ads', 'Meta ad: menopause night sweats, physician explainer', 'meta-ads', 24],
      ['engaged', 'organic', 'Read the science page and the menopause FAQ', 'shopify', 20],
      ['nurtured', 'email', 'Welcome flow email 2: safe for hormonal sleep disruption', 'klaviyo', 14],
      ['opted_in', 'checkout', 'Added Helight Sleep to cart, gone quiet since', 'shopify', 9],
    ],
  },
  {
    id: 'fc-parent-owen', name: 'Owen (parent, twins)', venture: 'helight',
    relationship: 'warm', likelihood: 48, product: 'Helight Kidzzz x2',
    touches: [
      ['first_touch', 'ads', 'Meta ad: twins bedtime battle, two kid household', 'meta-ads', 6],
      ['engaged', 'organic', 'Visited the Kidzzz page, compared single vs two pack pricing', 'shopify', 5],
    ],
  },
  {
    id: 'fc-scroller-ava', name: 'Ava (late night scroller)', venture: 'helight',
    relationship: 'warm', likelihood: 52, product: 'Helight Sleep',
    touches: [
      ['first_touch', 'organic', 'TikTok creator video: doomscrolling instead of sleeping', 'manual', 8],
      ['engaged', 'organic', 'Visited the Helight Sleep page after the video, read reviews', 'shopify', 7],
      ['nurtured', 'email', 'Welcome flow email 1: the 28 minute sunset beats a phone screen', 'klaviyo', 4],
    ],
  },
  {
    id: 'fc-gift-helen', name: 'Helen (gift for a parent)', venture: 'helight',
    relationship: 'hot', likelihood: 92, product: 'Helight Sleep', amountUsd: 139,
    touches: [
      ['first_touch', 'organic', 'Read a gift guide featuring Helight Sleep', 'shopify', 14],
      ['engaged', 'organic', 'Visited the Helight Sleep page, checked gift wrap options', 'shopify', 12],
      ['nurtured', 'email', 'Welcome flow email 1: an easy gift, shipped straight to your parent', 'klaviyo', 9],
      ['converted', 'checkout', 'Ordered Helight Sleep, shipped to her mother in Florida', 'shopify', 8],
    ],
  },
  {
    id: 'fc-whoop-marcus', name: 'Marcus (Whoop user)', venture: 'helight',
    relationship: 'warm', likelihood: 45, product: 'Helight Sleep',
    touches: [
      ['first_touch', 'ads', 'TikTok ad: Whoop recovery score, red light before bed', 'tiktok-ads', 4],
      ['engaged', 'organic', 'Visited the Helight Sleep page, compared to Whoop recovery data', 'shopify', 3],
    ],
  },
  {
    id: 'fc-nurse-priya', name: 'Priya (ICU nights)', venture: 'helight',
    relationship: 'cold', likelihood: 22, product: 'Helight Sleep',
    touches: [
      ['first_touch', 'ads', 'Meta ad: ICU night shift sleep debt, nurse testimonial', 'meta-ads', 2],
    ],
  },
  {
    id: 'fc-repeat-lena', name: 'Lena, second device', venture: 'helight',
    relationship: 'hot', likelihood: 100, product: 'Helight Sleep', amountUsd: 139,
    email: 'lena@example.com',
    touches: [
      ['first_touch', 'email', 'Welcome back email: a second unit for the guest room', 'klaviyo', 5],
      ['engaged', 'organic', 'Revisited the Helight Sleep page, checked the current price', 'shopify', 4],
      ['converted', 'checkout', 'Ordered a second Helight Sleep, guest room', 'shopify', 3],
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

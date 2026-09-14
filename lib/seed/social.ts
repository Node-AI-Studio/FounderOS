import type {
  SocialAccount,
  SocialSnapshot,
  EmailListSnapshot,
  SocialDm,
  SocialDmSnapshot,
  SocialDmMessage,
  SocialPost,
} from '@/lib/schemas';

// Helight's public footprint, verified against helight.com's own footer links
// (`curl -sL https://helight.com | grep -oE 'https://(www\.)?(instagram|tiktok|
// youtube|facebook|x|twitter)\.com/[^"'"'"' ]+'`). The page links Instagram and
// YouTube; TikTok only appears as a Pixel integration in the theme's tracking
// script, never as a followable account, so it is left out here rather than
// invented. Facebook is linked too, but Facebook isn't one of the five
// platforms this schema tracks (SocialPlatformSchema), so it stays out until
// that widens: not silently dropped, just not modeled yet.
export const socialAccounts: SocialAccount[] = [
  { platform: 'instagram', handle: '@helight', url: 'https://instagram.com/helight', order: 1 },
  { platform: 'youtube', handle: '@helight', url: 'https://youtube.com/helight', order: 2 },
];

// 91 days of DAILY snapshot dates ending on the current capture, so the
// audience lines read densely at every 7/30/60/all-time window, which is
// also how a live daily Zernio sync will fill them going forward.
const SERIES_END = '2026-09-12';
const SERIES_LEN = 91;
const SERIES_DATES: string[] = (() => {
  const end = new Date(`${SERIES_END}T00:00:00Z`);
  const out: string[] = [];
  for (let i = SERIES_LEN - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
})();

/**
 * Deterministic upward ramp from `start` to `end` across SERIES_DATES, with a
 * seeded organic wobble (two mixed frequencies + a slow drift) so daily history
 * reads like real growth rather than a straight line. The final point is forced
 * to `end` so the latest dummy value matches the real current count.
 */
function ramp(start: number, end: number, seed: number): number[] {
  const n = SERIES_DATES.length;
  const span = Math.abs(end - start);
  return SERIES_DATES.map((_, i) => {
    if (i === n - 1) return end;
    const t = i / (n - 1);
    // Smooth-ish accelerating trend (subtle S-curve) plus layered jitter.
    const trend = start + (end - start) * (0.7 * t + 0.3 * t * t);
    const wobble =
      (Math.sin(i * 0.7 + seed) * 0.6 + Math.sin(i * 0.27 + seed * 2) * 0.4) * span * 0.012;
    return Math.max(0, Math.round(trend + wobble));
  });
}

// Illustrative current follower counts for the two verified platforms. Each
// ramps up to its current value across the 91-day window.
const FOLLOWER_TARGETS: { platform: SocialAccount['platform']; start: number; end: number }[] = [
  { platform: 'instagram', start: 18000, end: 21500 },
  { platform: 'youtube', start: 900, end: 1400 },
];

export const socialBaseline: SocialSnapshot[] = FOLLOWER_TARGETS.flatMap((t, ti) =>
  ramp(t.start, t.end, ti + 1).map((followers, i) => ({
    platform: t.platform,
    capturedAt: SERIES_DATES[i],
    followers,
    // the real final capture keeps its honest source; history is seeded dummy
    source: i === SERIES_DATES.length - 1 ? 'seed-zernio' : 'seed-dummy',
  })),
);

// Email list: Klaviyo. Illustrative until KLAVIYO_API_KEY lands, the series
// ramps across the full window like the follower counts above, and the final
// point is the "current" count a live sync would overwrite.
const EMAIL_TARGET = { start: 6200, end: 8900 };
export const emailListBaseline: EmailListSnapshot[] = ramp(EMAIL_TARGET.start, EMAIL_TARGET.end, 99).map(
  (subscribers, i) => ({
    capturedAt: SERIES_DATES[i],
    subscribers,
    source: i === SERIES_DATES.length - 1 ? 'seed-klaviyo' : 'seed-dummy',
  }),
);

// DM counts (DUMMY until a ManyChat/Zernio source is wired). Tracked on
// Instagram (organic DMs) and TikTok (ad-driven inbox), independent of
// which platforms have a followable account above.
const DM_TARGETS: { platform: SocialDm['platform']; start: number; end: number }[] = [
  { platform: 'instagram', start: 140, end: 260 },
  { platform: 'tiktok', start: 90, end: 210 },
];
export const socialDms: SocialDm[] = DM_TARGETS.map((t) => ({
  platform: t.platform,
  count: t.end,
  updatedAt: SERIES_END,
}));

// Instagram DM inbox: realistic seeded conversations so the /social DM tab is
// alive on a fresh clone. DUMMY until the ManyChat webhook feeds it live
// (source 'seed-dummy'; real messages arrive as source 'manychat'). Four
// threads, inbound + outbound, every reply inside the claims allowlist: sleep
// onset language, the 21-nights guarantee, the 28-minute cycle: no diagnosis,
// no cure, no promise about a medical condition.
export const socialDmMessages: SocialDmMessage[] = [
  // Mara: parent asking whether it's safe/appropriate for a toddler
  ['ig-mara', 'Mara Lindqvist', 'mara.lindqvist', 'in', 'does the sleep light work for a 2 year old or is it just for adults?', null, '2026-09-03T19:12:00.000Z'],
  ['ig-mara', 'Mara Lindqvist', 'mara.lindqvist', 'out', 'Kidzzz runs the same 28-minute cycle. The safety details for little ones are on the Kidzzz page, and support can answer anything specific.', null, '2026-09-03T19:41:00.000Z'],
  ['ig-mara', 'Mara Lindqvist', 'mara.lindqvist', 'in', 'perfect, ordering the Kidzzz today', null, '2026-09-03T19:44:00.000Z'],
  // Desmond: traveller asking about voltage and carry-on size
  ['ig-desmond', 'Desmond Cole', 'desmond.cole', 'in', 'traveling to Japan next month, does it work with different plugs and is it small enough for a carry-on?', null, '2026-09-06T09:20:00.000Z'],
  ['ig-desmond', 'Desmond Cole', 'desmond.cole', 'out', "It is palm-sized and travels well. For plug and voltage details, the product page lists the spec for your region.", null, '2026-09-06T09:52:00.000Z'],
  // Priyanka: night-shift nurse asking about daytime sleep
  ['ig-priyanka', 'Priyanka Rao', 'priyanka.rao', 'in', 'night shift nurse here, trying to sleep during the day. does this actually help or is that just marketing?', null, '2026-09-08T14:07:00.000Z'],
  ['ig-priyanka', 'Priyanka Rao', 'priyanka.rao', 'out', "That's exactly the shift-worker case it's built for. The 28-minute light cycle mimics sunset regardless of the actual time, so daytime sleep gets the same wind-down cue. It's sleep onset support, not a promise about any condition.", null, '2026-09-08T14:30:00.000Z'],
  ['ig-priyanka', 'Priyanka Rao', 'priyanka.rao', 'in', 'ok, worth a try then', null, '2026-09-08T14:33:00.000Z'],
  // Felix: buyer checking the guarantee before ordering (unreplied, needs attention)
  ['ig-felix', 'Felix Brandt', 'felix.brandt', 'in', "if it doesn't work for me can I actually get my money back or is that fine print?", null, '2026-09-11T20:15:00.000Z'],
].map(([subscriberId, name, handle, direction, text, tag, ts], i) => ({
  id: `dm-${subscriberId}-${i}`,
  platform: 'instagram' as const,
  subscriberId: subscriberId as string,
  name: name as string,
  handle: handle as string,
  text: text as string,
  direction: direction as SocialDmMessage['direction'],
  tag: tag as string | null,
  ts: ts as string,
  source: 'seed-dummy',
}));
// …and the per-day history behind them, so DM growth charts over every window.
export const socialDmSnapshots: SocialDmSnapshot[] = DM_TARGETS.flatMap((t, ti) =>
  ramp(t.start, t.end, ti + 50).map((count, i) => ({
    platform: t.platform,
    capturedAt: SERIES_DATES[i],
    count,
    source: 'seed-dummy',
  })),
);

// Four weeks of Helight's own published cadence for the posting consistency
// strip: Instagram every day, YouTube three days a week, the 21 Nights series
// and the evidence explainers alternating. One queued post keeps the composer's
// queue from reading empty on first load. Zernio's live history replaces all of
// this the moment the key lands (see lib/social-posting.ts).
const CAPTIONS = [
  'Night 1 of 21 with a nurse on rotating shifts. Same lamp, same 28 minutes, wearable on screen.',
  'Why 630 nm and not any red bulb: the wavelength, the intensity and the fade, in 40 seconds.',
  'Night 7 of 21: deep sleep is up, no app, no account, nothing to charge but the lamp.',
  'The 60-night trial exists because we are that confident. What happens if it does not work for you.',
  'Night 14 of 21 with a frequent flyer. Hotel room, USB-C, same routine.',
  'Kidzzz bedtime routine, night 3. Lights out means lights out.',
  'Night 21 of 21: the before and after on one screen. Full series in the playlist.',
];
const PUBLISHED_POSTS: SocialPost[] = SERIES_DATES.slice(-28).flatMap((date, i) => {
  const platforms: SocialPost['platforms'] = i % 7 === 1 || i % 7 === 4 || i % 7 === 6 ? ['instagram', 'youtube'] : ['instagram'];
  return [
    {
      id: `post-seed-${date}`,
      caption: CAPTIONS[i % CAPTIONS.length],
      mediaUrl: null,
      platforms,
      status: 'published' as const,
      scheduledFor: `${date}T18:00:00Z`,
      createdAt: `${date}T09:00:00Z`,
    },
  ];
});

export const socialPosts: SocialPost[] = [
  ...PUBLISHED_POSTS,
  {
    id: 'post-seed-queued-1',
    caption:
      'Night 7 of 21 with a nurse on rotating shifts. Deep sleep on screen, no app, no account. Full series this month.',
    mediaUrl: null,
    platforms: ['instagram'],
    status: 'queued',
    scheduledFor: null,
    createdAt: `${SERIES_END}T18:00:00Z`,
  },
];

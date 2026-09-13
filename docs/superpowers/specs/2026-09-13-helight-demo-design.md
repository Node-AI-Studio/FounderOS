# Helight demo board: design

Date: 2026-09-13. Branch `demo/helight`, worktree `~/code/node-ai/founderos-helight`,
served by launchd on `http://127.0.0.1:4102`. Agreed in a brainstorm with
Cristoforo on 2026-09-13.

## Purpose

A FounderOS board that reads as Helight's own operator OS, shown to Yannick
Kiefer on sales calls. Helight is a DTC red light therapy brand (helight.com,
Shopify, Helight Sleep at $139, Kidzzz at $139, Nightlight at $25). The offer
Node AI is making is a full operator OS with marketing as the lead, per the
channel playbook in `~/code/clients/helight/research/` and the brain page
`companies/helight`.

Everything on the board is seeded. No connector reaches a real account. Every
number, customer and run is invented and plausible for a brand of this size,
and nothing claims to be Helight's real data. The DEMO DATA badge stays off,
as on the Alex board; Cristoforo says it on the call.

## Approach

Rewrite the seed in place on `demo/helight`, which branches from tag
`demo-alex` (commit `b8adc33`, the last commit with the seeded board). The
frozen tag reads everything from `lib/seed.ts`, so the Helight board is a
content change plus a handful of hardcoded ids. No seed-profile system, no
merge to `main`, ever.

## Identity and shell

- `lib/identity.ts`: firstName Yannick, fullName Yannick Kiefer, initials YK,
  workspace HELIGHT OS. No title, none is known.
- Unlock page heading HELIGHT OS.
- Command palette external links (`app/layout.tsx`): Shopify admin, Klaviyo,
  Meta Ads Manager, TikTok Ads Manager, Google Ads, Amazon Seller Central.
  The Skool link goes.
- Social page newsletter label becomes "Klaviyo list"; the Beehiiv mention
  in `SocialStatStrip` becomes a Klaviyo mention.

## Departments

Seven pillars. Six existing ids are relabelled and one id is added, because
`lib/life-map.ts`, `lib/knowledge-graph.ts` and their tests key on ids. The
org page renders whatever departments the database holds.

| Order | Pillar | id | Tagline | Graph letters |
|---|---|---|---|---|
| 1 | Growth | `dept-marketing-growth` | Paid: Meta, TikTok, Google. | CMO |
| 2 | Content | `dept-content` (new) | Organic and creators. Finds the winners. | CCO |
| 3 | Retention | `dept-clients` | Klaviyo and everything after the first order. | CRO |
| 4 | Store | `dept-sales` | The Shopify storefront and its proof. | CPO |
| 5 | Customer Care | `dept-comms` | Every inbound customer voice. | CXO |
| 6 | Finance | `dept-finance` | Money in, ad money out, margin per SKU. | CFO |
| 7 | Operations | `dept-tech` | The OS itself: memory, conduct, schedule. | COO |

Life map: `marketing` area gets `dept-marketing-growth` and `dept-content`;
`sales` gets `dept-sales`; `clients` gets `dept-clients`; `communication`
gets `dept-comms`; `finances` gets `dept-finance`; `knowledge` and
`operations` keep `dept-tech`. Life area labels are relabelled to match
where they show: Marketing, Store, Retention, Customer Care, Finances,
Knowledge, Operations.

## People

Heads of department by role only, no invented employee names: Head of Growth,
Content Lead, Retention Lead, Store Manager, Customer Care Lead, Bookkeeper,
Operations Assistant. One per pillar, each with two tools from the stack.

## Agents

Seventy-five agent rows, plus two Growth agents listed under Content through the venture map. Names follow role plus object, the way the installed
claude-ads plugin names its agents. Every agent has a seed row (tier `lead`
for the pillar's first agent, `specialist` or `worker` for the rest), one SOP
task with five to six steps, and a runtime entry in `lib/agents/real.ts`.
The seed test requires every seeded agent to map to a runtime agent, so the
runtime gets a `seededRun(id)` factory that returns a canned, deterministic
summary per agent in stub mode; the existing real runs (Zernio, Arcads,
Gmail, Slack, G-Brain, stack monitor) stay attached to the agents that still
use those connectors.

"Heroes" get the densest run history in `seededAgentRuns`, and their SOP
steps carry the specific Helight detail.

### Growth, 17

| Agent | What it does |
|---|---|
| Growth Planner (lead) | Sets the week's lanes, angles and budget. Holds Yannick's two approvals: the week, and spend on winners. |
| Competitor Researcher | Rival ads in the Meta ads library, rising TikTok formats, objections in comments and reviews. |
| Creative Strategist | Turns lanes and angles into briefs, one hypothesis per asset. |
| Ad Copywriter (hero) | Hooks and scripts at volume against proven structures. |
| Visual Designer | Stills, product shots and UGC variants from the briefs. |
| Format Checker | Every asset against current Meta, TikTok and Google specs, including AI-content disclosure. |
| Compliance Auditor (hero) | Blocks any asset with a claim outside the substantiated allowlist. Shared with Content. |
| Translator | Winners only into French and German. Shared with Content. |
| Campaign Launcher | Pushes approved assets into Meta, TikTok and Google, structured per platform. |
| Meta Ads Auditor (hero) | Pixel and CAPI, audiences, placements, creative fatigue. |
| TikTok Ads Auditor | Events API, Smart+, Shop campaigns. |
| Google Ads Auditor | Brand search, Shopping, Performance Max. |
| Budget Auditor (hero) | Daily pacing, marginal return, when to scale or cut. |
| Experiment Designer | Kill and promote rules, sample sizes, what each test decides. |
| Tracking Auditor | Conversion events, deduplication, attribution windows. |
| Landing Page Auditor | Message match from ad to product page, mobile friction. |
| Ads Reporter (hero) | Monday brief: spend, MER, CPA, contribution margin, winners and kills. |

### Content, 13 rows plus 2 shared

| Agent | What it does |
|---|---|
| Content Planner (lead) | Weekly calendar, 60 to 90 slots a month, one hypothesis per slot. |
| Creator Watcher (hero) | Watchlist of 20 to 50 sleep and wellness creators, pulls new posts, scores outliers. |
| Video Analyst | Tears down each winning video into topic, angle, hook, story, visual format, visuals, audio. |
| Comment Reader | Objections and questions from comments and reviews, fed to the planners. |
| Hook Miner (hero) | The vault: winning hooks turned into slotted templates. |
| Script Writer | Research, then hook, then style, then body. Never one-shot. |
| Video Producer | AI-generated video for volume testing, product spotlights from the brand pack. |
| Edit Assistant | Cuts, captions and crops prepared for a human editor. Editing stays human, and the board says so. |
| Publisher (hero) | Daily cadence on TikTok, Instagram and YouTube Shorts. The feed never goes dark. |
| Creator Recruiter | Finds and vets creators per audience lane. |
| Creator Briefer | Briefs from the angle bank, disclosure rules, whitelisting terms. |
| 21 Nights Producer (hero) | Runs the day 1, 7, 21 series across creators in parallel, wearable data on screen. |
| Performance Reader (hero) | Kills losers, flags winners to Growth's Campaign Launcher, writes learnings back to the planner. |
| Compliance Auditor | Listed here through the venture map; the agent row lives in Growth. |
| Translator | Same. |

The venture map lists Compliance Auditor and Translator under both pillars;
their agent rows live in Growth.

### Retention, 11

| Agent | What it does |
|---|---|
| Lifecycle Planner (lead, hero) | Maps the flows: welcome, browse abandon, cart abandon, post-purchase, review request, win-back, gifting. |
| Segment Builder | Audience lanes as Klaviyo segments: parents, shift workers, wearable optimisers, travellers, couples. |
| Email Writer | Copy for every flow and campaign, in the brand voice. |
| SMS Writer | Cart, shipping, night 7 and night 21 check-ins. |
| Campaign Composer | Weekly sends: education, proof, seasonal, gifting. |
| 21 Nights Coach (hero) | Post-purchase sequence at day 1, 7 and 21. Keeps the device in use through the three weeks, fewer 60-day refunds, review request on the right night. |
| Offer Designer (hero) | Bundles and second-device offers: Sleep x2, Sleep plus Kidzzz, gifting, guarantee framing. |
| Referral Runner | Couples and parents refer; partner and second bedroom offers. |
| Win-back Writer | Lapsed browsers, abandoned carts past the flow, gift-season returns. |
| Flow Auditor | Deliverability, list health, flow versus campaign revenue share. |
| Retention Reporter | Repeat rate, flow revenue, refund rate against the guarantee, list growth. |

### Store, 12

| Agent | What it does |
|---|---|
| Store Auditor (lead, hero) | Weekly crawl: empty pages, dead nav items, broken comparison rows, dates that disagree. |
| SEO Auditor | Technical SEO, duplicate blog titles, locale handling across EN, FR, DE. |
| Evidence Curator (hero) | Patents, study chain, clinician positions, awards, survey: structured, sourced, dated, checkable. |
| Page Writer | Fills science, doctor-recommended, compare and better-sleep from the curated evidence. |
| AI Answer Optimizer (hero) | Rewrites agents.md and llms.txt, adds schema, tracks whether assistants cite Helight for "what helps me fall asleep". |
| Product Page Optimizer (hero) | Message match, proof blocks, mobile friction, guarantee placement. |
| Storefront Tester | A/B tests on offers, guarantee wording, bundle placement. |
| Blog Writer | Product-led, comparison and objection posts. |
| Catalog Keeper | SKUs, variants, stock, locales. Flags the out-of-stock nightlight and the unbuyable Care row. |
| Promo Planner | Promo calendar, bundle rules, gifting seasons. |
| Amazon Listing Auditor | Listing health, reviews, Sponsored Products on Seller Central. |
| Store Reporter | Sessions, conversion rate, AOV, by locale and device. |

### Customer Care, 11

| Agent | What it does |
|---|---|
| Support Triage (lead, hero) | Sorts contact form, email and marketplace messages into skip, info, action, urgent. |
| Reply Drafter | Every reply in brand voice, inside the allowlist. Drafts only, a human sends. |
| DM Responder | Questions in TikTok and Instagram DMs and comments; buying intent to the store. |
| Refund Handler (hero) | Guarantee requests: checks nights used, offers the 21 Nights path first, processes when due. |
| Shipping Tracker | Where is my order, customs and duties across 40 countries. |
| FAQ Keeper | Approved answers for infants, eyes, pregnancy, medication. Anything outside escalates. |
| Escalation Manager | Press, retail buyers, clinicians and angry customers go to Yannick with context. |
| Review Monitor | Site, Amazon and Ulta reviews; flags one and two stars, drafts replies. |
| Voice of Customer (hero) | Weekly synthesis of objections and questions, fed to Content's Comment Reader and Store's Page Writer. |
| Team Feed | Slack and inbox digest. Keeps the existing Gmail and Slack runs. |
| Care Reporter | First response time, resolution time, refund rate, top five issues. |

### Finance, 4

| Agent | What it does |
|---|---|
| Payments Pulse (lead) | Shopify Payments and Amazon payouts, daily. |
| Ad Spend Ledger | Spend per platform per day against the plan. |
| Contribution Margin | Per SKU, after ads, shipping and refunds. The number that decides whether scaling a winner is right. |
| Month Close | Books closed monthly with three lines of commentary. |

### Operations, 7

| Agent | What it does |
|---|---|
| Conductor (lead) | Routes directives across the pillars and runs the weekly loop. Keeps the existing broadcast run. |
| Knowledge Agent (hero) | Answers from the company brain: evidence base, claims allowlist, brand pack, decisions. Keeps the existing G-Brain run. |
| Brand Pack Keeper (hero) | Versions brand context, logos, approved product photography and templates. |
| Brain Auditor | Markdown and vector index health. Merges the two existing auditors. |
| Connector Monitor | Honest status of every connector: connected or needs key. Keeps the stack monitor run. |
| Scheduler | Cron runs, run log, failure alerts. |
| Data Agent | Pulls numbers across connectors for every pillar's reporter. |

## The visible loop

Three handoffs are written into SOP steps and the workflows page so the
method shows on screen without narration:

1. Content's Performance Reader flags a winner to Growth's Campaign Launcher.
2. Customer Care's Voice of Customer feeds Content's Comment Reader and
   Store's Page Writer.
3. Compliance Auditor gates both Growth and Content before anything ships.

Yannick's two touchpoints, approving the week and approving spend on winners,
appear in Growth Planner's SOP and as the two `person`-assigned SOP tasks.

## Venture and funnel

One venture, `helight`, label "helight.com", kind "DTC store". The venture
map's `areaAgents` lists the agents per life area. `FunnelVentureSchema`
becomes `z.enum(['helight'])`; `app/funnel/page.tsx` and `FunnelNodeCard`
lose the two-venture branches. Funnel stages keep their ids and are relabelled
for ecommerce: first touch (ad or organic), site visit, email captured, cart,
purchase. Channels used: `organic`, `ads`, `dm`, `email`, `checkout`.

Fourteen fictional customers with plainly illustrative names, across the
audience lanes (parents, shift workers, wearable optimisers, travellers,
couples, melatonin quitters), buying Helight Sleep at $139, Kidzzz at $139 or
the two-pack, over the last 30 days.

## Workflows page

Three machines replace the Vantage and Launchpad ones: "Content engine"
(signal to publish to analysis), "Paid amplification" (winner to launch to
report) and "First order to second device" (Klaviyo flows). Revenue figures
illustrative. Skills list rewritten to the same vocabulary, each owned by one
of the agents above.

## Connections board

- Confirmed stack, status `available` (needs key): Shopify, Klaviyo, Meta
  Ads, TikTok Ads, Google Ads, Amazon Seller Central.
- Unnamed slots, status `planned`, one line on what each would feed: Support
  inbox, Reviews, Attribution.
- Retail (Ulta, Goop), status `planned`, status-only, no integration claimed.
- Node AI's creative tooling, labelled as what Node AI brings: Arcads (UGC),
  Remotion (short-form editing), Higgsfield (AI visuals), Whisper
  (transcription), Zernio (publishing).
- Kept as is: G-Brain, brain-store, ZeroEntropy, Supabase, Gmail, Slack,
  tmux, Ollama, Vercel CLI, GitHub CLI.
- Removed: Skool, FanBasis, PAVA, Wispr, WhatsApp, WebinarJam, Trakyo,
  GoHighLevel, Fathom, Notion, Miro, Canva/Figma, Notes Vault, ManyChat,
  Command Center, OpenClaw, PayPal, Square, Whop, Stripe.

## Roadmap, phases, brain modules, metrics

Roadmap rewritten as a Helight rollout: connect the stack (now), content
engine live (next), paid amplification and Klaviyo flows (next), scheduled
autonomy (later), handoff to Helight's team (later). Four phases with the
same arc. Eight brain modules become ecommerce ones: Command and Memory,
Evidence Base, Brand Pack, Ad Accounts, Content Vault, Lifecycle Email,
Customer Voice, Finance. Pulse metrics: sessions, conversion rate, AOV,
blended MER, repeat rate, refund rate.

## Social and comms

Instagram and TikTok handles only if Helight's public ones verify at
implementation time; otherwise null. Follower and list series stay seeded,
with the existing honest note. Instagram DMs and the comms feed become
customers asking about sleep onset, kids, travel, shipping and the guarantee.

## Out of scope

Real connections of any kind. The Pro line. Amazon or retail as venture
lanes. Any change to `main` or to the `demo-alex` tag. Design changes to the
theme or page structure.

## Verification and delivery

- Tests updated for the new ids and enums; `npm test` green and
  `npm run typecheck` clean before any rebuild.
- Commits on `demo/helight`, one logical change each, pushed as a branch to
  the same remote. No PR, no merge.
- Rebuild into `.next-prod`, delete `data/founder-os.db*`, reseed with
  `FOUNDER_OS_DEMO_SEED=1`, restart the launchd job, unset the flag, restart
  again, then walk every page on 4102: `/`, `/agents`, `/org`, `/brain`,
  `/funnel`, `/social`, `/comms`, `/workflows`, `/roadmap`, `/analytics`,
  `/integrations`.
- The Alex board on 4101 and the real OS on 4100 are not touched.

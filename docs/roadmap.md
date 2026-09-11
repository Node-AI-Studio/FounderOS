# Node AI OS roadmap

Written 2026-09-10 from a full read of the repo, the four audit reports of that
day, and the 103-minute "Inside TheFounderOS" webinar (transcript saved next to
the recording on the Desktop). This is the document to reopen when the plot is
lost. Tick boxes as tasks land; one commit per task; keep the "Done when" lines
honest.

Detailed, code-level plans live in `docs/superpowers/plans/`. Phase 1 has one.
Phases 2 to 4 get theirs when we reach them; phase 3 needs a design pass first.

## What we are building, in one paragraph

An operator console for Node AI that runs on our own machine, reads our real
tools, and gives named agents real jobs. The open-source demo we started from is
the front end only. The product Bennett sells in the cohort is the folder
underneath it: an encoded company (context, decisions, invariants, one folder
per department with its agents and skills) that any harness can run on. We
build that folder ourselves on top of the Node AI brain, and keep the front end
honest: nothing shows as connected without a network call behind it, nothing
external happens without a human approving it, and the finish line is no dummy
data on any page.

## Principles we keep (from the webinar and the audit)

- The harness is disposable. Claude Code, Codex, Hermes, OpenClaw are all the
  same thing. The value is the folder and the encoded processes underneath.
- One place for context. Contradictory copies of a fact are worse than none.
- Human verification on anything external: mail, DMs, money, proposals.
  Bennett's agent refunded a customer in full without asking. Ours never will.
- Honest status. `connected` means a live call succeeded. Presence of a key is
  `not configured` until a call proves otherwise.
- Small skill library, handcrafted for the five to ten jobs we run daily.
  Everything else is noise and token cost.
- Finish line: no dummy data on any page. Then it goes to production.

## Where we are (2026-09-10)

| Fact | State |
|---|---|
| Branches | `main` has 11 Paperclip commits. `founder-os` has 46 commits of our work. Neither knows the other. Two conflicting files. |
| Tests | 959 passing, typecheck clean, on both branches |
| Connectors | 12 live on `founder-os`; `main` still registers Bennett's nine |
| Seed | Local DB holds 1,814 seeded rows from August. Seed flag undocumented. |
| Server | launchd job on 127.0.0.1:4100 from `.next-prod`; survives closed terminals. Tailnet https URL pending the certificate toggle. |
| Agents | Paperclip on the Hetzner box pushes as `nodeai-agents`, write on FounderOS only |
| LLM | Vercel AI Gateway, `anthropic/claude-sonnet-5`, $15 credit as of 2026-09-11 |
| Scheduler | None. Cron rows are stored and never run. |
| Knowledge | gbrain reader against the shared Node AI brain. Knowledge graph on `/brain` still renders seeded rows. |

## Phase 1: one branch, one server, one URL (this week)

Detailed plan: `docs/superpowers/plans/2026-09-10-phase-1-consolidate.md`

- [x] **1.1 Merge `founder-os` into `main`.** Done 2026-09-11, PR #17. Why: every fix we rely on is on
  the wrong branch, and Paperclip workers branch from `main`. Done when
  `git log --oneline main` shows the merge, both conflict files keep both
  sides, and the gate is green. Verify: `npm test && npm run typecheck`.
- [x] **1.2 Document the seed flag and pin Node.** Done 2026-09-11, PR #18. Why: a fresh clone that
  follows the README boots to empty pages, and CI pins Node 22 while the README
  says 18. Done when `.env.example` and the README name
  `FOUNDER_OS_DEMO_SEED` and `package.json` engines matches CI. Verify: new
  test `tests/env-example.test.ts` passes.
- [x] **1.3 Comms feed cache.** Done 2026-09-11, PR #19: warm `/comms` 20 ms, was 5 s. Why: home and `/comms` still take 4 to 5 s
  because IMAP, WhatsApp, and Slack are fetched on every render. Same
  stale-while-revalidate pattern as the connector status cache. Done when a
  warm `/comms` renders under one second. Verify: `curl -w '%{time_total}'`
  twice, second under 1.0.
- [x] **1.4 Persistent server.** Done 2026-09-11, PR #20: launchd job `ai.nodeagency.founderos`, `.next-prod`, unlock verified over http. Reboot test still owed. Why: the production server dies with the
  session that started it. Done when a launchd job runs `next start` at login
  from its own build directory and survives closing every terminal. Verify:
  `launchctl list | grep founderos` and a curl after a reboot.
- [x] **1.5 Stable URL.** Done 2026-09-11 over http: `http://cristoforos-macbook-pro.tail75c26d.ts.net`, unlock verified through it (PR #21 fixed proxied redirects). https waits for the tailnet certificate toggle. Why: phone access, and https removes the cookie
  problem for good. Done when `tailscale serve status` shows 4100 and the
  unlock flow works from the phone. Verify: open the ts.net URL on the phone.
- [x] **1.6 Real model.** Done 2026-09-11: $15 credit on the gateway, `LLM_MODEL=anthropic/claude-sonnet-5`, Conductor answered. Why: agent chat runs on `google/gemini-2.5-flash-lite`
  because the gateway had no credit. Done when credits show on the gateway,
  `LLM_MODEL=anthropic/claude-sonnet-5`, and the Conductor answers. Verify:
  `POST /api/agents/conductor/chat` returns text, not 500.

Exit: one branch, one always-on server, one URL, chat on the right model. Reached 2026-09-11; owed: the reboot test and the https toggle.

## Phase 2: make the data ours (next two weeks)

Mostly deletion. Each task is small and independent; order by what you look at
most.

- [ ] **2.1 Turn the seed off.** `FOUNDER_OS_DEMO_SEED` unset in `.env.local`.
  Then, table by table, delete the fictional rows and watch which page goes
  empty. That list is the real backlog. Done when the local DB holds no row
  with an id starting `seed-` and no name from `lib/seed.ts`. Verify:
  `sqlite3 data/founder-os.db "select count(*) from agent_runs where id like 'seed-%'"` is 0.
- [ ] **2.2 Delete the four lying tiles.** Meta Ads, Trakyo, GoHighLevel report
  connected without a network call; Skool is seeded connected with no
  connector. Remove the tiles, the seed rows, and the two venture-specific
  connectors. Done when `/integrations` shows only connectors with a real
  status function. Verify: `tests/connector-index.test.ts` updated and green.
- [ ] **2.3 Prune the catalog.** 44 of 62 tiles have no connector and still
  offer a Connect button that writes a key nothing reads. Keep the tiles we
  will wire in the next quarter, delete the rest. Same for the `SQUARE` and
  `WHOP` key slots. Done when every tile with a Connect button has a
  `connectorId`. Verify: a test asserting that invariant.
- [ ] **2.4 Rename the ventures.** `vantage` and `launchpad-cohort` are
  Bennett's businesses baked into `FunnelVentureSchema`, the FanBasis keys, and
  the funnel classifier. Replace with Node AI's lines of business (agency
  retainers, products such as ClientOS and LeadGenOS). Done when the funnel
  page filter shows our names. Verify: `tests/funnel*.test.ts` green after the
  rename.
- [ ] **2.5 Close the webhook.** `/api/webhooks/manychat` is outside the auth
  gate and accepts anything when the secret is blank. Make a blank secret a
  503, use `safeEqual`, and drop the unauthenticated GET. Done when the new
  test for the blank-secret case passes.
- [ ] **2.6 Finish the Alex sweep.** 170 references on `main`; fewer on
  `founder-os` after the wording commits, but the theme storage key, the
  life-map label, the knowledge-graph self node, and the escalation target
  still say Alex. Done when `grep -rn -i alex lib app components` returns only
  seed fixtures that 2.1 deletes.
- [ ] **2.7 Brain page honesty.** Remove the hardcoded "918 pages / 11k chunks"
  and "v0.41", and stop the embeddings row defaulting to LIVE. Done when every
  number on `/brain` comes from `gbrain stats` or the store walk.
- [ ] **2.8 Real costs.** Agent runs never record tokens and chat discards the
  gateway usage, so the cost panel is seeded fiction. Persist `usage` from
  the gateway on chat and on any run that calls the model. Done when a real
  chat produces a non-null `costUsd` row.

Exit: every page shows our data or an honest empty state.

## Phase 3: the encoded company (month two)

This is the part the cohort sells and the repo does not contain. Needs a
brainstorm before a plan, because it is a structure decision on top of the
existing Node AI brain, not a new store.

- [ ] **3.1 Design the folder.** From the webinar, the spine is: a company
  identity file, `context.md`, `decisions.md`, an invariants file (rules that
  are never broken), then one folder per department holding its agents and
  skills, then outputs, dated and named. Decide how this maps onto
  `~/code/node-ai/brain` and its `RESOLVER.md`. Output: a spec in
  `docs/superpowers/specs/`.
- [ ] **3.2 Run the interview.** Bennett's tooling scrapes the machine and asks
  the questions; we do the same by hand with the brain's existing pages and
  the questions from the webinar: what do you check first, what do new people
  get wrong, what decisions can you make alone, what separates good from great.
  Output: `context.md` and `decisions.md` for Node AI.
- [ ] **3.3 Encode one department.** Sales first, because Attio and Stripe are
  live. Department head, workers, the skills they run, the tools they touch,
  what "done" looks like, what they may never do.
- [ ] **3.4 Point the OS at the folder.** `/org`, `/agents`, and `/brain` read
  the folder instead of seeded rows. `lib/brain-docs.ts` already generates
  the reverse direction (DB to markdown); invert it or replace it.
- [ ] **3.5 A scheduler that runs.** Cheapest honest version: a launchd job
  that calls `POST /api/agents/broadcast` on an interval, then a "morning
  brief" skill as the first scheduled job. Bennett runs his on a local Ollama
  model to save tokens; try that for the low-complexity jobs.
- [ ] **3.6 Three agents that produce output.** Inbox digest, payments pulse,
  CRM pulse. Each stores a dated, named output the operator reads in the
  morning. Six of thirty agents fetch real data today; these three become the
  ones that matter.
- [ ] **3.7 Approval layer.** Anything external (mail, DM, money, proposal)
  drafts and waits. Five levels from the webinar: look up freely, recommend,
  act with spot check, run independently for qualifying and follow-ups, self
  monitor. Encode the levels in the agent definitions.

Exit: the OS runs on the encoded company, one department works without being
asked, and nothing external goes out unapproved.

## Phase 3b: host it on Railway (when the laptop stops being enough)

Bennett's advice in the webinar: the Mac mini route or the Railway route, and
for anyone without a machine that stays on, Railway. He moved off Hetzner
because a bare box needs Node, a process manager, a proxy, TLS, and backups
kept by hand; Railway builds from the GitHub repo on every push, gives the app
a TLS URL, holds the env vars, and adds a managed database next to it.

Trigger: the first time the OS must be reachable while this Mac is asleep, or
Niek uses it daily. Not before the encoded company exists, because the folder
and its agents are the thing worth hosting.

- [ ] **3b.1 Decide the database.** The app writes a local SQLite file. On
  Railway that file lives on a mounted volume or it resets on every deploy.
  Either mount a volume at `/app/data`, or move the repo layer to the managed
  Postgres the README promises. The volume is the honest first step.
- [ ] **3b.2 Decide the knowledge companion.** The README says G-Brain runs as
  a companion service referenced by URL, but nothing in the repo defines it.
  Options: run gbrain in a second Railway service against the shared brain
  repo, or keep the brain on the Mac and let the hosted app degrade to grep.
  Decide with Niek, since the brain's sync writer is his machine.
- [ ] **3b.3 Deploy the app.** New Railway project from `Node-AI-Studio/FounderOS`,
  Dockerfile build (already in the repo, non-root, healthcheck on `/`),
  `FOUNDER_OS_ACCESS_TOKEN` and every connector key from `.env.local` as
  service variables, `FOUNDER_OS_DEMO_SEED` unset, volume at `/app/data`.
  Verify: the Railway URL redirects to `/unlock`, the token opens the console,
  `/integrations` shows the same connectors green as the Mac.
- [ ] **3b.4 Local-only connectors.** WhatsApp, Wispr, Obsidian, the local stack
  probes, and the skills reader read files on this Mac. On Railway they report
  not configured. Either accept that or unregister them for the hosted build.
- [ ] **3b.5 Custom domain and the phone.** Point a Node AI subdomain at the
  Railway service; retire the tailnet URL for the app, keep Tailscale for the
  Paperclip box.
- [ ] **3b.6 Costs and rollback.** Record the monthly Railway cost in the
  decisions table. Rollback is `railway redeploy` of the previous deployment;
  the Mac launchd job stays installed as the fallback host.

Exit: the OS answers at a Node AI domain with the laptop closed, the data
survives deploys, and the Mac remains a one-command fallback.

## Phase 4: decide the offer

Only after phase 3 exists, because the folder is what would be sold.

- [ ] **4.1 Internal tool or Node AI offer?** The webinar's third audience is
  agencies selling the OS to clients: roughly $10k setup plus a $1,500 monthly
  retainer for a restaurant owner, done on a Mac mini. If that is the play, the
  encoded company method and the scheduler are the product, Paperclip is the
  fulfilment engine, and the UI is the demo.
- [ ] **4.2 If yes: the client method.** What the interview asks, what the
  folder looks like on day one, how the tools connect, how it is hosted (Mac
  mini on Tailscale or a VPS), what the client owns. This becomes a brain SOP.
- [ ] **4.3 If yes: pricing and the first client.** Pick one existing client
  where a comms digest and a payments pulse would obviously pay for itself.

## Decisions taken

| Date | Decision |
|---|---|
| 2026-09-10 | Keep the 44 unwired catalog tiles for now (Cristoforo). Revisit in 2.3. |
| 2026-09-10 | Persistent URL via launchd and Tailscale, not a container host yet. |
| 2026-09-10 | `main` is protected: PR with green `verify` and one review. Admin enforcement is off, so founders merge their own PRs with `gh pr merge --admin` under personal accounts; agent PRs need the check and a human approval. |
| 2026-09-11 | Agents act on GitHub as `nodeai-agents` (display name Node AI Agents, mail `agents@nodeagency.ai` on the admin inbox): org member, write on FounderOS only, read elsewhere. Its fine-grained token `paperclip` (Contents and Pull requests, FounderOS only, expires 2027-09-12) is Paperclip secret `github-founderos` v2 and the box's only GitHub login. Fence proven 2026-09-11: branch push accepted, push to `main` refused. |
| 2026-09-11 | `nodeagencyai` is left exactly as it is: still an org owner, still owns its profile repo. Nothing on this Mac or the box authenticates as it any more. Its two stray repos moved into the org; `nespola-osint-old` is a strict subset of `nespola-osint` and can be deleted. |
| 2026-09-11 | Production URL on the tailnet: `http://cristoforos-macbook-pro.tail75c26d.ts.net`, Tailscale Serve on port 80 proxying 127.0.0.1:4100. Switch to `tailscale serve --bg --https=443 http://127.0.0.1:4100` once certificates are enabled. |
| 2026-09-11 | Tailscale Serve needs HTTPS certificates enabled on the tailnet (admin console, DNS, HTTPS Certificates) before it can front 4100 over https. Until then the tailnet URL is http only. |
| 2026-09-11 | Fine-grained tokens on the org need owner approval (Org settings, Third-party Access, Personal access tokens, Pending requests). The API for that list returns 404 on this org; approve in the browser. |
| 2026-09-10 | No em dashes, no emojis, dark monochrome artifacts (house style). |
| 2026-09-10 | Slack bot channel membership and the Obsidian vault switch are Cristoforo's manual actions, not code. |

## Open questions

- Which Node version is canonical: CI runs 22, `founder-os` pins 20.x. Pick one
  in task 1.2.
- Do we keep Paperclip dispatching onto this repo after phase 1, or pause it
  until phase 3 gives it something to build?
- Rotate the `nodeai-agents` token before 2027-09-12, or sooner if the box is ever rebuilt.
- Railway or a second Mac mini for the always-on host? Bennett runs a Mac mini on Tailscale and recommends Railway for everyone else. Decide at phase 3b.
- Does the encoded company live inside `~/code/node-ai/brain` or as its own
  repo that the brain links to? Decide in 3.1.

## How to use this document

- Reopen it at the start of every session that touches this repo.
- Tick a box only after the "Verify" line has actually run.
- When a task grows a sub-decision, add it to "Decisions taken" with the date.
- When a phase starts, write its detailed plan in `docs/superpowers/plans/`
  and link it from the phase heading.

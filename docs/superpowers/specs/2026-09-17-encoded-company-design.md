# Encoded company and digital workforce: design

Date: 2026-09-17. Status: draft for review by Cristoforo and Niek.
Roadmap: phase 3 (3.1 to 3.7) and phase 4.2 of `docs/roadmap.md`.

## Goal

A digital workforce that pushes every department of Node AI forward, defined in
plain files that any harness can run, and built so the same structure can be set
up for a client. Node AI is the first tenant; the method is proven on us before
it is sold.

## Decisions this spec rests on

| Date | Decision |
|---|---|
| 2026-09-17 | The encoded company lives in the Node AI brain (`~/code/node-ai/brain`), not in this repo and not in a new content repo. |
| 2026-09-17 | Agent outputs are dated markdown files in the brain. The FounderOS interface is expected to be rebuilt, so nothing depends on its database. Roadmap task 3.0 (Supabase under the repo layer) is deferred. |
| 2026-09-17 | The workforce runs on Paperclip on the Hetzner box. Definitions stay harness-neutral so the runtime can change. |
| 2026-09-17 | Order of work: template structure, then the company reverse-engineered, then departments. Departments are named by the founders from the company model, not inferred from SOP names. Sales is the leading candidate for the first department. |
| 2026-09-17 | Jobs are chosen from an audit of founder time, not from a generic use-case list. |
| 2026-09-17 | The structure is split into a replicable kit and per-tenant content. |

Sources behind the method: Anthropic's Founder's Playbook (Launch stage: audit
founder attention, then design trigger, rules, output, destination), the Claude
Code guide for startups (invariants file, golden sets, correction loop), the
AI-native SDLC playbook (separation of duties, advisory skills versus enforced
gates, escalation bands), and the 2026-09-17 sales research (agents draft,
humans send).

## 1. Two layers

**The kit** is generic and versioned in its own repository (working name
`node-ai/encoded-company`, to be renamed when the offer is named). It holds:

- `schema-packs/encoded-company.pack.json`: the workforce page types and link
  verbs in section 2, with nothing specific to Node AI.
- `templates/`: blank pages for a department, an agent, a job, an output and a
  rule, matching section 3.
- `method/`: the time audit, the job definition checklist, the correction loop,
  and the replicability test, written as instructions a founder or an agent can
  follow.
- `skills/`: generic skills an agent executes (for example "compile a pipeline
  digest from a CRM"), in `SKILL.md` format so Paperclip can sync them.
- `bootstrap/`: how a tenant's departments and agents become a Paperclip company.

**A tenant** is one brain plus one Paperclip company. Node AI is tenant one: its
brain is the existing `node-brain`, its Paperclip company is the existing
`Node AI` company (id `a1f24230`). A client tenant gets its own brain repository,
its own gbrain source, and its own Paperclip company. Client content never
enters the Node AI brain.

Filing rule while encoding Node AI: an addition goes into the kit only if a
client would need it too. Everything else stays in the tenant.

## 2. Brain structure

### Page types

Declared through `gbrain schema add-type` in the kit pack, never by editing JSON.
`node-brain` takes them with `borrow_from: encoded-company`.

| Directory | Type | Primitive | Extractable | Expert routing | Holds |
|---|---|---|---|---|---|
| `rules/` | `rule` | concept | no | no | invariants: rules no agent or person breaks |
| `departments/` | `department` | entity | no | yes | one charter per department |
| `agents/` | `agent` | entity | no | yes | one page per agent |
| `jobs/` | `job` | concept | no | no | one page per recurring job |
| `outputs/<department>/` | `output` | temporal | no | no | dated agent output, written once |

Existing pages that change type: `rules/brain-first.md` is filed as `note` today
because no type claims `rules/`; it becomes a `rule`.

The Node AI identity page is `companies/node-ai.md`, type `company`, which
`RESOLVER.md` already assigns to our own entities. It holds what Node AI sells,
to whom, how the company runs today, and links to every department. The name
`company/` is not used as a directory: it is already a prefix of the `company`
type.

### Link verbs

| Verb | From | To | Inverse |
|---|---|---|---|
| `part_of` | agent, job | department | `includes` |
| `reports_to` | agent | agent, person | `manages` |
| `performs` | agent | job | `performed_by` |
| `follows` | job | sop | `followed_by` |
| `produced_by` | output | job | `produced` |
| `approved_by` | job | person | `approves` |
| `led_by` | department | person | `leads` |

### RESOLVER.md additions

Inserted before step 5 (SOPs):

- A rule that must hold regardless of task or person goes to `rules/`.
- A department charter goes to `departments/`.
- A definition of an agent (who it is) goes to `agents/`; a definition of a
  recurring piece of work (what gets done, when, to what standard) goes to
  `jobs/`. A job is not an SOP: the SOP is how a human does it, the job is the
  contract an agent runs against, and links the SOP with `follows`.
- Anything an agent produced on a run goes to `outputs/<department>/`. When an
  output reveals that something changed (a renewal is due, a client went
  silent), the agent also updates the page that thing lives on, following the
  normal tree. The output records what was seen; the page holds current state.

## 3. Page shapes

Frontmatter fields listed are required. Bodies follow the brain's page shape:
compiled truth, a rule, then a dated timeline.

**Rule** (`rules/<slug>.md`): `type: rule`, `scope` (company or a department
slug), `enforced_by` (the mechanism that makes it hold, or `none`). A rule with
`enforced_by: none` is advisory, and the page says so.

**Department** (`departments/<slug>.md`): `type: department`, `led_by`. Body:
what the department is responsible for, the time inventory (section 5), its
agents, its jobs, its SOPs, its metrics, open questions.

**Agent** (`agents/<slug>.md`): `type: agent`, `part_of`, `reports_to`,
`performs`, `autonomy` (one of `read`, `draft`, `act`), `tools` (each connector
and the scope it gets), `runtime` (for Node AI: `paperclip`). Body: role in one
paragraph, what it may never do.

**Job** (`jobs/<slug>.md`): `type: job`, `part_of`, `follows` (when an SOP
exists), `trigger` (schedule or event), `autonomy`, `approved_by`,
`metric_leading`, `metric_lagging`, `golden_set` (path to the eval file or
`none yet`). Body: decision rules, output format, destination, what escalates
to a human and how.

**Output** (`outputs/<department>/YYYY-MM-DD-<job-slug>.md`): `type: output`,
`produced_by`, `run_id` (the Paperclip run), `status` (`final`, or
`pending_approval` with the approval id). Never edited after it is written; a
correction is a new output that links the earlier one with `supersedes`.

Golden sets live next to the brain's pages as `evals/<job-slug>.jsonl`, one
real past case per line with the accepted answer. They are not pages and gbrain
does not index them.

## 4. Enforcement

Two classes, kept separate.

**Advisory**: SOPs, job pages, agent pages and skills. They tell the agent what
good looks like. A capable model can still ignore them.

**Enforced**: mechanisms no prompt can talk past.

1. **No send capability without approval.** An agent at `draft` autonomy holds
   no credential that can send mail, post, move money or submit a proposal. It
   files a Paperclip approval (`paperclipai approval create`) with the draft as
   payload. The send happens after `approve`, by the human or by a sender step
   that only accepts approved approval ids.
2. **Separation of duties.** The agent that drafted cannot approve. `approved_by`
   on the job page names a person.
3. **Scoped credentials.** Every connector token on the box is least-privilege
   and per tenant (the `nodeai-agents` GitHub token, write on one repository
   with pushes to `main` refused, is the model).
4. **Brain writes are fenced.** Agents write to the brain on a branch. A GitHub
   Action merges the branch only if it adds new files under `outputs/`; any
   other change (a company page update, a skill edit) opens a pull request for a
   founder. Branch protection on the brain's `main` is required for this.

Initial `rules/` pages for Node AI, each already a standing rule elsewhere:

- Nothing external (mail, DM, money, proposal, bid) leaves without human approval.
- No browser automation against upwork.com, ever (UpBid, 2026-08-11 restriction).
- Attio is the only home of deal stage and value (`sops/sales-crm-attio`).
- Client content never enters the Node AI brain; client work runs in the client's tenant.
- The agent that produced work cannot approve it.

## 5. The time audit

Run per department, in stage 3, before any job is chosen. For Sales:

1. An agent pre-fills an inventory from the Sales SOPs, `OPEN-ITEMS.md`, recent
   `meetings/`, and Attio: every recurring task, every decision that lands on a
   founder, every workflow that only happens when someone remembers it.
2. Cristoforo and Niek correct it: add what is missing, remove what is not real,
   estimate hours per week.
3. Each item is sorted into one bucket: an agent can do it, a person who is not a
   founder can do it, or it needs founder judgment.
4. For each item in the first bucket: trigger, decision rules, output,
   destination. Items that stall when a founder is away for a week rank first.
5. The inventory and the sort go into `departments/sales.md`.

The research of 2026-09-17 supplies candidate jobs for step 4, not a decision:
pipeline and renewal watch (read), discovery call brief and call notes (read,
spot-checked writes), case study drafts (draft), Upwork screening and bid drafts
through UpBid only (draft).

## 6. Runtime on Paperclip

| Brain | Paperclip |
|---|---|
| tenant | company |
| department lead | the agent at the top of that department's reporting line |
| agent page | agent; its `AGENTS.md` instruction bundle is rendered from the agent page plus the job pages it performs and the SOPs those follow |
| kit skill | synced skill (`paperclipSkillSync.desiredSkills`) |
| job trigger | heartbeat schedule, or an issue created by an event |
| output | a file committed to the brain branch, and a comment on the run's issue linking it |
| approval | Paperclip approval; the decision and its comment are kept |

Rendering is one direction only, brain to Paperclip, by a script in the kit's
`bootstrap/`. Editing an agent in the Paperclip UI is not a source of truth and
is overwritten on the next render.

Lessons from the September pilot that apply: runs stalled waiting for a
disposition and nobody noticed (NOD-19 to NOD-23), a token without workflow
scope blocked a ticket silently (NOD-17), and a stream disconnect left a review
half done. So every job has a staleness check: if a scheduled run has no output
within twice its interval, the department lead agent files an issue for a human.

## 7. The correction loop

Approvals are how the workforce improves.

1. Every approval decision is kept with its comment: approve, reject, or
   request revision with a reason.
2. A weekly job per department reads the decisions and the edits made to drafts,
   groups them by cause, and proposes changes to the job page or skill that
   produced the mistake: the principle, not the single example.
3. The proposal is a pull request on the brain (or the kit, for a generic skill).
   Before merge, the job's golden set is re-run and the pass rate stated in the PR.
4. Every rejected draft that reveals a new failure becomes a golden set case.

## 8. Replicability test

After Sales produces useful output for two consecutive weeks:

1. Create an empty test tenant from the kit alone: new brain repository, the kit
   pack, the templates, a new Paperclip company.
2. Encode a fictional sales department with one read-only job, following only
   `method/`.
3. Pass when the job runs and writes an output without copying anything from the
   Node AI brain. Every file that had to be copied is a leak, and moves into the
   kit or gets rewritten generically.

## 9. Rollout

Three stages, in order. A stage starts only when the one before it is right.

**Stage 1: template structure (the kit).**

1. This spec is reviewed and approved by both founders.
2. Kit repository created with the pack and the templates for every page type
   in section 3, including the company page. Each template states what goes in
   every field and shows one filled example.
3. The kit pack installed on both machines; `gbrain schema active` shows the
   same sha8 on both before any page of a new type is written. `node-brain`
   borrows the kit types, `gbrain schema sync --apply` retypes
   `rules/brain-first.md`, `RESOLVER.md` is updated, and brain `main` is
   protected with the output-merge Action added.

**Stage 2: reverse-engineer the company.**

4. `companies/node-ai.md` filled from what the brain already holds and
   corrected by both founders: what Node AI sells, to whom, how revenue comes
   in, how work flows from first contact to delivery to renewal, who decides
   what, and which tools carry each step.
5. The `rules/` pages written from the standing rules in section 4 plus any the
   company model surfaces.
6. Done when both founders agree the page describes how Node AI actually runs
   today, and every existing SOP, product and client page links to a step of
   that flow. Steps with no SOP are recorded as absent, not filled in.

**Stage 3: departments.**

7. Departments named by the founders from the flow in step 4, one
   `departments/` page each, with `led_by`.
8. For the first department chosen: time audit (section 5), first one or two
   jobs defined, their agents rendered to Paperclip, run on a schedule, outputs
   reviewed daily for two weeks.
9. Correction loop switched on; replicability test run; next department.

## Out of scope

- Moving the generic types (`person`, `company`, `sop`, `decision`, `meeting`)
  from `node-brain` into the kit. Needed before a client tenant can stand alone,
  done as its own tested change after step 7, because it touches the typing of
  every existing page.
- Departments other than Sales.
- Any work on the FounderOS interface, and roadmap task 3.0.
- Pricing and packaging of the kit as an offer (phase 4.1 and 4.3).

## Risks

- **Schema drift between machines.** Two pack versions type pages differently
  with no error. Mitigation: rollout step 2 compares sha8s before writing.
- **Output noise in retrieval.** Outputs are not extractable; if they still
  crowd search results, gbrain queries used by agents exclude `outputs/` older
  than 30 days.
- **Sync writer.** Niek's machine syncs the shared brain database. Agent commits
  reach retrieval only after that sync runs; jobs that need yesterday's output
  read the file from git, not from search.
- **Kit designed in the abstract.** Mitigated by the filing rule in section 1
  and the replicability test in section 8.

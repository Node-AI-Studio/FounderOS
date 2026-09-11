# Paperclip pilot: design

Status: draft for review
Date: 2026-09-09
Sub-project: 1 of 6 (see "After" for what follows)

## Goal

Prove that upstream Paperclip holds as Node AI's agent control plane before
anything is migrated onto it. Two weeks, one repo, three agents, a fixed
pass/fail bar.

## The decision this tests

Approach A: adopt Paperclip unmodified as the harness, retire Command Center's
`src/runtime/` (15,530 lines, never run in production), and fork FounderOS as
the console. The pilot does not do any of that. It produces the evidence for
whether to.

## Non-goals

- No demos, no client data, no client companies.
- No changes to the FounderOS console beyond what agents do through tickets.
- No Command Center work.
- No Supabase, no knowledge layer, no connectors through Paperclip.
- No Paperclip UI customisation. Its stock UI is the operator surface.

## Infrastructure

| | |
|---|---|
| Host | Hetzner CPX22: 2 vCPU, 4 GB, 80 GB. Ubuntu 26.04. Chosen to match the Command Center box; rescale with `hcloud server change-type` if runs die with exit 137 (that is the box, not Paperclip). |
| Network | Tailscale. No public inbound. Hetzner firewall denies all except the tailnet. |
| Runtime | Node 24.11+ and pnpm 9.15+ for Paperclip only. founderos stays on Node 20 and npm. |
| Install | Pinned published npm version via `paperclipai install --version <v>`, not `curl \| bash`. Deviation from the original "GitHub ref" wording: a source build at `fac07b42ad41` (2026-09-09) fails on `cargo: not found` because `packages/paperclip-runner` compiles a Rust daemon the pilot does not use. The published version ships it prebuilt. The pin is still immutable; the exact version is in `ops/paperclip/pilot.env` as `PAPERCLIP_VERSION`. |
| Onboard | `paperclipai onboard --yes --bind tailnet` |
| Database | Paperclip's embedded Postgres. Adequate for the pilot; revisit before any client. |
| Cost | About EUR 37 for two weeks. Delete the box after, or keep it if the pilot passes. |

The box is separate from the Coolify host. Agents doing `npm install` and
`next build` must not share a machine with a deploy target, and a Coolify
restart must not kill runs in flight.

## Access

- Cristoforo and Niek: Paperclip board users.
- Claude Code: an SSH host entry `paperclip` in `~/.ssh/config`, root on this
  box only. Never on the Coolify host.
- Paperclip UI reachable only over the tailnet, including from phones.

## Companies

| Company | Purpose |
|---|---|
| `nodeai` | Real. Owns the three agents and the founderos project. |
| `pilot-iso` | Throwaway with fake data. Exists only for the isolation and export/import test. Deleted at the end. |

## Agents

Three, in FounderOS's SOP format: one job each, five to eight steps, an
escalation line. All three are `codex_local`.

### console-engineer

Implements tickets on the founderos fork.

1. Pick the next `todo` issue assigned to you in the founderos project.
2. Create a branch `agent/console-engineer/<issue-id>` in your worktree.
3. Read `CLAUDE.md` and `AGENTS.md` before touching code. House style applies.
4. Make the change with a failing test first, then implementation.
5. Run `npm test && npm run typecheck`. Do not open a PR while either is red.
6. Open a PR against `main` with the issue id in the title. Set the issue to `in_review`.

Auth: host Codex subscription. Escalation: if a step fails twice, set the issue
to `blocked` naming Cristoforo and the exact failure. Never force-push. Never
merge.

### test-engineer

Keeps the suite green and adds coverage for new work.

1. Pick the next `todo` issue assigned to you, or the nightly red-suite issue.
2. Reproduce the failure locally in your worktree before changing anything.
3. Fix the test or the code, whichever is actually wrong. Say which in the PR.
4. Add a test for any behaviour that had none.
5. Run `npm test && npm run typecheck` until green.
6. Open a PR. Set the issue to `in_review`.

Auth: host Codex subscription. Escalation: as above.

### reviewer

Reviews open PRs against the house rules. Comments only.

1. Pick the next PR with no review from you.
2. Read `CLAUDE.md` and `~/.claude/rules/common/house-style.md`.
3. Check: tests present, typecheck green, no em dashes, no secrets, staged
   paths explicit, one logical change.
4. Leave line comments for every violation, with the rule quoted.
5. Leave one summary comment: approve, request changes, or needs human.
6. Set the issue to `in_review` with the summary. Never merge. Never push.

Auth: per-agent `OPENAI_API_KEY` with a **USD 5** monthly cap in Paperclip.
This agent exists partly to prove the budget hard-stop fires, so the cap is
set low enough that ten PR reviews will certainly exhaust it inside the
pilot. If it does not fire, that is a finding, not a pass.

## Routine

One. Nightly at 02:00 UTC: run `npm test && npm run typecheck` on `main` of
the founderos fork. If either is red, create an issue assigned to
`test-engineer` with the output attached. If green, log and exit.

## Target repo

`Node-AI-Studio/FounderOS`, this repository. It is already a hard fork of the
public demo (origin points at Node-AI-Studio, 21 commits of upstream history).
The pilot works on it as-is. Sub-project 2 later gates the seeds and splits
the data layer; it does not create a new repo.

## Work source

The FounderOS customisation backlog, entered as issues under one goal:
"FounderOS usable as Node AI's console." Cristoforo writes the issues. Agents
do not invent work.

## Rails

- Agents work in Paperclip-managed worktrees. Branches `agent/<id>/<issue>`.
- PRs only. A human merges. Agents never push to `main`.
- Force-push is a hard stop, unchanged from house rules.
- `npm test && npm run typecheck` green before any PR opens.
- Concurrency: one run per agent (`maxConcurrentRuns: 1`). Paperclip has no instance-wide cap.
- Reviewer budget: USD 5 per month, hard stop.
- Subscription agents: no dollar cap exists. Watch the ChatGPT usage limit
  manually; Paperclip cannot see it.

## Pass criteria

All four, or the pilot did not pass.

1. Two weeks with no manual restart of Paperclip or its Postgres.
2. At least ten issues reach `done` via a human-merged PR.
3. The reviewer's USD 5 cap fires, the agent pauses, and its queued work is
   cancelled. Observed, not assumed.
4. `pilot-iso` exports and re-imports cleanly with secrets scrubbed, and no
   `pilot-iso` data is visible from inside `nodeai`.

## Fail criteria

Any one ends the pilot early.

- An orphaned run is not recovered without a human.
- Two agents claim the same issue.
- Budget or cost behaviour differs from Paperclip's documentation.
- Data or secrets cross a company boundary.
- The box needs more than one manual intervention per week to keep agents
  moving.

## After

**Pass.** Sub-project 2: fork FounderOS with the seeds gated off, split the
data three ways (Paperclip API, connector cache, config files). Sub-project 3:
the 21 connectors as an MCP server in Paperclip's tool gateway. The box is
kept and becomes the real control plane; embedded Postgres is replaced before
any client company is created.

**Fail.** Write up what broke and why. Keep Command Center's runtime. Do the
feature-only cleanup (delete CRM, project management, docs modules; point at
Attio and Linear). Revisit Paperclip in three months.

## Security

- The box holds Node AI's GitHub access and nothing else. No client
  credentials during the pilot.
- Secrets go in Paperclip's secret store, scoped to `nodeai`. Not in env files
  on disk.
- Codex subscription: log in on the VPS. Never copy `~/.codex/auth.json` from
  a Mac; the refresh tokens rotate and the two machines would invalidate each
  other.
- Paperclip's `frame-ancestors` and any public exposure: none. Tailnet only.

## Open decisions, not blocking the pilot

- Knowledge layer: the Obsidian vault exposed through an MCP tool
  (recommended) versus adopting G-Brain. Needed for sub-project 3.
- Hetzner location: Helsinki or Ashburn. Agents do not care; SSH latency from
  Brazil does.
- Whether `nodeai` stays on this box once client companies exist, or moves to
  its own. The pilot's sandboxing findings inform this.

## Out of scope, explicitly

Demo mode. Client personas. Console redesign. Command Center. Supabase.
Anything that writes to a third-party system.

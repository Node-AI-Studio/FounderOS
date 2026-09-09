# FOUNDER OS: agent rules

Full project docs live in **CLAUDE.md** (same directory). Read it first.
This file exists so non-Claude agents (Codex, etc.) get the same house rules.
Node AI runs this repo. Paperclip dispatches agents onto it, each in its own
git worktree on a branch named `agent/<issue-identifier>`.

## Non-negotiables

- **Never commit or copy secrets.** Credentials live in `.env.local`
  (gitignored); `lib/creds.ts` resolves them. Never write a key into the repo.
- **Never push to `main`. Never merge. Never force-push.** Push only your own
  `agent/<issue-identifier>` branch, then open a pull request against `main`
  with `gh pr create`. A human reviews and merges. You do not need further
  approval to push that branch or to open the PR.
- If a push or PR is refused, stop and report the exact error on the ticket.
  Do not retry with different flags or a different remote.
- Don't kill a dev server on 4100 or 4101; other sessions use them. If your
  edit crashes hot reload, fix it fast: a crash loop corrupts `.next` and
  breaks every session's page chunks (kill the port, `rm -rf .next`, restart).
- `/org` markup is frozen; do not restructure it.
- No em dashes or en dashes in anything you write: code, comments, commit
  messages, tickets.

## How to work

- TDD: failing test first (`tests/`, one file per module,
  `FOUNDER_OS_DB=:memory:`), then implement. `npm test` and
  `npm run typecheck` must be green before claiming done.
- Everything reads through the repo layer: `lib/db.ts` repos + `lib/schemas.ts`
  Zod validation + `lib/seed.ts` seeds. Never query SQLite from a page/route.
- Theme via CSS vars on `data-theme` (five themes in `app/globals.css`);
  Tailwind `os.*` tokens map to them. Keep `tailwind.config.ts` and
  `globals.css` in sync.
- Commands: `npm run dev` (port 4100), `npm test`, `npm run typecheck`,
  `npm run seed`, `npm run brain:docs`.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`),
  subject 72 characters or fewer. Stage explicit paths, never `git add -A`.

## Multi-agent etiquette

Multiple agent sessions (Claude, Codex, Paperclip workers) work this repo
concurrently:
- `git log --oneline` to see where others are; commit small and often.
- Coordinate by surface: don't edit a page/component another session has
  uncommitted changes in (`git status` shows them).
- Leave handoff notes in `docs/` if you stop mid-feature.

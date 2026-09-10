# Pilot backlog 2

Five tickets for the second batch. The first backlog was sized for two weeks
and landed in one afternoon, so this batch exists mainly to give the reviewer
agent open pull requests to review (Task 17). Each is one PR. Same rules as
backlog 1: read `AGENTS.md` and `CLAUDE.md`, failing test first, tests and
typecheck green, push only `agent/<identifier>`, open a PR against `main`.

1. Add a third tab `Paperclip` to `components/AgentsTabs.tsx` beside `Roster`
   and `Hermes Workers`. It embeds the URL from a new `PAPERCLIP_DASH_URL`
   env var with the same lazy iframe pattern as Hermes (mount on first visit,
   stay mounted, honest empty state when unset, "Open full dashboard" link).
   `app/agents/page.tsx` passes `process.env.PAPERCLIP_DASH_URL`. Add the var
   to `.env.example` under the Paperclip section. Test: extend
   `tests/agents-tabs.test.ts` the way it already checks the Hermes tab.
   Do not rename or remove the Hermes tab.
2. Add `GET /api/health` in `app/api/health/route.ts` returning HTTP 200 with
   `{ ok: true, service: 'founderos', time: <ISO string> }`, validated by a
   Zod schema exported from `lib/schemas.ts`. No database access, no auth.
   Test in `tests/api-health.test.ts`: status 200, body parses with the
   schema, `time` is a valid date.
3. Add `paperclipWorkSummary()` to `lib/connectors/paperclip.ts`. It reads
   `PAPERCLIP_URL`, `PAPERCLIP_API_KEY` and a new `PAPERCLIP_COMPANY_ID`, and
   returns `{ state: 'not_configured' }` when any is unset. Otherwise it
   calls the Paperclip issues endpoint for that company with the API key as
   a bearer token, five second timeout, and returns
   `{ state: 'connected', counts: Record<status, number> }` or
   `{ state: 'error', detail }`. Consult the bundled `paperclip` skill for the
   exact endpoint and response shape; validate the response with Zod and
   ignore fields you do not use. Expose it at `GET /api/paperclip` in
   `app/api/paperclip/route.ts`. Add the new var to `.env.example`. Tests
   with a stubbed fetch in `tests/paperclip-work.test.ts`: not configured,
   HTTP 401, malformed body, and a happy path with three statuses.
4. Add a lint gate. Install `eslint` and `eslint-config-next` as dev
   dependencies, add `.eslintrc.json` extending `next/core-web-vitals`, add
   `"lint": "next lint"` to `package.json`, and add a `Lint` step to
   `.github/workflows/ci.yml` after `Types`. Run it. If it reports errors,
   fix them only when the fix is mechanical and under ten lines total;
   otherwise downgrade those specific rules to `warn` in `.eslintrc.json`
   and list them in the PR body. No behaviour change anywhere.
5. Replace personal references to the upstream owner in comments and docs
   with Node AI wording: `CLAUDE.md`, `vitest.config.ts`, `lib/creds.ts`,
   and any other file `grep -rn "Alex" --include=*.ts --include=*.tsx
   --include=*.md .` finds outside `node_modules`. Comments and docs only, no
   code change, no behaviour change. Do not touch `docs/superpowers/`.
   Test: none needed; the existing suite must stay green. PR body lists
   every file touched.

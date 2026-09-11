# Pilot backlog

Ten small, independent tickets on FounderOS. Each is one PR. Written so an
agent with the repo and CLAUDE.md can do it without asking. Cristoforo
replaces or reorders these before entering them; the first three are the
seam to Paperclip and should stay first.

1. Add `lib/connectors/paperclip.ts` exporting `paperclipStatus()` that returns
   `not_configured` when `PAPERCLIP_URL` is unset, `error` when unreachable,
   `connected` on a 200 from `/api/health`. Test with a stubbed fetch in
   `tests/paperclip.test.ts` covering all three states.
2. Register `['paperclip', 'orchestration', paperclipStatus]` in the `CHECKS`
   array in `lib/connectors/index.ts`. Test: `allConnectorStatuses()` includes
   an entry with id `paperclip`.
3. Add `PAPERCLIP_URL` and `PAPERCLIP_API_KEY` to `.env.example` under a new
   `Paperclip` section with a one-line comment each. Test: the example file
   parses with `parseEnvFile` and both keys are present.
4. Add the Paperclip tile to `lib/integrations-catalog.ts` under a new
   `Orchestration` category with `connectorId: 'paperclip'` and
   `envKeys: ['PAPERCLIP_URL','PAPERCLIP_API_KEY']`. Test: catalog test covers
   the new entry and its category.
5. Gate seeding behind `FOUNDER_OS_DEMO_SEED`. `lib/data.ts` seeds only when it
   equals `1`. Default off. Test: with the var unset, a fresh in-memory db has
   zero agents; with it set, the seeded count is unchanged.
6. Add a visible `DEMO DATA` mark to `PageHeader` when `FOUNDER_OS_DEMO_SEED`
   is `1`. Test: renders the mark only when set.
7. Rename the topbar and unlock-screen title from "FOUNDER OS" to
   "NODE AI OS". Test: the rendered string appears in both components.
8. Rename the `/agents` tab label "Hermes Workers" to "Control plane". Env var
   name unchanged. Test: `tests/agents-tabs.test.ts` updated to the new label.
9. Make `describeCron` in `lib/cron.ts` return `every hour` for `0 * * * *`
   instead of `hourly at :00`. Test: one new case, existing cases unchanged.
10. Extend `tests/paperclip.test.ts` with a timeout case: a fetch that never
    resolves within the connector's deadline yields `error`, not a hang.

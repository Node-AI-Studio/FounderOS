---
type: agent
title: <Agent name, a role not a persona>
status: <planned / active / paused>
autonomy: <read / draft / act>
runtime: <paperclip>
---

# <Agent name>

part_of:: [[departments/<slug>]]
reports_to:: [[agents/<slug>]] or [[people/<slug>]]
performs:: [[jobs/<slug>]]

<!-- guide: One paragraph: what this agent is for, in terms of the jobs it
performs. An agent with no job is not an agent yet. -->
<role>

## Tools

<!-- guide: Every connector and the exact scope it gets. The scope is the
enforcement: an agent at draft autonomy holds no credential that can send. -->

| Tool | Scope | Why it needs it |
|---|---|---|
| <tool> | <read-only / write to X / none> | <job it serves> |

## Never

<!-- guide: What this agent must never do, beyond the company rules. Each line
should be checkable. -->

- <action>

## Rules

- [[rules/<slug>]]

## Runtime

<!-- guide: Where it runs and how it is rendered. The runtime copy is generated
from this page and overwritten on every render; edit here, never in the
runtime UI. -->

- **Runtime id:** <Paperclip agent id, once rendered>
- **Budget:** <monthly cap>
- **Model:** <model or profile>

---

*Timeline*

- YYYY-MM-DD: <created, rendered, paused, with source>

<!--
Worked example (fictional):

title: Receipts chaser
autonomy: draft
Tools: accounting system (read-only), Gmail (create drafts only, no send scope)
Never: contact a client's employees, only the named finance contact.
-->

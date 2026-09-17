---
type: department
title: <Department name>
status: <active / planned>
---

# <Department name>

led_by:: [[people/<slug>]]
part_of:: [[companies/<tenant>]]

<!-- guide: One paragraph: what this department is responsible for, stated as
the steps of "How work flows" on the company page that it owns. -->
<responsibility>

**Owns steps:** <step numbers from the company page, e.g. 1 to 6>

## Time inventory

<!-- guide: Filled by the time audit (spec section 5). Every recurring task,
decision and remember-to-do workflow in this department. Bucket A: an agent can
do it (autonomy read, draft or act). B: a person who is not a founder. C:
founder judgment. "Stalls": stops if the lead is away a week. -->

| Task | How often | Hours/week | Bucket | Stalls | Source |
|---|---|---|---|---|---|
| <task> | <daily / weekly / per event> | <hours> | <A (read) / B / C> | <yes / no> | <[[page]]> |

## Agents

- [[agents/<slug>]]: <one line>

## Jobs

| Job | Performed by | Autonomy | Approved by |
|---|---|---|---|
| [[jobs/<slug>]] | [[agents/<slug>]] | <read / draft / act> | [[people/<slug>]] |

## Procedures

- [[sops/<slug>]]

## Rules

- [[rules/<slug>]]

## Metrics

| Number | Read from | Target | Last value |
|---|---|---|---|
| <metric> | <source> | <target> | <value, YYYY-MM-DD> |

## Blocking decisions

<!-- guide: Open decisions that stop a job from being defined. An agent cannot
follow a rule that is still judgment. -->

- <decision>: blocks [[jobs/<slug>]]

---

*Timeline*

- YYYY-MM-DD: <event, with source>

<!--
Worked example (fictional), one inventory row:

| Chase missing client receipts before month end | monthly | 4 | A (draft) | yes | [[sops/month-end-close]] |
-->

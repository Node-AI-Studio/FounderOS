---
type: company
title: <Legal or trading name>
status: self
tags: [tenant]
---

# <Name>

<!-- guide: Three sentences a new hire could repeat. What the company does, for
whom, and how it makes money. No history, no aspiration. -->
<Summary>

## Offer

<!-- guide: Everything the company sells today, one row each. "Price" is what
is actually charged, including below-floor deals, not the list price. Link the
product or SOP page when one exists. -->

| Offer | What the buyer gets | Price today | Page |
|---|---|---|---|
| <offer> | <outcome> | <price and billing> | <[[link]] or "none"> |

## Customers

<!-- guide: Who buys, stated as a testable profile, then who is turned away.
Current customers go in the table with their real state. -->

- **Buys:** <profile: size, sector, trigger>
- **Turned away:** <anti-profiles>

| Customer | State | Monthly value | Page |
|---|---|---|---|
| <name> | <client / prospect / lost / past> | <amount> | [[companies/<slug>]] |

## Revenue

<!-- guide: How money actually comes in and how it is collected. Numbers from
the billing system, with the date they were read. -->

- **Recurring:** <amount per month, as of YYYY-MM-DD>
- **One-off:** <typical project size and frequency>
- **Collected through:** <billing tool>
- **Floor:** <minimum engagement, or "no written floor">

## How work flows

<!-- guide: The spine of the company. Every step from first contact to renewal,
in order. One row per step. "SOP" links the procedure or says "absent". This
table is what departments are later drawn from, so do not group steps by team
yet. -->

| # | Step | What happens | Who does it today | Tool | SOP |
|---|---|---|---|---|---|
| 1 | <step> | <one line> | <person or "nobody"> | <tool> | <[[sops/..]] or "absent"> |

## Who decides what

<!-- guide: Decisions that recur, and who holds each one today. Include the ones
nobody holds. -->

| Decision | Held by | Written down in |
|---|---|---|
| <pricing, scope, hiring, spend, ...> | <person or "undecided"> | <[[page]] or "nowhere"> |

## People

| Person | Role | Page |
|---|---|---|
| <name> | <role> | [[people/<slug>]] |

## Systems of record

<!-- guide: For each kind of fact, the one tool that owns it. Two tools owning
the same fact is a finding to fix, not to record as normal. -->

| Fact | Owned by | Everyone else |
|---|---|---|
| <deal stage, invoices, tasks, knowledge, ...> | <tool> | <references it, never copies> |

## Departments

<!-- guide: Filled in stage 3. Each department page links here with part_of::,
so this section only lists them for reading. Leave it saying "Not named yet."
until the founders name them. -->

Not named yet.

## Rules

<!-- guide: Link every page in rules/ that applies company-wide. -->

- [[rules/<slug>]]

## Health

<!-- guide: The few numbers that say whether the company is working, with where
each is read from. -->

| Number | Read from | Last value |
|---|---|---|
| <metric> | <source> | <value, YYYY-MM-DD> |

## Open questions

- <question that changes how the company runs, with the page it blocks>

---

*Timeline*

- YYYY-MM-DD: <event, with source>

<!--
Worked example (fictional), How work flows, first three rows:

| # | Step | What happens | Who does it today | Tool | SOP |
|---|---|---|---|---|---|
| 1 | Enquiry | Web form or referral email arrives | Owner, when she sees it | Gmail | absent |
| 2 | Fit call | 20-minute call to check size and software | Owner | Calendly, Zoom | [[sops/fit-call]] |
| 3 | Engagement letter | Scope and monthly fee sent for signature | Office manager | DocuSign | absent |
-->

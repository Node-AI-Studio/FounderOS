---
type: job
title: <What gets done, as a verb phrase>
status: <planned / active / paused>
trigger: <schedule, e.g. "weekdays 08:00 Europe/Amsterdam", or event>
autonomy: <read / draft / act>
metric_leading: <measured every run>
metric_lagging: <measured monthly>
golden_set: <evals/<slug>.jsonl or none yet>
---

# <What gets done>

part_of:: [[departments/<slug>]]
approved_by:: [[people/<slug>]]
follows:: [[sops/<slug>]]

<!-- guide: One paragraph: the task inventory row this job comes from, and why
it was chosen (hours saved, stalls when a founder is away). The agent that
performs it links here from its own page with performs::. -->
<origin>

## Inputs

| Input | From | Access |
|---|---|---|
| <data> | <tool or page> | <read-only / ...> |

## Decision rules

<!-- guide: The judgment the agent applies, as rules a person could check
afterwards. If a rule is still "use judgment", the job is not ready: list it
under Blocking decisions on the department page instead. -->

1. <rule>

## Output

<!-- guide: Exact shape of what one run produces. The file always goes to
outputs/<department>/. -->

- **File:** `outputs/<department>/YYYY-MM-DD-<job-slug>.md`
- **Contains:** <sections>
- **Also updates:** <pages a finding changes, or "nothing">

## Approval

<!-- guide: Read jobs: "none, output is informational". Draft jobs: what is
filed as a Paperclip approval, who approves, and what happens after approve.
Act jobs: what is spot-checked and how often. -->
<approval flow>

## Escalation

| Condition | Action |
|---|---|
| <e.g. input unreachable, finding above threshold> | <log / diagnose / propose, and who is told> |
| no output within twice the trigger interval | department lead agent files an issue for a human |

## Done well means

<!-- guide: How a person judging one output decides it was good. These become
the golden set's acceptance criteria. -->

- <criterion>

---

*Timeline*

- YYYY-MM-DD: <defined, first run, rule changed after correction, with source>

<!--
Worked example (fictional):

title: Chase missing receipts before month end
trigger: 25th of each month, 09:00
autonomy: draft
Decision rules: 1. Only clients with more than 3 unmatched transactions.
2. Never chase a client twice in 7 days.
Approval: each email filed as a Paperclip approval to the owner; she sends.
-->

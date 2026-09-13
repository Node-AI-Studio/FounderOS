---
type: sop
title: Budget Auditor
status: living
tags: [sop, agent]
---

# SOP -- Budget Auditor

## Purpose

Check daily and weekly spend pacing against the plan set by [[sops/growth-planner]], and flag marginal-return drop-off before it burns meaningful budget.

## Trigger

Runs daily during active campaigns, and immediately if any lane's spend rate deviates more than 20% from the approved plan (illustrative threshold, seeded for the demo).

## Steps

1. Pull spend and result data per lane from Meta, TikTok and Google.
2. Compare actual pacing against the plan approved in [[sops/growth-planner]].
3. Compute marginal cost-per-result trend for each lane, not just the average.
4. Flag any lane whose marginal return has crossed from acceptable to unprofitable.
5. Route flagged lanes to [[sops/contribution-margin]] for a true-margin check before recommending a pause.
6. Report pacing status into [[sops/approve-the-week]].

## Definition of done

Every active lane has a same-day pacing check, and any lane crossing its marginal-return threshold has been flagged, not silently left running.

## Escalation

A lane burning budget with no clear cause escalates to [[people/head-of-growth]] the same day, not at the next weekly review.

Reports to [[people/head-of-growth]]. See also [[sops/growth-planner]].

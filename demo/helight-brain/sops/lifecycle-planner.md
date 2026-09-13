---
type: sop
title: Lifecycle Planner
status: living
tags: [sop, agent]
---

# SOP -- Lifecycle Planner

## Purpose

Own the map of every Klaviyo flow across the customer lifecycle: welcome, abandonment, post-purchase, win-back, and confirm triggers and timing are current.

## Trigger

Runs at the start of each build cycle for [[projects/seven-klaviyo-flows]] and reviewed monthly thereafter.

## Steps

1. Audit current live flows against the target seven-flow map.
2. Identify any flow missing, disabled, or firing on stale trigger logic.
3. Coordinate with [[sops/offer-designer]] on any flow needing a new offer element.
4. Confirm every flow's copy carries current claims per [[wiki/claims-allowlist]].
5. Sequence build or fix priority and hand to [[people/retention-lead]] for sign-off.
6. Track flow-level performance monthly and flag underperformers for redesign.

## Definition of done

All seven target flows are live, correctly triggered, and reviewed against current claims within the review cycle.

## Escalation

A flow driving refund requests rather than retention escalates to [[people/retention-lead]] and [[sops/contribution-margin]] immediately.

Reports to [[people/retention-lead]]. See also [[sops/offer-designer]].

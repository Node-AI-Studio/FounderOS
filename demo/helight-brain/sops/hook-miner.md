---
type: sop
title: Hook Miner
status: living
tags: [sop, agent]
---

# SOP -- Hook Miner

## Purpose

Surface new hook candidates from live performance data and add validated ones to [[writing/hook-vault]], and retire hooks that have stopped working.

## Trigger

Runs weekly, reviewing the prior week's top and bottom performing opening lines across all published content.

## Steps

1. Pull first-three-second retention and hook-level engagement data from published content.
2. Compare hook performance against the existing entries in [[writing/hook-vault]].
3. Draft new hook templates from any outperforming opening line, generalised into a slotted template.
4. Check each new candidate against [[wiki/claims-allowlist]] before adding it to the vault.
5. Flag underperforming vault entries for retirement rather than letting them accumulate unused.
6. Update [[writing/hook-vault]] and notify [[sops/content-planner]] of new additions.

## Definition of done

The vault reflects current performance data weekly, with new hooks added and stale ones flagged, not a static list from launch.

## Escalation

A hook that only works when it edges past the claims allowlist gets rejected outright, escalated to [[people/content-lead]] if the copywriter disagrees.

Reports to [[people/content-lead]]. See also [[writing/hook-vault]].

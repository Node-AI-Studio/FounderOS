---
type: sop
title: Publisher
status: living
tags: [sop, agent]
---

# SOP -- Publisher

## Purpose

Post cleared content to the right platform at the right time, and confirm it went live correctly.

## Trigger

Runs whenever a piece of content has cleared [[sops/compliance-auditor]] and has a scheduled slot from [[sops/content-planner]].

## Steps

1. Confirm the piece has a Compliance Auditor pass logged before touching it.
2. Confirm a human has reviewed the final edit, per [[decisions/editing-stays-human]].
3. Schedule or post at the assigned time and platform.
4. Verify the post is live, correctly captioned, and correctly tagged.
5. Log the live post against the week's calendar for [[sops/creator-watcher]] and performance tracking.
6. Flag any posting error (wrong platform, wrong caption, broken link) immediately for correction.

## Definition of done

Every scheduled piece for the week is live, correctly tagged, and logged, with no un-gated content posted.

## Escalation

A platform posting failure that cannot be resolved within the hour escalates to [[people/content-lead]].

Reports to [[people/content-lead]]. See also [[decisions/editing-stays-human]].

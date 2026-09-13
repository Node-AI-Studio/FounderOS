---
type: project
title: Content Engine Live
status: active
tags: [project]
---

# Project -- Content Engine Live

## Goal

Get the full Content pillar loop running end to end: [[sops/creator-watcher]] and [[sops/hook-miner]] feeding [[sops/content-planner]], every piece clearing [[sops/compliance-auditor]], and [[sops/publisher]] posting on schedule without manual intervention.

## Status

Mostly live. [[sops/21-nights-producer]] is running on its own rolling schedule; the rest of the weekly loop is operating per [[sops/content-planner]]'s calendar.

## Next step

Close the loop on [[sops/hook-miner]]'s weekly vault updates feeding directly into the next week's calendar without a manual handoff step.

## Owner pillar

Content, owned by [[people/content-lead]].

[[sops/creator-watcher]]'s weekly digest is the piece most likely to need
tighter integration next, since it currently reaches
[[sops/content-planner]] a day later than the ideal Saturday-to-Sunday
handoff.

[[people/head-of-growth]] watches this project closely too, since a
late-running Content calendar directly delays [[sops/growth-planner]]'s
weekly plan the following Sunday.

---
type: decision
title: Editing stays human
status: active
tags: [decision]
---

# Decision -- Editing stays human

**Date:** September 2026

## Context

AI-assisted cutting tools exist and could speed up publishing volume from [[sops/21-nights-producer]] and [[sops/content-planner]]. No available tool reliably matches the judgment needed to cut a physician explainer or a day-21 result video without introducing an error or an off-tone cut.

## Decision

Every piece of video content gets a human edit pass before publish. No agent is authorised to auto-publish an unreviewed cut, regardless of how confident the automated edit looks.

## Consequences

Publishing throughput is bounded by editor capacity rather than compute. That bound is treated as acceptable given the reputational cost of a single bad cut going out under the brand's name.

Governs [[sops/publisher]].

[[people/content-lead]] is accountable for editor capacity planning, since
this decision makes editor availability, not automation, the throughput
constraint for [[projects/content-engine-live]].

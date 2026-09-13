---
type: sop
title: Compliance Auditor
status: living
tags: [sop, agent]
---

# SOP -- Compliance Auditor

## Purpose

Gate every outbound claim, medical or otherwise, against [[wiki/claims-allowlist]] before it publishes anywhere: paid, organic or on-site.

## Trigger

Runs on every piece of copy submitted by [[sops/ad-copywriter]], every script from [[sops/content-planner]], and every on-site claim change from [[sops/evidence-curator]].

## Steps

1. Read the submitted copy or script in full against [[wiki/claims-allowlist]].
2. Flag any phrasing implying a claim beyond what [[wiki/study-chain]] supports.
3. Flag any use of a clinician's name or quote not previously cleared.
4. Check platform-specific health and wellness ad policy for the destination platform.
5. Return a pass or a specific, line-level rejection, never a vague 'needs work.'
6. Log every rejection so patterns (a recurring phrase, a recurring angle) surface to [[people/head-of-growth]].

## Definition of done

Every piece of outbound copy carries an explicit pass before it reaches [[sops/publisher]] or ad platform upload.

## Escalation

A disputed rejection escalates to [[people/head-of-growth]], never gets silently overridden by the copywriter or publisher.

Reports to [[people/head-of-growth]]. See also [[decisions/claims-allowlist]].

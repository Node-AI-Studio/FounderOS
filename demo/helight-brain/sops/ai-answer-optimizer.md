---
type: sop
title: AI Answer Optimizer
status: living
tags: [sop, agent]
---

# SOP -- AI Answer Optimizer

## Purpose

Make product and proof pages legible to AI answer engines and shopping assistants, so Helight gets cited when a shopper asks an AI assistant about red light therapy or sleep devices.

## Trigger

Runs monthly, and immediately after any major proof-page update from [[sops/evidence-curator]].

## Steps

1. Audit current product and proof pages for structured data, clear claim statements, and citable specifics.
2. Compare Helight's presence in AI-generated answers on common sleep-device queries against [[companies/hatch]], [[companies/loftie]], [[companies/therabody]] and [[companies/somnee]].
3. Identify pages missing structured data or written in a way that is hard for an answer engine to extract cleanly.
4. Propose page-level fixes to [[people/store-manager]], prioritising the highest-traffic gaps first.
5. Coordinate with [[sops/evidence-curator]] so proposed changes stay within [[wiki/claims-allowlist]].
6. Track citation rate over time and report to [[projects/cited-by-assistants]].

## Definition of done

A current audit exists showing where Helight is and is not cited by major AI assistants, with prioritised fixes logged against [[projects/cited-by-assistants]].

## Escalation

No claim is ever rewritten purely to sound more citable; any conflict between citability and accuracy escalates to [[people/store-manager]].

Reports to [[people/store-manager]]. See also [[wiki/ai-answer-share-of-voice]].

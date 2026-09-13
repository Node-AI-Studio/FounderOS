---
type: decision
title: Retail is status only
status: active
tags: [decision]
---

# Decision -- Retail is status only

**Date:** September 2026

## Context

[[companies/ulta-beauty]] and [[companies/goop]] are real, valuable retail relationships, but neither has a live data connection into any Helight system. Treating either as a source of real-time inventory or sales data would mean building against numbers that do not exist.

## Decision

No agent or dashboard treats Ulta or Goop as a live data source. Both are tracked as status-only relationships, updated by manual report, owned by [[people/store-manager]].

## Consequences

Retail-driven decisions (restocking, retail-specific creative timing) run on a slower, human-checked cadence than DTC decisions, which is accurate to the actual relationship rather than aspirational.

Governs [[sops/store-auditor]].

[[sops/store-auditor]] is the agent that actually checks retail status weekly,
translating this decision into a routine practice rather than a one-time
policy statement.

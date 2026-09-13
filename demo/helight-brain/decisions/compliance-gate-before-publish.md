---
type: decision
title: Compliance gate runs before publish, not after
status: active
tags: [decision]
---

# Decision -- Compliance gate runs before publish, not after

**Date:** September 2026

## Context

It is faster to publish first and review flagged content after the fact, and it is also how a health-adjacent brand ends up with a platform suspension or a real credibility problem.

## Decision

[[sops/compliance-auditor]] reviews every piece of paid, organic and on-site content before it goes live, not on a post-publish audit cycle. Nothing waits in a published state pending review.

## Consequences

Publishing speed is slower than a review-after model would allow. The trade is accepted because a published, non-compliant claim is far more costly to walk back than a short pre-publish delay.

Governs [[sops/publisher]].

This decision is the operational partner to [[decisions/claims-allowlist]]:
the allowlist decides what may be said, and this decision decides when it gets
checked, which is always before, never after.

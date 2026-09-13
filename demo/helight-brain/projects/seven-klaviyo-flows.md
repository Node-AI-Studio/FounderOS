---
type: project
title: Seven Klaviyo Flows
status: active
tags: [project]
---

# Project -- Seven Klaviyo Flows

## Goal

Get all seven core lifecycle flows (welcome, abandonment, post-purchase, 21-nights coaching, review request, win-back, VIP or repeat-buyer) live and correctly triggered, mapped in [[sops/lifecycle-planner]].

## Status

In progress. [[sops/21-nights-coach]]'s four-touch sequence is live; several other flows remain on older trigger logic pending review.

## Next step

Audit the win-back flow's trigger timing next, since [[sops/voice-of-customer]] has flagged it as under-firing relative to expected lapsed-buyer volume.

## Owner pillar

Retention, owned by [[people/retention-lead]].

[[projects/connect-the-stack]]'s Klaviyo connection work is a direct
dependency here; several flows cannot be fully instrumented until that
integration lands.

[[people/customer-care-lead]] is consulted on flow copy for any sequence that
follows a support interaction, since [[sops/voice-of-customer]] often
surfaces the exact objection a flow needs to address.

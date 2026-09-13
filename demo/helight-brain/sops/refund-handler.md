---
type: sop
title: Refund Handler
status: living
tags: [sop, agent]
---

# SOP -- Refund Handler

## Purpose

Process refund requests against the 60-day money-back guarantee accurately and promptly, and log every refund for margin tracking.

## Trigger

Triggers when [[sops/support-triage]] routes a confirmed refund request.

## Steps

1. Confirm the order falls within the 60-day guarantee window.
2. Confirm the request matches the guarantee's actual terms per [[decisions/guarantee-as-risk-reversal]], not an assumed or looser version.
3. Process the refund through the order system.
4. Log the refund with SKU, reason code and order value for [[sops/contribution-margin]].
5. Send confirmation to the buyer with clear timing for funds to return.
6. Flag any refund reason that recurs (a specific complaint, a specific SKU) to [[sops/voice-of-customer]].

## Definition of done

Every eligible refund is processed within the guarantee's stated terms and logged with a reason code, with no manual guesswork on eligibility.

## Escalation

A request outside the stated 60-day window escalates to [[people/customer-care-lead]] for a judgment call rather than an automatic denial or approval.

Reports to [[people/customer-care-lead]]. See also [[decisions/guarantee-as-risk-reversal]].

---
type: sop
title: Support Triage
status: living
tags: [sop, agent]
---

# SOP -- Support Triage

## Purpose

Route every inbound support ticket to the right next step: an answer, a refund via [[sops/refund-handler]], or an escalation, and prioritise by urgency and buyer risk.

## Trigger

Runs continuously on inbound tickets across every support channel.

## Steps

1. Read the incoming ticket and classify its type: product question, order issue, refund request, or safety concern.
2. Check the buyer's order status and history before responding.
3. Answer directly where the question is covered by existing, cleared information.
4. Route refund requests to [[sops/refund-handler]] with order details attached.
5. Route any safety or adverse-reaction report immediately to [[people/customer-care-lead]], never auto-answered.
6. Tag every ticket by topic for weekly rollup into [[sops/voice-of-customer]].

## Definition of done

Every ticket receives a first response within the team's target window and is correctly routed or answered, with safety reports never left in the general queue.

## Escalation

A safety or adverse-reaction report escalates immediately and directly to [[people/customer-care-lead]], bypassing normal queue order.

Reports to [[people/customer-care-lead]]. See also [[sops/refund-handler]].

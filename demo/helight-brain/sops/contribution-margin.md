---
type: sop
title: Contribution Margin
status: living
tags: [sop, agent]
---

# SOP -- Contribution Margin

## Purpose

Turn revenue, ad spend and refund data into a per-SKU and per-lane contribution margin view, so pillar leads make spend decisions on real profitability, not top-line revenue.

## Trigger

Runs weekly, and on demand whenever [[sops/budget-auditor]] flags a lane for a true-margin check before a scale decision.

## Steps

1. Pull revenue by SKU and lane for the period.
2. Pull ad spend by lane from [[sops/budget-auditor]].
3. Pull refund volume and value by SKU and lane from [[sops/refund-handler]].
4. Compute landed contribution margin per SKU and per lane, net of spend and refunds.
5. Flag any lane profitable on click-through metrics but unprofitable on contribution margin.
6. Report the finished view to [[people/bookkeeper]] ahead of [[sops/approve-spend-on-winners]].

## Definition of done

A current per-SKU and per-lane margin view exists before any spend-scaling decision is made, not estimated from revenue alone.

## Escalation

A lane that looks like a winner on surface metrics but loses money on margin escalates to [[people/head-of-growth]] and [[people/bookkeeper]] before any scale-up is approved.

Reports to [[people/bookkeeper]]. See also [[sops/refund-handler]].

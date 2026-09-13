---
type: sop
title: Store Auditor
status: living
tags: [sop, agent]
---

# SOP -- Store Auditor

## Purpose

Check the storefront across EN, FR, DE and the Canadian store for stock accuracy, broken pages, and the known credibility gaps, weekly.

## Trigger

Runs every Monday morning, ahead of [[sops/approve-the-week]], and immediately if a stockout or page error is reported by any other pillar.

## Steps

1. Check stock status for every SKU across every store locale.
2. Confirm the four known-empty credibility pages (science, doctor-recommended, compare, better-sleep) against [[projects/fill-the-proof-pages]] progress.
3. Check the blog for the nine near-identical legacy titles and confirm no new duplicate has been added.
4. Confirm agents.md still reflects intended crawler policy rather than default Shopify boilerplate.
5. Log any page-level issue with a severity and route fixes to the right pillar.
6. Report overall store health into [[sops/approve-the-week]].

## Definition of done

A current stock and page-health report exists every Monday, with every known issue logged and routed, not silently re-discovered each week.

## Escalation

A stockout on an actively advertised SKU escalates immediately to [[people/head-of-growth]] to pause the relevant ad, not wait for the weekly report.

Reports to [[people/store-manager]]. See also [[wiki/credibility-gaps-on-the-site]].

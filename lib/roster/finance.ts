import { DEPT } from './types';
import type { RosterEntry } from './types';

const LEAD = 'payments-pulse';
const f = (
  id: string, name: string, role: string, tier: RosterEntry['tier'], tools: string[],
  description: string, sopTitle: string, sopSummary: string, steps: string[],
  hero = false, runSummaries: string[] = [`${name} completed a run.`],
): RosterEntry => ({
  id, departmentId: DEPT.finance, name, role, tier, parentId: tier === 'lead' ? null : LEAD,
  description, model: 'claude-sonnet-5 via Claude Code skills', tools, sopTitle, sopSummary, steps, hero, runSummaries,
});

export const FINANCE: RosterEntry[] = [
  f('payments-pulse', 'Payments Pulse', 'Shopify Payments and Amazon payouts', 'lead', ['shopify', 'amazon'],
    'Tracks Shopify Payments and Amazon payouts daily.',
    'Track payouts daily', 'Shopify Payments, Amazon.',
    ['Pull yesterday\'s Shopify Payments and Amazon settlements',
     'Reconcile against orders and refunds',
     'Flag any payout delayed over three days',
     'Post the daily line to Slack',
     'Feed the numbers to Contribution Margin and Month Close']),
  f('ad-spend-ledger', 'Ad Spend Ledger', 'Spend against plan', 'worker', ['meta-ads', 'tiktok-ads', 'google-ads'],
    'Records spend per platform per day against the plan.',
    'Keep the ad spend ledger', 'Per platform, per day, against plan.',
    ['Pull spend per platform for yesterday',
     'Record against the week\'s plan from Growth Planner',
     'Flag variance over ten percent to Budget Auditor',
     'Reconcile monthly against platform invoices',
     'Feed spend to Contribution Margin']),
  f('contribution-margin', 'Contribution Margin', 'Margin per SKU', 'specialist', ['shopify', 'claude-code'],
    'Computes contribution margin per SKU after ads, shipping and refunds. The number that decides whether scaling a winner is right.',
    'Compute contribution margin', 'Per SKU, after ads, shipping, refunds.',
    ['Take revenue per SKU from Payments Pulse',
     'Subtract product cost, shipping, payment fees and refunds',
     'Subtract attributed ad spend from Ad Spend Ledger',
     'Publish margin per SKU and the CPA ceiling it implies',
     'Send the ceiling to Growth Planner and Budget Auditor weekly',
     'Flag any SKU whose margin fell under 30 percent'],
    true, ['Sleep: 44% contribution after ads; CPA ceiling $46', 'Kidzzz: 39%; CPA ceiling $41', 'Refunds pulled Sleep margin down 2 points this month; Refund Handler notified', 'Two-pack: 47%, best margin in the catalog']),
  f('month-close', 'Month Close', 'Books closed monthly', 'worker', ['shopify', 'amazon', 'claude-code'],
    'Closes the books monthly with three lines of commentary.',
    'Close the month', 'Reconciled, three lines of commentary.',
    ['Reconcile payouts, spend and refunds for the month',
     'Compute revenue, contribution and net per SKU',
     'Write three lines: what grew, what shrank, what to watch',
     'File the close in the brain',
     'Send to Yannick on the third working day']),
];

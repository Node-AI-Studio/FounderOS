/**
 * Finances domain: pure, real-ready. Income flows through a processor/account
 * registry (Shopify Payments wired today; Amazon payouts and PayPal are honest
 * pending slots until their keys land). Expenses are seeded SAMPLE data until the
 * statement-ingestion engine (Phase 2) replaces them with parsed bank/CC rows.
 *
 * No faked money: an unwired account reports null income, never a zero that
 * reads as "earned nothing". The page renders pending honestly.
 */

// ── Income: processor / account registry ────────────────────────────────────

export type IncomeAccount = {
  id: string;
  processor: string; // 'Stripe' | 'PayPal' | 'FanBasis' | 'Wise'
  label: string; // display label, incl. the business for multi-account processors
  configured: boolean; // does this account have credentials in the env?
  live: boolean; // actually pulling real income right now (Stripe only, for now)
  income: number | null; // month-to-date income in USD (null = pending)
};

/** Recent outgoing transfer (e.g. Wise): money Alex sent out. */
export type OutgoingTransfer = {
  amountCents: number;
  currency: string;
  status: string;
  created: string | number;
  reference?: string;
};

/**
 * Every processor Helight runs money through. Shopify Payments carries its
 * real month-to-date income when connected; Amazon payouts and PayPal are
 * honest pending slots until their keys land. `configured` flags which
 * accounts have keys in the env (from `configuredProcessors`); `live` means a
 * real pull is actually happening, true only for Shopify Payments today, so
 * a key-set-but-not-yet-integrated account reads "key set", never a faked
 * number.
 */
export function incomeAccounts(
  shopify: { connected: boolean; mtdUsd: number | null },
  configured: Record<string, boolean> = {},
  liveIncomeUsd: Record<string, number> = {},
): IncomeAccount[] {
  // Non-Shopify accounts light up when a real month-to-date income is
  // supplied (e.g. Amazon via its Settlement API); otherwise they're honest
  // pending.
  const account = (id: string, processor: string, label: string): IncomeAccount => {
    const live = liveIncomeUsd[id] != null;
    return {
      id,
      processor,
      label,
      configured: configured[id] ?? false,
      live,
      income: live ? liveIncomeUsd[id] : null,
    };
  };
  return [
    {
      id: 'shopify-payments',
      processor: 'Shopify Payments',
      label: 'Shopify Payments',
      configured: configured['shopify-payments'] ?? shopify.connected,
      live: shopify.connected,
      income: shopify.connected ? shopify.mtdUsd : null,
    },
    account('amazon-payouts', 'Amazon', 'Amazon payouts'),
    account('paypal', 'PayPal', 'PayPal via Shopify'),
  ];
}

/** Total month-to-date income across accounts; pending (null) counts as zero. */
export function totalIncome(accounts: IncomeAccount[]): number {
  return accounts.reduce((sum, a) => sum + (a.income ?? 0), 0);
}

// ── Expenses: seeded sample until statement ingestion lands (Phase 2) ───────

export type ExpenseItem = { id: string; label: string; category: string; monthly: number };

/**
 * Placeholder recurring spend for an AI-operator / agency stack. Clearly a
 * SAMPLE in the UI, gets replaced by real parsed transactions once monthly
 * bank + credit-card statement uploads are wired.
 */
export const SAMPLE_EXPENSES: ExpenseItem[] = [
  // Illustrative monthly costs for a DTC brand of Helight's shape, labelled
  // "sample" on the page until a statement upload or a processor replaces them.
  { id: 'meta-ads', label: 'Meta Ads', category: 'Advertising', monthly: 9000 },
  { id: 'tiktok-ads', label: 'TikTok Ads', category: 'Advertising', monthly: 4000 },
  { id: 'google-ads', label: 'Google Ads', category: 'Advertising', monthly: 2000 },
  { id: 'creators', label: 'Creator fees (12 creators)', category: 'Creators', monthly: 6000 },
  { id: 'editor', label: 'Video editor (contract)', category: 'Creators', monthly: 1500 },
  { id: '3pl', label: '3PL pick, pack and ship', category: 'Fulfilment', monthly: 4500 },
  { id: 'shopify', label: 'Shopify Plus', category: 'Platform', monthly: 2300 },
  { id: 'klaviyo', label: 'Klaviyo', category: 'Platform', monthly: 700 },
  { id: 'shopify-apps', label: 'Shopify apps', category: 'Platform', monthly: 300 },
  { id: 'claude', label: 'Claude Code', category: 'Software', monthly: 200 },
  { id: 'arcads', label: 'Arcads', category: 'Software', monthly: 110 },
  { id: 'zernio', label: 'Zernio', category: 'Software', monthly: 59 },
  { id: 'apify', label: 'Apify', category: 'Software', monthly: 49 },
];

/** Sum of every recurring monthly cost. */
export function totalExpenses(items: ExpenseItem[]): number {
  return items.reduce((sum, e) => sum + e.monthly, 0);
}

/** Per-category totals, largest first. */
export function expensesByCategory(items: ExpenseItem[]): { category: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const e of items) totals.set(e.category, (totals.get(e.category) ?? 0) + e.monthly);
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

/** Net monthly cash flow: income minus expenses (may be negative). */
export function net(income: number, expenses: number): number {
  return income - expenses;
}

// ── Stripe month-to-date helpers (pure; the connector feeds in raw charges) ──

/** Unix seconds for the first instant of `now`'s calendar month (UTC). */
export function monthStartUnix(now: Date): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000);
}

/** Sum only the charges that actually settled (paid + succeeded). */
export function sumChargeIncome(
  charges: { amount: number; currency: string; paid: boolean; status: string }[],
): { amountCents: number; currency: string; count: number } {
  let amountCents = 0;
  let count = 0;
  let currency = 'usd';
  for (const c of charges) {
    if (c.paid && c.status === 'succeeded') {
      amountCents += c.amount;
      count += 1;
      currency = c.currency;
    }
  }
  return { amountCents, currency, count };
}

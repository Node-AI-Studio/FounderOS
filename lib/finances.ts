/**
 * Finances domain — pure, real-ready. Income flows through a processor/account
 * registry (Stripe wired today; PayPal, FanBasis ×2, Wise ×2 are honest pending
 * slots until their keys land). Expenses come from uploaded statements; until the
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

/** Recent outgoing transfer (e.g. Wise), money the operator sent out. */
export type OutgoingTransfer = {
  amountCents: number;
  currency: string;
  status: string;
  created: string | number;
  reference?: string;
};

/**
 * Every processor the operator runs money through. Stripe carries its real
 * month-to-date income when connected; the rest are multi-account-ready slots
 * (PayPal, two Wise). `configured` flags
 * which accounts have keys in the env (from `configuredProcessors`); `live`
 * means a real pull is actually happening — true only for Stripe today, so a
 * key-set-but-not-yet-integrated account reads "key set", never a faked number.
 */
export function incomeAccounts(
  stripe: { connected: boolean; mtdUsd: number | null },
  configured: Record<string, boolean> = {},
  liveIncomeUsd: Record<string, number> = {},
): IncomeAccount[] {
  // Non-Stripe accounts light up when a real month-to-date income is supplied
  // (e.g. FanBasis via its customers API); otherwise they're honest pending.
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
      id: 'stripe',
      processor: 'Stripe',
      label: 'Stripe',
      configured: configured.stripe ?? stripe.connected,
      live: stripe.connected,
      income: stripe.connected ? stripe.mtdUsd : null,
    },
    account('paypal', 'PayPal', 'PayPal'),
    account('wise-1', 'Wise', 'Wise · Account 1'),
    account('wise-2', 'Wise', 'Wise · Account 2'),
  ];
}

/** Total month-to-date income across accounts; pending (null) counts as zero. */
export function totalIncome(accounts: IncomeAccount[]): number {
  return accounts.reduce((sum, a) => sum + (a.income ?? 0), 0);
}

// Expenses come from the uploaded statement ledger (lib/ledger.ts); there is
// no placeholder set. An empty ledger renders as an empty state.

export type ExpenseItem = { id: string; label: string; category: string; monthly: number };

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

/** Net monthly cash flow — income minus expenses (may be negative). */
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

/**
 * Honest empty state. Shown when a table has no rows for a page, instead of a
 * blank grid. Says what is missing and, when known, what will fill it.
 */
export function EmptyState({ title, detail, next }: { title: string; detail: string; next?: string }) {
  return (
    <div data-empty-state className="rounded-lg-t border border-dashed border-os-border bg-os-surface px-[17px] py-[15px]">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-os-dim">{title}</div>
      <p className="mt-2 text-[11.5px] text-os-muted">{detail}</p>
      {next ? <p className="mt-1 font-mono text-[10px] text-os-dim">{next}</p> : null}
    </div>
  );
}

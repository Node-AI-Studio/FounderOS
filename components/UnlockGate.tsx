import { ACCESS_TOKEN_ENV } from '@/lib/auth';

/**
 * The locked screen, rendered in place of the app shell.
 *
 * This is the form from /unlock, lifted into a component so the root layout can
 * render it directly. Rendering rather than redirecting is what lets the gate
 * live in a layout at all: a layout does not know its own pathname, so a
 * redirect-based gate would bounce /unlock to itself forever.
 */
export function UnlockGate({ failed = false }: { failed?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form method="POST" action="/api/unlock" className="w-full max-w-sm">
        <input type="hidden" name="next" value="/" />

        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-3)]">// locked</p>
        <h1 className="mt-1 font-mono text-2xl tracking-[0.08em] text-[var(--text-1)]">FOUNDER OS</h1>
        <p className="mt-3 font-mono text-xs leading-relaxed text-[var(--text-3)]">
          This instance holds live credentials. Enter its access token to continue.
        </p>

        <label htmlFor="token" className="sr-only">
          Access token
        </label>
        <input
          id="token"
          name="token"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="access token"
          className="mt-4 w-full border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 font-mono text-sm text-[var(--text-1)] outline-none focus:border-[var(--text-3)]"
        />

        {failed && (
          <p role="alert" className="mt-2 font-mono text-xs text-[var(--danger,#f87171)]">
            incorrect token
          </p>
        )}

        <button
          type="submit"
          className="mt-3 w-full border border-[var(--line)] px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-2)]"
        >
          unlock
        </button>

        <p className="mt-6 font-mono text-[11px] leading-relaxed text-[var(--text-3)]">
          The operator sets this as <code>{ACCESS_TOKEN_ENV}</code> in the server environment.
        </p>
      </form>
    </main>
  );
}

/** Shown when the deployment is incomplete — the app is fine, its env is not. */
export function MisconfiguredGate({ detail }: { detail: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-3)]">// misconfigured</p>
        <h1 className="mt-1 font-mono text-2xl tracking-[0.08em] text-[var(--text-1)]">FOUNDER OS</h1>
        <p className="mt-3 font-mono text-xs leading-relaxed text-[var(--text-3)]">{detail}</p>
      </div>
    </main>
  );
}

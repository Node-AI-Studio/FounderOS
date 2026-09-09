import { IDENTITY } from '@/lib/identity';

/** Personal monogram in the existing compact brand-mark slot. */
export function OsMark({ size = 34, color = 'currentColor', className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" role="img" aria-label={IDENTITY.fullName} className={className} style={{ color }}>
      <rect x="1" y="1" width="32" height="32" fill="none" stroke="currentColor" />
      <text x="17" y="18" textAnchor="middle" dominantBaseline="middle" fill="currentColor" className="font-mono" fontSize="12" fontWeight="600">
        {IDENTITY.initials}
      </text>
    </svg>
  );
}

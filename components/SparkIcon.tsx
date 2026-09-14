/**
 * The agent emblem: the OS mark stored as a white silhouette with alpha in
 * public/os-emblem.png (gitignored, present on every machine that runs the
 * board). It used to point at vantage-emblem.png, which no checkout ships,
 * so every emblem rendered as an empty box.
 *
 * The PNG is used as a CSS mask over a solid color, so `shade` tints the exact
 * silhouette to any color: black for the Conductor, each department's
 * life-area color for its agents, and so on.
 */
export const EMBLEM_MINT = '#00ffab';

export function SparkIcon({
  size = 28,
  shade = 'var(--accent)',
  className = '',
}: {
  shade?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Founder OS"
      className={`emblem inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: shade,
        // color drives the hover drop-shadow glow (.emblem in globals.css)
        color: shade,
        WebkitMaskImage: 'url(/os-emblem.png)',
        maskImage: 'url(/os-emblem.png)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}

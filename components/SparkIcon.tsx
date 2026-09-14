/**
 * The agent emblem: Helight's "H" mark, cropped from the navbar logo on
 * helight.com and stored as a white silhouette with alpha
 * (public/helight-emblem.png, committed with the demo branch).
 *
 * The PNG is used as a CSS mask over a solid color, so `shade` tints the exact
 * brand silhouette to any color: black for the Conductor, each department's
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
      aria-label="Helight"
      className={`emblem inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: shade,
        // color drives the hover drop-shadow glow (.emblem in globals.css)
        color: shade,
        WebkitMaskImage: 'url(/helight-emblem.png)',
        maskImage: 'url(/helight-emblem.png)',
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

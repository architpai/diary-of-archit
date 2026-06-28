/**
 * DOM renderer for the night-sky star glyphs — the same geometry the 3D
 * sprites draw on canvas, so the legend chips match the stars exactly.
 */
import { glyphFor } from '../hero3d/skillGraph';

export function StarGlyph({
  category,
  color,
  className = 'w-5 h-5',
}: {
  category: string;
  color: string;
  className?: string;
}) {
  const spec = glyphFor(category);
  // unit space [-1,1] → viewBox 0..24 with padding
  const sx = (v: number) => 12 + v * 9;

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {spec.circles?.map((c, i) => (
        <circle
          key={`c${i}`}
          cx={sx(c.x)}
          cy={sx(c.y)}
          r={c.r * 9}
          fill={c.filled ? color : 'none'}
          stroke={c.filled ? 'none' : color}
          strokeWidth={1.8}
          strokeDasharray={c.dashed ? '3 2.5' : undefined}
        />
      ))}
      {spec.strokes.map((line, i) => (
        <polyline
          key={`s${i}`}
          points={line.map(([x, y]) => `${sx(x)},${sx(y)}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/**
 * Hand-drawn ink icons — the emoji replacements.
 * Same pen-on-paper language as LegendSymbols: wobbly strokes, round caps,
 * no flat fills (except deliberate ink blobs). All take currentColor unless
 * a color prop is passed, so they inherit the surrounding ink.
 */

interface InkIconProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
}

function strokeProps(color = "currentColor", strokeWidth = 2.2) {
  return {
    stroke: color,
    strokeWidth,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

/** Pushpin drawn in ink — replaces 📌. Head filled, needle stroked. */
export function InkThumbtack({ className = "w-6 h-6", color = "#B05F66" }: InkIconProps) {
  return (
    <svg viewBox="0 0 28 32" className={className} aria-hidden="true">
      <circle cx="14" cy="10" r="8" fill={color} stroke="#2D2D2D" strokeWidth="1.8" />
      <circle cx="11" cy="7.5" r="2.6" fill="#FFF9E5" opacity="0.55" />
      <line x1="14" y1="18.5" x2="14" y2="30" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Dotted journey route ending in a flag — replaces 📅 on the journey title. */
export function InkRoute({ className = "w-9 h-9", color }: InkIconProps) {
  const s = strokeProps(color);
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <path d="M5 29 C9 25 7 20 12 18 C18 15.5 16 9 22 8" {...s} strokeDasharray="0.5 4.5" />
      <line x1="26" y1="6" x2="26" y2="18" {...s} />
      <path d="M26 6.5 L33 9 L26 11.5" {...s} />
      <circle cx="5" cy="29.5" r="1.6" fill={color ?? "currentColor"} stroke="none" />
    </svg>
  );
}

/** Old map key — replaces 💪⚡ on the legend title (a legend is a key). */
export function InkKey({ className = "w-9 h-9", color }: InkIconProps) {
  const s = strokeProps(color);
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <circle cx="10" cy="13" r="5.5" {...s} />
      <circle cx="10" cy="13" r="2" {...s} strokeWidth={1.6} />
      <path d="M14.5 16.5 L28 30" {...s} />
      <path d="M23.5 25.5 L27.5 21.5 M26.5 28.5 L30.5 24.5" {...s} />
    </svg>
  );
}

/** Spyglass — replaces 👀 on the sneak-peek title. */
export function InkSpyglass({ className = "w-9 h-9", color }: InkIconProps) {
  const s = strokeProps(color);
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <circle cx="14" cy="14" r="8.5" {...s} />
      <circle cx="14" cy="14" r="5" {...s} strokeWidth={1.5} opacity={0.55} />
      <path d="M20.5 20.5 L29 29" {...s} strokeWidth={3} />
      <path d="M10.5 11 C11.5 9.8 13 9.2 14.5 9.4" {...s} strokeWidth={1.4} opacity={0.6} />
    </svg>
  );
}

/** Posthorn-ish envelope with motion squiggles — replaces 📬 on contact. */
export function InkEnvelope({ className = "w-9 h-9", color }: InkIconProps) {
  const s = strokeProps(color);
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <path d="M7 11 L29.5 10.5 L30 26 L7.5 26.5 Z" {...s} />
      <path d="M7.5 11.5 L18.5 19 L29.5 11" {...s} />
      <path d="M2.5 16 L5 16 M1.5 20 L4.5 20 M3 24 L5.2 24" {...s} strokeWidth={1.6} opacity={0.6} />
    </svg>
  );
}

/** Tiny sea serpent silhouette — replaces 🐉 on the warning stamp. */
export function InkSerpent({ className = "w-8 h-8", color }: InkIconProps) {
  const s = strokeProps(color, 2.4);
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden="true">
      {/* head + neck rising */}
      <path d="M7 9 C5.5 5.5 8.5 3 11 4.5 C10 5.5 9.5 6.5 9.8 8 C9.9 10 9 12 8 14" {...s} />
      {/* humps */}
      <path d="M12 17 C13.5 12 18 12 19.5 17" {...s} />
      <path d="M23 17 C24.2 13.5 27.5 13.5 28.7 17" {...s} />
      {/* tail flick */}
      <path d="M32 17 C33.5 15 34 13 36.5 12.5" {...s} />
      {/* water line */}
      <path d="M4 19.5 C7 18.2 10 20.8 13 19.5 M19 19.5 C22 18.2 25 20.8 28 19.5" {...s} strokeWidth={1.4} opacity={0.5} />
    </svg>
  );
}

/** Paper plane — for the boarding-pass stubs. */
export function InkPlane({ className = "w-5 h-5", color }: InkIconProps) {
  const s = strokeProps(color, 2);
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 17 L28 7 L18 27 L14.5 18.5 Z" {...s} />
      <path d="M14.5 18.5 L28 7" {...s} strokeWidth={1.4} opacity={0.6} />
    </svg>
  );
}

/** Dumbbell — gym hobby card. */
export function InkDumbbell({ className = "w-8 h-8", color }: InkIconProps) {
  const s = strokeProps(color);
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <line x1="11" y1="18" x2="25" y2="18" {...s} strokeWidth={2.6} />
      <rect x="6" y="11" width="4.5" height="14" rx="2" {...s} />
      <rect x="25.5" y="11" width="4.5" height="14" rx="2" {...s} />
      <line x1="2.5" y1="14.5" x2="2.5" y2="21.5" {...s} />
      <line x1="33.5" y1="14.5" x2="33.5" y2="21.5" {...s} />
    </svg>
  );
}

/** Circuit chip — local-LLM hobby card. */
export function InkChip({ className = "w-8 h-8", color }: InkIconProps) {
  const s = strokeProps(color);
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="10" y="10" width="16" height="16" rx="2.5" {...s} />
      <rect x="15" y="15" width="6" height="6" {...s} strokeWidth={1.6} />
      {[13, 18, 23].map((p) => (
        <g key={p}>
          <line x1={p} y1="5.5" x2={p} y2="9.5" {...s} strokeWidth={1.8} />
          <line x1={p} y1="26.5" x2={p} y2="30.5" {...s} strokeWidth={1.8} />
          <line x1="5.5" y1={p} x2="9.5" y2={p} {...s} strokeWidth={1.8} />
          <line x1="26.5" y1={p} x2="30.5" y2={p} {...s} strokeWidth={1.8} />
        </g>
      ))}
    </svg>
  );
}

/** Claw — autonomous-agent hobby card (OpenClaw & friends). */
export function InkClaw({ className = "w-8 h-8", color }: InkIconProps) {
  const s = strokeProps(color);
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <path d="M12 30 C11 24 12 19 15 15.5" {...s} />
      <path d="M24 30 C25 24 24 19 21 15.5" {...s} />
      <path d="M15 15.5 C12 13 10.5 8.5 13.5 5.5 C13 9 14.5 11.5 17 12.5" {...s} />
      <path d="M21 15.5 C24 13 25.5 8.5 22.5 5.5 C23 9 21.5 11.5 19 12.5" {...s} />
      <path d="M17 12.5 C18 12 18.5 12 19 12.5" {...s} />
    </svg>
  );
}

/** Compass rose with fleur-de-lis north — hero ornament. */
export function InkCompassRose({ className = "w-16 h-16", color }: InkIconProps) {
  const c = color ?? "currentColor";
  const s = strokeProps(c, 1.6);
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="34" r="17" {...s} />
      <circle cx="32" cy="34" r="13.5" {...s} strokeWidth={1} opacity={0.6} />
      {/* eight spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const rad = (a * Math.PI) / 180;
        const r1 = a % 90 === 0 ? 4 : 8;
        const r2 = a % 90 === 0 ? 17 : 12.5;
        const rd = (v: number) => Math.round(v * 100) / 100;
        return (
          <line
            key={a}
            x1={rd(32 + r1 * Math.sin(rad))}
            y1={rd(34 - r1 * Math.cos(rad))}
            x2={rd(32 + r2 * Math.sin(rad))}
            y2={rd(34 - r2 * Math.cos(rad))}
            {...s}
            strokeWidth={a % 90 === 0 ? 1.8 : 1}
            opacity={a % 90 === 0 ? 1 : 0.55}
          />
        );
      })}
      {/* needle diamond */}
      <path d="M32 22 L34.5 34 L32 46 L29.5 34 Z" {...s} />
      {/* fleur-de-lis north */}
      <path d="M32 16 C30 13.5 30.5 11 32 9 C33.5 11 34 13.5 32 16 Z" {...s} strokeWidth={1.4} />
      <path d="M29 14.5 C27.5 13 27.5 11.5 28.5 10.5 M35 14.5 C36.5 13 36.5 11.5 35.5 10.5" {...s} strokeWidth={1.2} />
      <text
        x="32"
        y="7"
        textAnchor="middle"
        fontSize="7"
        fill={c}
        fontFamily="var(--font-handwritten)"
      >
        N
      </text>
    </svg>
  );
}

/** Hand-drawn scale bar with alternating filled segments — hero ornament. */
export function InkScaleBar({ className = "w-40", color }: InkIconProps) {
  const c = color ?? "currentColor";
  const s = strokeProps(c, 1.6);
  return (
    <svg viewBox="0 0 160 18" className={className} aria-hidden="true">
      {/* slightly wobbly baseline box */}
      <path d="M4 6.5 L156 5.8 L156.3 12.2 L4.2 12.8 Z" {...s} />
      {/* alternating fills */}
      {[0, 2].map((i) => (
        <path
          key={i}
          d={`M${4 + i * 38} ${6.4 - i * 0.18} L${4 + (i + 1) * 38} ${6.3 - i * 0.16} L${4.2 + (i + 1) * 38} ${12.4 - i * 0.15} L${4.2 + i * 38} ${12.6 - i * 0.16} Z`}
          fill={c}
          opacity={0.75}
          stroke="none"
        />
      ))}
      {/* tick labels */}
      {["0", "100", "200", "300", "400 km"].map((label, i) => (
        <text
          key={label}
          x={4 + i * 38}
          y={17.5}
          textAnchor={i === 4 ? "end" : "middle"}
          fontSize="5.5"
          fill={c}
          opacity={0.8}
          fontFamily="var(--font-handwritten)"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

/** Five-point star outline — legend decoder row. */
export function InkStar({ className = "w-5 h-5", color }: InkIconProps) {
  const s = strokeProps(color, 1.8);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3 L14.6 9 L21 9.8 L16.4 14.2 L17.6 20.6 L12 17.4 L6.4 20.6 L7.6 14.2 L3 9.8 L9.4 9 Z" {...s} />
    </svg>
  );
}

/** Map pin outline — legend decoder row. */
export function InkMapPin({ className = "w-5 h-5", color }: InkIconProps) {
  const s = strokeProps(color, 1.8);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="8.5" r="4.5" {...s} />
      <line x1="12" y1="13.5" x2="12" y2="21" {...s} />
    </svg>
  );
}

/** Dashed route segment — legend decoder row. */
export function InkDashedRoute({ className = "w-5 h-5", color }: InkIconProps) {
  const s = strokeProps(color, 2);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3 18 C8 15 9 9 14 8 C17 7.4 19 6.5 21 5" {...s} strokeDasharray="0.5 4" />
    </svg>
  );
}

/** Necktie — serious-mode toggle (mobile). */
export function InkTie({ className = "w-5 h-5", color }: InkIconProps) {
  const s = strokeProps(color, 1.8);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M9.5 3 L14.5 3 L13 7 L11 7 Z" {...s} />
      <path d="M11 7 L8.5 16.5 L12 21 L15.5 16.5 L13 7" {...s} />
    </svg>
  );
}

/** Pen nib — fun-mode toggle (mobile). */
export function InkNib({ className = "w-5 h-5", color }: InkIconProps) {
  const s = strokeProps(color, 1.8);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3 C16 7 17.5 11 16 16 L12 20 L8 16 C6.5 11 8 7 12 3 Z" {...s} />
      <circle cx="12" cy="13" r="1.6" {...s} strokeWidth={1.4} />
      <line x1="12" y1="14.6" x2="12" y2="19" {...s} strokeWidth={1.4} />
    </svg>
  );
}

/** Small scribbled heart — footer. */
export function InkHeart({ className = "w-4 h-4", color = "#B05F66" }: InkIconProps) {
  const s = strokeProps(color, 2);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 20 C5 14.5 3.5 9.5 6.5 6.8 C8.7 4.8 11.2 6 12 8 C12.8 6 15.3 4.8 17.5 6.8 C20.5 9.5 19 14.5 12 20 Z" {...s} />
    </svg>
  );
}

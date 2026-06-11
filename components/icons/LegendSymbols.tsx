/**
 * Hand-drawn cartographic legend symbols, one per skill category.
 * Sketchy strokes, no fills — they should read like pen on the map legend.
 */
export function LegendSymbol({
  category,
  color,
  className = "w-9 h-9",
}: {
  category: string;
  color: string;
  className?: string;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 2.2,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const symbol = (() => {
    switch (category) {
      case "mapping": // contour rings
        return (
          <>
            <ellipse cx="18" cy="19" rx="13" ry="9" {...stroke} transform="rotate(-6 18 19)" />
            <ellipse cx="17" cy="18" rx="8.5" ry="5.5" {...stroke} transform="rotate(4 17 18)" />
            <ellipse cx="16.5" cy="17.5" rx="4" ry="2.6" {...stroke} transform="rotate(-3 16.5 17.5)" />
          </>
        );
      case "database": // cylinder
        return (
          <>
            <ellipse cx="18" cy="10" rx="10" ry="4" {...stroke} />
            <path d="M8 10 L8.4 26 C8.4 28 12 30 18 30 C24 30 27.6 28 27.6 26 L28 10" {...stroke} />
            <path d="M8.2 18 C8.2 20 12 21.8 18 21.8 C24 21.8 27.8 20 27.8 18" {...stroke} />
          </>
        );
      case "cloud": // weather-map cloud
        return (
          <path
            d="M10 24 C6 24 5 20 7.5 18 C6.5 13 12 10.5 15 13 C16.5 8.5 24 8.7 25 14 C29.5 13.5 31.5 19 28.5 21.5 C30 24 27 25.5 25 24.8 Z"
            {...stroke}
          />
        );
      case "frontend": // signpost (what the traveller reads)
        return (
          <>
            <line x1="18" y1="12" x2="18" y2="30" {...stroke} />
            <path d="M8 8 L25 7.5 L29 11 L25 14.5 L8 14 Z" {...stroke} />
            <line x1="14" y1="29.5" x2="22.5" y2="30" {...stroke} />
          </>
        );
      case "backend": // gear
        return (
          <>
            <circle cx="18" cy="19" r="6.5" {...stroke} />
            <circle cx="18" cy="19" r="2.2" {...stroke} />
            {[0, 60, 120, 180, 240, 300].map((a) => {
              // Round so SSR and client render byte-identical attributes.
              const r = (v: number) => Math.round(v * 100) / 100;
              const cos = Math.cos((a * Math.PI) / 180);
              const sin = Math.sin((a * Math.PI) / 180);
              return (
                <line
                  key={a}
                  x1={r(18 + 6.5 * cos)}
                  y1={r(19 + 6.5 * sin)}
                  x2={r(18 + 10 * cos)}
                  y2={r(19 + 10 * sin)}
                  {...stroke}
                />
              );
            })}
          </>
        );
      case "devops": // crossed tools (roadworks on the map)
        return (
          <>
            <line x1="9" y1="9" x2="27" y2="28" {...stroke} />
            <line x1="27" y1="9" x2="9" y2="28" {...stroke} />
            <path d="M6.5 6 C9 5 11 7 10.5 9.5" {...stroke} />
            <path d="M29.5 6 C27 5 25 7 25.5 9.5" {...stroke} />
          </>
        );
      case "graphics": // cube
        return (
          <>
            <path d="M11 13 L18 9 L25.5 13 L25.5 23.5 L18 28 L11 23.5 Z" {...stroke} />
            <path d="M11 13 L18 17 L25.5 13 M18 17 L18 28" {...stroke} />
          </>
        );
      case "architecture": // surveyed city blocks
        return (
          <>
            <path d="M8 12 L28 11 L28.5 27 L8.5 28 Z" {...stroke} />
            <line x1="15" y1="11.5" x2="15.3" y2="27.6" {...stroke} />
            <line x1="21.5" y1="11.3" x2="21.8" y2="27.4" {...stroke} />
            <line x1="8.2" y1="19" x2="28.2" y2="18.6" {...stroke} />
          </>
        );
      case "domain": // compass needle
        return (
          <>
            <circle cx="18" cy="19" r="11" {...stroke} />
            <path d="M18 10.5 L21 19 L18 27.5 L15 19 Z" {...stroke} />
            <line x1="18" y1="6.5" x2="18" y2="9" {...stroke} />
          </>
        );
      default: // generic waypoint
        return (
          <>
            <circle cx="18" cy="16" r="6" {...stroke} />
            <path d="M18 22 L18 29" {...stroke} />
          </>
        );
    }
  })();

  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      {symbol}
    </svg>
  );
}

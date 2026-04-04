import type { SVGProps } from 'react';

type StickerProps = SVGProps<SVGSVGElement> & { size?: number };

function StickerWrap({ children, size = 48, className = '', ...props }: StickerProps & { children: React.ReactNode }) {
  const id = `sticker-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} {...props}>
      <defs>
        <clipPath id={id}>
          <path d="M12 5 Q25 2 50 4 Q75 1 88 5 Q95 15 97 30 Q99 50 97 70 Q95 85 88 95 Q75 98 50 97 Q25 99 12 95 Q4 85 3 70 Q1 50 3 30 Q5 15 12 5Z" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="white" clipPath={`url(#${id})`} opacity="0.9" />
      <g clipPath={`url(#${id})`}>{children}</g>
    </svg>
  );
}

export function AppleSticker({ size = 48, ...props }: StickerProps) {
  return (
    <StickerWrap size={size} {...props}>
      {/* Apple logo silhouette in dark gray */}
      <path
        d="M50 18 C44 18 40 22 36 22 C32 22 27 18 22 19 C15 20 10 26 9 34 C7 48 14 64 22 74 C27 80 31 85 37 85 C42 85 44 82 50 82 C56 82 58 85 63 85 C69 85 73 80 78 74 C82 68 85 61 86 54 C80 51 76 45 76 38 C76 31 80 25 86 23 C83 19 77 16 71 17 C65 18 58 22 50 18Z"
        fill="#333333"
      />
      <ellipse cx="64" cy="12" rx="6" ry="8" fill="#333333" />
    </StickerWrap>
  );
}

export function OpenAISticker({ size = 48, ...props }: StickerProps) {
  return (
    <StickerWrap size={size} {...props}>
      {/* Simplified hexagonal knot outline */}
      <g transform="translate(50,50)">
        <path
          d="M0 -30 L26 -15 L26 15 L0 30 L-26 15 L-26 -15 Z"
          fill="none"
          stroke="#10a37f"
          strokeWidth="4"
        />
        <path
          d="M0 -20 L17 -10 L17 10 L0 20 L-17 10 L-17 -10 Z"
          fill="none"
          stroke="#10a37f"
          strokeWidth="3"
        />
        <circle cx="0" cy="-30" r="4" fill="#10a37f" />
        <circle cx="26" cy="-15" r="4" fill="#10a37f" />
        <circle cx="26" cy="15" r="4" fill="#10a37f" />
        <circle cx="0" cy="30" r="4" fill="#10a37f" />
        <circle cx="-26" cy="15" r="4" fill="#10a37f" />
        <circle cx="-26" cy="-15" r="4" fill="#10a37f" />
      </g>
    </StickerWrap>
  );
}

export function ClaudeSticker({ size = 48, ...props }: StickerProps) {
  return (
    <StickerWrap size={size} {...props}>
      {/* Orange circle with simple face */}
      <circle cx="50" cy="50" r="35" fill="#D97706" />
      {/* Eyes */}
      <circle cx="40" cy="44" r="4" fill="white" />
      <circle cx="60" cy="44" r="4" fill="white" />
      {/* Smile */}
      <path
        d="M37 60 Q50 72 63 60"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </StickerWrap>
  );
}

export function JSSticker({ size = 48, ...props }: StickerProps) {
  return (
    <StickerWrap size={size} {...props}>
      {/* Yellow square background */}
      <rect x="15" y="15" width="70" height="70" fill="#F7DF1E" rx="4" />
      {/* JS text */}
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="30"
        fill="#323330"
      >
        JS
      </text>
    </StickerWrap>
  );
}

export function ReactSticker({ size = 48, ...props }: StickerProps) {
  return (
    <StickerWrap size={size} {...props}>
      {/* Atom orbital symbol */}
      <g transform="translate(50,50)">
        {/* Nucleus */}
        <circle cx="0" cy="0" r="5" fill="#61DAFB" />
        {/* Orbital 1 - horizontal */}
        <ellipse cx="0" cy="0" rx="30" ry="10" fill="none" stroke="#61DAFB" strokeWidth="3" />
        {/* Orbital 2 - rotated 60deg */}
        <ellipse cx="0" cy="0" rx="30" ry="10" fill="none" stroke="#61DAFB" strokeWidth="3" transform="rotate(60)" />
        {/* Orbital 3 - rotated 120deg */}
        <ellipse cx="0" cy="0" rx="30" ry="10" fill="none" stroke="#61DAFB" strokeWidth="3" transform="rotate(120)" />
      </g>
    </StickerWrap>
  );
}

export function PostgresSticker({ size = 48, ...props }: StickerProps) {
  return (
    <StickerWrap size={size} {...props}>
      {/* Blue rounded shape */}
      <rect x="15" y="15" width="70" height="70" fill="#336791" rx="12" />
      {/* PG text */}
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="28"
        fill="white"
      >
        PG
      </text>
    </StickerWrap>
  );
}

export function AzureSticker({ size = 48, ...props }: StickerProps) {
  return (
    <StickerWrap size={size} {...props}>
      {/* Azure angular shape - simplified A logo */}
      <polygon
        points="50,12 82,82 18,82"
        fill="none"
        stroke="#0078D4"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <polygon
        points="50,28 70,72 30,72"
        fill="#0078D4"
      />
      <polygon
        points="50,12 35,55 50,48 65,55"
        fill="#50E6FF"
        opacity="0.85"
      />
    </StickerWrap>
  );
}

export const allTechStickers = [
  AppleSticker,
  OpenAISticker,
  ClaudeSticker,
  JSSticker,
  ReactSticker,
  PostgresSticker,
  AzureSticker,
];

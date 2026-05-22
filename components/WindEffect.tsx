'use client';

import { useReducedMotion } from 'framer-motion';

interface WindLine {
  id: number;
  x: number;        // percent from left (for ltr) or right (for rtl)
  y: number;        // percent from top
  width: number;    // px
  delay: number;    // seconds
  duration: number; // seconds
  angle: number;    // rotation in deg
  direction: 'ltr' | 'rtl';
  pathVariant: number; // 0-2
  opacity: number;
}

const LINE_CONFIGS: Omit<WindLine, 'id'>[] = [
  { x: 5,  y: 18, width: 70, delay: 0,    duration: 2.4, angle: -5,  direction: 'ltr', pathVariant: 0, opacity: 0.28 },
  { x: 8,  y: 12, width: 50, delay: 1.1,  duration: 2.0, angle: 8,   direction: 'rtl', pathVariant: 1, opacity: 0.22 },
  { x: 30, y: 35, width: 80, delay: 0.5,  duration: 2.8, angle: -3,  direction: 'ltr', pathVariant: 2, opacity: 0.30 },
  { x: 15, y: 50, width: 55, delay: 1.8,  duration: 2.2, angle: 6,   direction: 'rtl', pathVariant: 0, opacity: 0.25 },
  { x: 15, y: 60, width: 65, delay: 0.9,  duration: 2.6, angle: -8,  direction: 'ltr', pathVariant: 1, opacity: 0.20 },
  { x: 5,  y: 38, width: 45, delay: 2.3,  duration: 1.9, angle: 4,   direction: 'rtl', pathVariant: 2, opacity: 0.26 },
  { x: 45, y: 72, width: 75, delay: 0.2,  duration: 3.0, angle: -6,  direction: 'ltr', pathVariant: 0, opacity: 0.24 },
  { x: 8,  y: 82, width: 60, delay: 1.6,  duration: 2.3, angle: 10,  direction: 'ltr', pathVariant: 1, opacity: 0.19 },
  { x: 10, y: 78, width: 50, delay: 0.7,  duration: 2.5, angle: -4,  direction: 'rtl', pathVariant: 2, opacity: 0.27 },
  { x: 35, y: 92, width: 68, delay: 2.0,  duration: 2.1, angle: 3,   direction: 'ltr', pathVariant: 0, opacity: 0.21 },
];

// Three distinct wave path shapes (viewBox width ~65)
const PATHS: [string, string][] = [
  ['M0 6 Q15 2 30 6 Q45 10 60 6',        'M5 9 Q20 5 35 9 Q50 13 60 9'],
  ['M0 8 Q20 2 40 8 Q50 12 60 8',        'M3 11 Q22 5 42 11 Q52 15 62 11'],
  ['M0 5 Q10 10 25 5 Q40 0 55 5 Q65 7 65 5', 'M2 8 Q12 13 28 8 Q42 3 58 8'],
];

export default function WindEffect() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {LINE_CONFIGS.map((line, i) => {
        const [primary, secondary] = PATHS[line.pathVariant];
        const animClass = line.direction === 'ltr' ? 'wind-ltr' : 'wind-rtl';
        const posStyle: React.CSSProperties =
          line.direction === 'ltr'
            ? { left: `${line.x}%` }
            : { right: `${line.x}%` };
        // Hide every other line on mobile to reduce visual noise
        const mobileHidden = i % 2 === 1 ? 'hidden md:block' : '';

        return (
          <svg
            key={i}
            className={`absolute ${animClass} ${mobileHidden}`}
            style={{
              top: `${line.y}%`,
              ...posStyle,
              width: `clamp(${line.width * 0.6}px, ${line.width / 14.4}vw, ${line.width}px)`,
              height: '14px',
              transform: `rotate(${line.angle}deg)`,
              animationDuration: `${line.duration}s`,
              animationDelay: `${line.delay}s`,
            }}
            viewBox="0 0 65 14"
          >
            <path
              d={primary}
              stroke="var(--ink)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity={line.opacity}
            />
            <path
              d={secondary}
              stroke="var(--ink)"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              opacity={line.opacity * 0.6}
            />
          </svg>
        );
      })}
    </div>
  );
}

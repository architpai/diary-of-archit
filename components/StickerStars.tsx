'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Single consistent star path for all variants
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

interface StickerStarsProps {
  rating: number;  // 1-5
  color: string;
  seed?: number;   // deterministic randomness
}

// Convert skill level (0-100) to stars (1-5)
export function levelToStars(level: number): number {
  if (level >= 90) return 5;
  if (level >= 80) return 4;
  if (level >= 70) return 3;
  if (level >= 50) return 2;
  return 1;
}

// Deterministic pseudo-random
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Lighten a hex color by mixing with white
function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r + (255 - r) * amount);
  const ng = Math.round(g + (255 - g) * amount);
  const nb = Math.round(b + (255 - b) * amount);
  return `rgb(${nr},${ng},${nb})`;
}

// Darken a hex color by scaling toward black
function darkenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r * (1 - amount));
  const ng = Math.round(g * (1 - amount));
  const nb = Math.round(b * (1 - amount));
  return `rgb(${nr},${ng},${nb})`;
}

type VisualStyle = 'glossy' | 'polka' | 'striped' | 'metallic' | 'sparkle';
const VISUAL_STYLES: VisualStyle[] = ['glossy', 'polka', 'striped', 'metallic', 'sparkle'];

interface StarSVGProps {
  color: string;
  style: VisualStyle;
  uid: string; // unique id prefix for gradients/patterns
}

function GlossyStar({ color, uid }: { color: string; uid: string }) {
  const glossId = `${uid}-gloss`;
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="50%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="black" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {/* Base fill */}
      <path d={STAR_PATH} fill={color} />
      {/* Gloss overlay */}
      <path d={STAR_PATH} fill={`url(#${glossId})`} />
    </svg>
  );
}

function PolkaStar({ color, uid }: { color: string; uid: string }) {
  const patId = `${uid}-polka`;
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" style={{ overflow: 'visible' }}>
      <defs>
        <pattern id={patId} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.2" fill="white" opacity="0.4" />
        </pattern>
      </defs>
      <path d={STAR_PATH} fill={color} />
      <path d={STAR_PATH} fill={`url(#${patId})`} />
    </svg>
  );
}

function StripedStar({ color, uid }: { color: string; uid: string }) {
  const patId = `${uid}-stripes`;
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" style={{ overflow: 'visible' }}>
      <defs>
        <pattern id={patId} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="4" fill="white" opacity="0.3" />
        </pattern>
      </defs>
      <path d={STAR_PATH} fill={color} />
      <path d={STAR_PATH} fill={`url(#${patId})`} />
    </svg>
  );
}

function MetallicStar({ color, uid }: { color: string; uid: string }) {
  const gradId = `${uid}-metallic`;
  const light = lightenColor(color, 0.45);
  const dark = darkenColor(color, 0.3);
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={color} />
          <stop offset="52%" stopColor="white" stopOpacity="0.5" />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={STAR_PATH} fill={`url(#${gradId})`} />
    </svg>
  );
}

function SparkleStar({ color, uid }: { color: string; uid: string }) {
  const gradId = `${uid}-sparkle`;
  const light = lightenColor(color, 0.3);
  // Sparkle crosses positioned outside the star shape so they're visible
  const sparkles = [
    { x: 2, y: 2 },
    { x: 21, y: 3 },
    { x: 22, y: 19 },
    { x: 2, y: 18 },
  ];
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path d={STAR_PATH} fill={`url(#${gradId})`} />
      {sparkles.map((sp, idx) => (
        <g key={idx} transform={`translate(${sp.x},${sp.y})`}>
          <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke={darkenColor(color, 0.4)} strokeWidth="1" strokeLinecap="round" />
          <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke={darkenColor(color, 0.4)} strokeWidth="1" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

function FilledStar({ color, style, uid }: StarSVGProps) {
  switch (style) {
    case 'glossy':
      return <GlossyStar color={color} uid={uid} />;
    case 'polka':
      return <PolkaStar color={color} uid={uid} />;
    case 'striped':
      return <StripedStar color={color} uid={uid} />;
    case 'metallic':
      return <MetallicStar color={color} uid={uid} />;
    case 'sparkle':
      return <SparkleStar color={color} uid={uid} />;
  }
}

function UnfilledStar() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8">
      <path d={STAR_PATH} fill="#e0d5c0" />
    </svg>
  );
}

export default function StickerStars({ rating, color, seed = 0 }: StickerStarsProps) {
  const shouldReduceMotion = useReducedMotion();
  const random = seededRandom(seed + 42);

  const stars = Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < rating;
    // Assign one of the 5 visual styles (deterministic per position)
    const styleIndex = Math.floor(random() * VISUAL_STYLES.length);
    const rotation = (random() - 0.5) * 16;

    // Use rotation and scale variation for personality (no clipPath imperfections — they cause artifacts at this size)
    return {
      isFilled,
      styleIndex,
      rotation,
      scale: 0.85 + random() * 0.25,
      uid: `star-${seed}-${i}`,
    };
  });

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="relative"
          style={{ transform: `rotate(${star.rotation}deg) scale(${star.scale})` }}
          initial={shouldReduceMotion ? false : { scale: 0, rotate: star.rotation - 20 }}
          whileInView={{ scale: star.scale, rotate: star.rotation }}
          viewport={{ once: true }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 200, delay: i * 0.08 }
          }
        >
          <div style={{ filter: star.isFilled ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.25))' : 'none' }}>
            {star.isFilled ? (
              <FilledStar
                color={color}
                style={VISUAL_STYLES[star.styleIndex]}
                uid={star.uid}
              />
            ) : (
              <UnfilledStar />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Single consistent star path for all variants
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

interface StickerStarsProps {
  rating: number;  // 1-5
  color: string;
}

// Intentionally coarse mapping: stars convey general proficiency, not false precision.
// 5★ = expert (90+), 4★ = strong (80+), 3★ = proficient (70+), 2★ = familiar (50+), 1★ = learning
export function levelToStars(level: number): number {
  if (level >= 90) return 5;
  if (level >= 80) return 4;
  if (level >= 70) return 3;
  if (level >= 50) return 2;
  return 1;
}


function parseHex(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function lightenColor(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

function darkenColor(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgb(${Math.round(r * (1 - amount))},${Math.round(g * (1 - amount))},${Math.round(b * (1 - amount))})`;
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
  const sparkleColor = darkenColor(color, 0.5);
  const sparkles = [
    { x: 1, y: 1, delay: '0s' },
    { x: 22, y: 2, delay: '0.4s' },
    { x: 23, y: 20, delay: '0.8s' },
    { x: 1, y: 19, delay: '1.2s' },
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
          <g className="sparkle-twinkle" style={{ animationDelay: sp.delay }}>
            <line x1="-2" y1="0" x2="2" y2="0" stroke={sparkleColor} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke={sparkleColor} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="-1.2" y1="-1.2" x2="1.2" y2="1.2" stroke={sparkleColor} strokeWidth="0.7" strokeLinecap="round" />
            <line x1="1.2" y1="-1.2" x2="-1.2" y2="1.2" stroke={sparkleColor} strokeWidth="0.7" strokeLinecap="round" />
          </g>
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

// 96% glossy, 4% fun variant. 15% chance the last star is extra tilted/small (hand-placed feel).
function generateStars(rating: number) {
  const hasTrailingImperfection = Math.random() > 0.85;
  return Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < rating;
    const styleIndex = Math.random() > 0.96
      ? 1 + Math.floor(Math.random() * (VISUAL_STYLES.length - 1))
      : 0;
    let rotation = (Math.random() - 0.5) * 12;
    let scale = 0.93 + Math.random() * 0.1;
    if (hasTrailingImperfection && i === 4) {
      rotation = 12 + Math.random() * 8;
      scale = 0.87 + Math.random() * 0.06;
    }
    return { isFilled, styleIndex, rotation, scale, uid: `star-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${i}` };
  });
}

export default function StickerStars({ rating, color }: Omit<StickerStarsProps, 'seed'>) {
  const shouldReduceMotion = useReducedMotion();
  const [stars, setStars] = useState<ReturnType<typeof generateStars> | null>(null);

  useEffect(() => {
    setStars(generateStars(rating));
  }, [rating]);

  // SSR / first render: show plain stars to avoid hydration mismatch
  if (!stars) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i}>
            <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8">
              <path d={STAR_PATH} fill={i < rating ? color : '#e0d5c0'} />
            </svg>
          </div>
        ))}
      </div>
    );
  }

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

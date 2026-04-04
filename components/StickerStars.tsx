'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Three different star path designs (5-point variations)
const starVariants = [
  // Classic 5-point
  (fill: string) => (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={fill} />
  ),
  // Rounder, softer
  (fill: string) => (
    <path d="M12 1c.5 0 1 .3 1.2.8l2.5 5.5 6 .8c.7.1 1 1 .5 1.5l-4.4 4.2 1 6c.1.7-.6 1.2-1.2.9L12 18l-5.6 3c-.6.3-1.3-.2-1.2-.9l1-6L1.8 9.6c-.5-.5-.2-1.4.5-1.5l6-.8L10.8 1.8c.2-.5.7-.8 1.2-.8z" fill={fill} />
  ),
  // Chunky
  (fill: string) => (
    <path d="M12 0l4 7.5 8 1.5-5.5 5.5 1 8L12 19l-7.5 3.5 1-8L0 9l8-1.5z" fill={fill} />
  ),
];

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

export default function StickerStars({ rating, color, seed = 0 }: StickerStarsProps) {
  const shouldReduceMotion = useReducedMotion();
  const random = seededRandom(seed + 42);

  const stars = Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < rating;
    const variantIndex = Math.floor(random() * starVariants.length);
    const rotation = (random() - 0.5) * 16;
    const imperfectionRoll = random();

    let imperfection: 'none' | 'peel-right' | 'peel-top' | 'torn' | 'rotated' = 'none';
    if (imperfectionRoll > 0.85) imperfection = 'peel-right';
    else if (imperfectionRoll > 0.75) imperfection = 'peel-top';
    else if (imperfectionRoll > 0.7 && !isFilled) imperfection = 'torn';
    else if (imperfectionRoll > 0.5) imperfection = 'rotated';

    return {
      isFilled,
      variantIndex,
      rotation: imperfection === 'rotated' ? rotation * 2 : rotation,
      imperfection,
      scale: 0.9 + random() * 0.2,
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
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 md:w-7 md:h-7"
            style={{
              filter: star.isFilled ? 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' : 'none',
              ...(star.imperfection === 'peel-right' ? { clipPath: 'polygon(0 0, 92% 0, 95% 5%, 100% 100%, 0 100%)' } : {}),
              ...(star.imperfection === 'peel-top' ? { clipPath: 'polygon(5% 8%, 100% 0, 100% 100%, 0 100%)' } : {}),
              ...(star.imperfection === 'torn' ? { clipPath: 'polygon(0 40%, 100% 35%, 100% 100%, 0 100%)' } : {}),
            }}
          >
            {starVariants[star.variantIndex](star.isFilled ? color : '#e0d5c0')}
          </svg>
          {star.imperfection === 'peel-right' && star.isFilled && (
            <div
              className="absolute -top-0.5 -right-0.5 w-2 h-2"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, #d4c5a9 50%)',
                borderRadius: '0 2px 0 0',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

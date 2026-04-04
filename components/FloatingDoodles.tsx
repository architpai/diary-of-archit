'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useState, useEffect } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { allTechStickers } from './icons/TechStickers';

type StickerComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

interface Doodle {
  component: StickerComponent;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  rotation?: number;
}

interface FloatingDoodlesProps {
  variant?: 'code' | 'tech' | 'fun' | 'mixed';
  density?: 'sparse' | 'normal' | 'dense';
  className?: string;
}

function generateDoodles(density: 'sparse' | 'normal' | 'dense'): Doodle[] {
  const counts = { sparse: 4, normal: 6, dense: 10 };
  const count = counts[density];

  return Array.from({ length: count }, (_, i) => ({
    component: allTechStickers[i % allTechStickers.length],
    x: `${5 + (i * (90 / count)) + (Math.random() * 10 - 5)}%`,
    y: `${10 + (Math.random() * 80)}%`,
    size: 36 + Math.random() * 24,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 4,
    rotation: Math.random() * 30 - 15,
  }));
}

export default function FloatingDoodles({
  variant = 'mixed',
  density = 'normal',
  className = '',
}: FloatingDoodlesProps) {
  // variant is kept for API compatibility but all variants now render tech stickers
  void variant;

  const { isSerious } = useSeriousMode();
  const shouldReduceMotion = useReducedMotion();
  const [doodles, setDoodles] = useState<Doodle[]>([]);

  useEffect(() => {
    setDoodles(generateDoodles(density));
  }, [density]);

  // Hide in serious mode and reduced motion
  if (isSerious || shouldReduceMotion) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {doodles.map((doodle, index) => {
        const StickerComponent = doodle.component;
        return (
          <motion.div
            key={index}
            className="absolute select-none"
            style={{
              left: doodle.x,
              top: doodle.y,
            }}
            initial={{
              opacity: 0,
              rotate: doodle.rotation,
              scale: 0.8,
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              y: [0, -20, 0],
              rotate: [(doodle.rotation || 0), (doodle.rotation || 0) + 5, (doodle.rotation || 0)],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: doodle.duration,
              delay: doodle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <StickerComponent size={doodle.size} />
          </motion.div>
        );
      })}
    </div>
  );
}

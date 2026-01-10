'use client';

import { motion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useState, useEffect } from 'react';

interface Doodle {
  content: string;
  x: string;
  y: string;
  size: string;
  delay: number;
  duration: number;
  rotation?: number;
}

interface FloatingDoodlesProps {
  variant?: 'code' | 'tech' | 'fun' | 'mixed';
  density?: 'sparse' | 'normal' | 'dense';
  className?: string;
}

const doodleSets = {
  code: ['{ }', '< />', '//', '( )', '[ ]', '&&', '||', '===', '=>', '...'],
  tech: ['💻', '⚡', '🚀', '⚙️', '🔧', '📱', '☁️', '🌐', '🔌', '💡'],
  fun: ['✨', '⭐', '🎯', '🎨', '📝', '✏️', '📌', '🎪', '🎭', '🎬'],
  mixed: ['{ }', '💻', '✨', '< />', '⚡', '⭐', '( )', '🚀', '📝', '⚙️']
};

function generateDoodles(variant: 'code' | 'tech' | 'fun' | 'mixed', density: 'sparse' | 'normal' | 'dense'): Doodle[] {
  const items = doodleSets[variant];
  const counts = { sparse: 5, normal: 8, dense: 12 };
  const count = counts[density];
  
  return Array.from({ length: count }, (_, i) => ({
    content: items[i % items.length],
    x: `${5 + (i * (90 / count)) + (Math.random() * 10 - 5)}%`,
    y: `${10 + (Math.random() * 80)}%`,
    size: `${1 + Math.random() * 1.5}rem`,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 4,
    rotation: Math.random() * 30 - 15
  }));
}

export default function FloatingDoodles({   variant = 'mixed',
  density = 'normal',
  className = ''
}: FloatingDoodlesProps) {
  const { isSerious } = useSeriousMode();
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  
  useEffect(() => {
    setDoodles(generateDoodles(variant, density));
  }, [variant, density]);

  // Hide in serious mode
  if (isSerious) return null;
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {doodles.map((doodle, index) => (
        <motion.div
          key={index}
          className="absolute opacity-20 select-none"
          style={{
            left: doodle.x,
            top: doodle.y,
            fontSize: doodle.size,
            fontFamily: variant === 'code' ? 'monospace' : 'inherit',
          }}
          initial={{ 
            opacity: 0, 
            rotate: doodle.rotation,
            scale: 0.8 
          }}
          animate={{ 
            opacity: [0.1, 0.25, 0.1],
            y: [0, -20, 0],
            rotate: [(doodle.rotation || 0), (doodle.rotation || 0) + 5, (doodle.rotation || 0)],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: doodle.duration,
            delay: doodle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {doodle.content}
        </motion.div>
      ))}
    </div>
  );
}

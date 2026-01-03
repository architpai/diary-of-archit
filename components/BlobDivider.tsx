'use client';

import { motion } from 'framer-motion';

interface BlobDividerProps {
  position?: 'top' | 'bottom';
  fillColor?: string;
  className?: string;
  variant?: 1 | 2 | 3;
}

export default function BlobDivider({ 
  position = 'bottom', 
  fillColor = '#FFF9E5',
  className = '',
  variant = 1
}: BlobDividerProps) {
  const isTop = position === 'top';
  
  // Different wave patterns for variety
  const wavePaths = {
    1: "M0,60 C150,120 350,0 500,60 C650,120 850,0 1000,60 L1000,100 L0,100 Z",
    2: "M0,80 C200,20 300,100 500,50 C700,0 800,80 1000,40 L1000,100 L0,100 Z",
    3: "M0,50 Q250,100 500,50 T1000,50 L1000,100 L0,100 Z"
  };

  return (
    <div 
      className={`blob-divider ${isTop ? 'blob-divider-top' : 'blob-divider-bottom'} ${className}`}
      style={{ height: '80px' }}
    >
      <motion.svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', height: '100%' }}
      >
        <motion.path
          d={wavePaths[variant]}
          fill={fillColor}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

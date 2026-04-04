'use client';

import { useReducedMotion } from 'framer-motion';

export default function WindEffect() {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  const lines = [
    { y: '25%', delay: 0, duration: 2.5, width: 60 },
    { y: '40%', delay: 0.8, duration: 2, width: 45 },
    { y: '55%', delay: 1.5, duration: 2.8, width: 70 },
    { y: '35%', delay: 2.2, duration: 2.2, width: 50 },
    { y: '65%', delay: 0.4, duration: 2.6, width: 55 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {lines.map((line, i) => (
        <svg
          key={i}
          className="absolute"
          style={{
            top: line.y,
            left: '10%',
            width: `${line.width}px`,
            height: '12px',
            animation: `wind-blow ${line.duration}s ease-in-out ${line.delay}s infinite`,
          }}
          viewBox="0 0 60 12"
        >
          <path d="M0 6 Q15 3 30 6 Q45 9 60 6" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
          <path d="M5 8 Q20 5 35 8 Q50 11 60 8" stroke="var(--ink)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.2" />
        </svg>
      ))}
    </div>
  );
}

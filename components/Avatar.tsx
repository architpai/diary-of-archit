'use client';

import { motion, type Transition } from 'framer-motion';

interface AvatarProps {
  className?: string;
  animate?: boolean;
}

export default function Avatar({ className = '', animate = true }: AvatarProps) {
  // Pre-calculate random positions for beard (to avoid hydration mismatch)
  const beardDots = [
    { cx: 75, cy: 88, opacity: 0.8 },
    { cx: 82, cy: 85, opacity: 0.7 },
    { cx: 90, cy: 90, opacity: 0.9 },
    { cx: 98, cy: 87, opacity: 0.75 },
    { cx: 105, cy: 92, opacity: 0.85 },
    { cx: 112, cy: 88, opacity: 0.7 },
    { cx: 120, cy: 90, opacity: 0.8 },
    { cx: 78, cy: 95, opacity: 0.75 },
    { cx: 85, cy: 98, opacity: 0.9 },
    { cx: 95, cy: 96, opacity: 0.8 },
    { cx: 102, cy: 99, opacity: 0.85 },
    { cx: 110, cy: 95, opacity: 0.7 },
    { cx: 118, cy: 98, opacity: 0.75 },
    { cx: 80, cy: 102, opacity: 0.8 },
    { cx: 92, cy: 104, opacity: 0.9 },
    { cx: 100, cy: 103, opacity: 0.85 },
    { cx: 108, cy: 102, opacity: 0.7 },
    { cx: 115, cy: 105, opacity: 0.8 },
  ];

  const floatTransition: Transition = {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  const blinkTransition: Transition = {
    duration: 0.2,
    repeat: Infinity,
    repeatDelay: 3,
  };

  const smileTransition: Transition = {
    duration: 2,
    repeat: Infinity,
  };

  const armTransition: Transition = {
    duration: 3,
    repeat: Infinity,
  };

  return (
    <motion.svg
      viewBox="0 0 200 300"
      className={className}
      animate={animate ? { y: [0, -5, 0] } : undefined}
      transition={animate ? floatTransition : undefined}
      style={{ maxWidth: '200px' }}
    >
      {/* Head */}
      <ellipse
        cx="100"
        cy="60"
        rx="45"
        ry="50"
        fill="#D4A574"
        stroke="#2D2D2D"
        strokeWidth="2"
      />
      
      {/* Faded Undercut Hairstyle */}
      {/* Top hair - thick and styled */}
      <path
        d="M 60 45 Q 70 15, 100 20 Q 130 15, 140 45 Q 145 30, 130 25 Q 110 10, 90 15 Q 70 10, 55 35 Z"
        fill="#1a1a1a"
        stroke="#2D2D2D"
        strokeWidth="1"
      />
      {/* Side fade - left */}
      <path
        d="M 58 50 Q 55 65, 58 80 Q 56 70, 55 55 Z"
        fill="#3a3a3a"
        stroke="none"
        opacity="0.7"
      />
      {/* Side fade - right */}
      <path
        d="M 142 50 Q 145 65, 142 80 Q 144 70, 145 55 Z"
        fill="#3a3a3a"
        stroke="none"
        opacity="0.7"
      />
      
      {/* Ears */}
      <ellipse cx="55" cy="60" rx="8" ry="12" fill="#D4A574" stroke="#2D2D2D" strokeWidth="1.5" />
      <ellipse cx="145" cy="60" rx="8" ry="12" fill="#D4A574" stroke="#2D2D2D" strokeWidth="1.5" />
      
      {/* Eyes */}
      <motion.circle
        cx="80"
        cy="55"
        r="6"
        fill="#2D2D2D"
        animate={animate ? { scaleY: [1, 0.1, 1] } : undefined}
        transition={animate ? blinkTransition : undefined}
      />
      <motion.circle
        cx="120"
        cy="55"
        r="6"
        fill="#2D2D2D"
        animate={animate ? { scaleY: [1, 0.1, 1] } : undefined}
        transition={animate ? blinkTransition : undefined}
      />
      {/* Eye shine */}
      <circle cx="82" cy="53" r="2" fill="white" />
      <circle cx="122" cy="53" r="2" fill="white" />
      
      {/* Eyebrows */}
      <path d="M 70 45 Q 80 42, 90 46" stroke="#2D2D2D" strokeWidth="2" fill="none" />
      <path d="M 110 46 Q 120 42, 130 45" stroke="#2D2D2D" strokeWidth="2" fill="none" />
      
      {/* Nose */}
      <path d="M 100 60 L 98 72 Q 100 75, 105 72" stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
      
      {/* Stippled Beard - Pre-calculated positions */}
      {beardDots.map((dot, i) => (
        <circle
          key={`beard-${i}`}
          cx={dot.cx}
          cy={dot.cy}
          r="1.2"
          fill="#2D2D2D"
          opacity={dot.opacity}
        />
      ))}
      
      {/* Smile */}
      <motion.path
        d="M 85 82 Q 100 95, 115 82"
        stroke="#2D2D2D"
        strokeWidth="2"
        fill="none"
        animate={animate ? {
          d: ["M 85 82 Q 100 95, 115 82", "M 85 84 Q 100 92, 115 84", "M 85 82 Q 100 95, 115 82"],
        } : undefined}
        transition={animate ? smileTransition : undefined}
      />
      
      {/* Neck */}
      <rect x="90" y="105" width="20" height="20" fill="#D4A574" stroke="#2D2D2D" strokeWidth="1.5" />
      
      {/* Body - Fit/Athletic Build */}
      <path
        d="M 60 125 L 90 125 L 90 200 L 60 200 Q 50 162, 60 125"
        fill="#3B5998"
        stroke="#2D2D2D"
        strokeWidth="2"
      />
      <path
        d="M 110 125 L 140 125 Q 150 162, 140 200 L 110 200 L 110 125"
        fill="#3B5998"
        stroke="#2D2D2D"
        strokeWidth="2"
      />
      {/* Torso center */}
      <rect x="90" y="125" width="20" height="75" fill="#3B5998" stroke="none" />
      
      {/* T-shirt collar */}
      <path d="M 85 125 Q 100 135, 115 125" stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
      
      {/* Arms - Athletic */}
      <motion.path
        d="M 60 130 Q 35 145, 30 180 Q 28 185, 35 185 Q 45 175, 55 140"
        fill="#D4A574"
        stroke="#2D2D2D"
        strokeWidth="2"
        animate={animate ? {
          d: [
            "M 60 130 Q 35 145, 30 180 Q 28 185, 35 185 Q 45 175, 55 140",
            "M 60 130 Q 38 148, 33 180 Q 31 185, 38 185 Q 48 175, 55 140",
            "M 60 130 Q 35 145, 30 180 Q 28 185, 35 185 Q 45 175, 55 140"
          ],
        } : undefined}
        transition={animate ? armTransition : undefined}
      />
      <motion.path
        d="M 140 130 Q 165 145, 170 180 Q 172 185, 165 185 Q 155 175, 145 140"
        fill="#D4A574"
        stroke="#2D2D2D"
        strokeWidth="2"
        animate={animate ? {
          d: [
            "M 140 130 Q 165 145, 170 180 Q 172 185, 165 185 Q 155 175, 145 140",
            "M 140 130 Q 162 148, 167 180 Q 169 185, 162 185 Q 152 175, 145 140",
            "M 140 130 Q 165 145, 170 180 Q 172 185, 165 185 Q 155 175, 145 140"
          ],
        } : undefined}
        transition={animate ? { ...armTransition, delay: 0.5 } : undefined}
      />
      
      {/* Legs */}
      <rect x="70" y="200" width="25" height="60" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="1.5" rx="3" />
      <rect x="105" y="200" width="25" height="60" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="1.5" rx="3" />
      
      {/* Shoes */}
      <ellipse cx="82" cy="265" rx="18" ry="8" fill="#1a1a1a" stroke="#2D2D2D" strokeWidth="1.5" />
      <ellipse cx="118" cy="265" rx="18" ry="8" fill="#1a1a1a" stroke="#2D2D2D" strokeWidth="1.5" />
    </motion.svg>
  );
}

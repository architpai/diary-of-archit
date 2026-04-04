'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';

interface Section {
  id: string;
  label: string;
}

/* ═══════════════════════════════════════════════════════
   HAND-CRAFTED TREASURE MAP

   The map uses a hand-defined path with sharp turns and
   personality — NOT a computed sine wave. Each landmark
   is placed at a specific coordinate with a unique icon.
   ═══════════════════════════════════════════════════════ */

// Landmark positions in a 140x400 SVG viewBox — hand-placed for visual balance
const LANDMARKS = [
  { x: 70, y: 35, icon: 'home' },      // Top center
  { x: 110, y: 120, icon: 'journey' },  // Right side
  { x: 30, y: 205, icon: 'skills' },    // Left side
  { x: 105, y: 285, icon: 'peek' },     // Right side
  { x: 70, y: 370, icon: 'treasure' },  // Bottom center
];

// Hand-drawn path between landmarks — sharp turns, not smooth curves
// This is THE path. It has character. It feels drawn, not computed.
const MAP_PATH = `
  M 70 35
  L 75 50
  C 80 65, 115 80, 110 120
  L 108 135
  C 100 155, 45 165, 30 205
  L 33 220
  C 40 245, 100 255, 105 285
  L 100 300
  C 95 325, 75 345, 70 370
`.trim();

// Simplified path segments for avatar interpolation
// Each segment: [startX, startY, endX, endY]
const SEGMENTS = [
  [70, 35, 110, 120],
  [110, 120, 30, 205],
  [30, 205, 105, 285],
  [105, 285, 70, 370],
];

function getAvatarPosition(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  const totalSegs = SEGMENTS.length;
  const segProgress = clamped * totalSegs;
  const segIndex = Math.min(Math.floor(segProgress), totalSegs - 1);
  const localT = segProgress - segIndex;

  const [sx, sy, ex, ey] = SEGMENTS[segIndex];
  // Add a slight curve to the interpolation so avatar doesn't go straight
  const midX = (sx + ex) / 2 + (segIndex % 2 === 0 ? 15 : -15);
  const midY = (sy + ey) / 2;

  const t = localT;
  const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * midX + t * t * ex;
  const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * midY + t * t * ey;
  return { x, y };
}

/* ── Landmark Icons ── */

function HomeIcon() {
  return (
    <g>
      {/* Roof */}
      <path d="M-10 0 L0 -10 L10 0" stroke="#5C3D2E" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* House body */}
      <rect x="-7" y="0" width="14" height="10" fill="#D4A373" stroke="#5C3D2E" strokeWidth="2" rx="1" />
      {/* Door */}
      <rect x="-2" y="4" width="4" height="6" fill="#8B5E3C" stroke="#5C3D2E" strokeWidth="1" rx="0.5" />
      {/* Window */}
      <rect x="4" y="2" width="3" height="3" fill="#87CEEB" stroke="#5C3D2E" strokeWidth="0.8" />
      {/* Chimney smoke */}
      <path d="M6 -8 Q8 -12 5 -14" stroke="#8B735580" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function ScrollIcon() {
  return (
    <g>
      {/* Scroll body */}
      <rect x="-8" y="-6" width="16" height="12" rx="2" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="2" />
      {/* Scroll rolls */}
      <ellipse cx="-8" cy="0" rx="2" ry="7" fill="#D4A373" stroke="#5C3D2E" strokeWidth="1.5" />
      <ellipse cx="8" cy="0" rx="2" ry="7" fill="#D4A373" stroke="#5C3D2E" strokeWidth="1.5" />
      {/* Text lines */}
      <line x1="-4" y1="-3" x2="4" y2="-3" stroke="#8B7355" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="-4" y1="0" x2="4" y2="0" stroke="#8B7355" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="-4" y1="3" x2="2" y2="3" stroke="#8B7355" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function BoltIcon() {
  return (
    <g>
      <path d="M2 -11 L-4 0 L2 0 L-2 11 L8 -2 L2 -2 Z"
        fill="#FFD700" stroke="#B8860B" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Energy sparks */}
      <line x1="-7" y1="-4" x2="-5" y2="-2" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="3" x2="7" y2="1" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function SpyglassIcon() {
  return (
    <g>
      {/* Lens */}
      <circle cx="-2" cy="-2" r="6" fill="#87CEEB40" stroke="#5C3D2E" strokeWidth="2" />
      {/* Handle */}
      <line x1="2.5" y1="2.5" x2="9" y2="9" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
      {/* Lens glare */}
      <path d="M-5 -4 Q-3 -6 -1 -5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

function StrawHatSkull() {
  return (
    <g className="treasure-glow">
      {/* X marks the spot — behind skull */}
      <line x1="-14" y1="-12" x2="14" y2="12" stroke="#E63946" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <line x1="14" y1="-12" x2="-14" y2="12" stroke="#E63946" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />

      {/* Crossbones */}
      <line x1="-11" y1="-4" x2="11" y2="8" stroke="#F5E6C8" strokeWidth="3" strokeLinecap="round" />
      <line x1="11" y1="-4" x2="-11" y2="8" stroke="#F5E6C8" strokeWidth="3" strokeLinecap="round" />
      <line x1="-11" y1="-4" x2="11" y2="8" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="-4" x2="-11" y2="8" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" />
      {/* Bone ends */}
      <circle cx="-11" cy="-4" r="2" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1" />
      <circle cx="11" cy="-4" r="2" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1" />
      <circle cx="-11" cy="8" r="2" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1" />
      <circle cx="11" cy="8" r="2" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1" />

      {/* Skull */}
      <circle cx="0" cy="0" r="8" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="2" />
      {/* X eyes — Luffy's Jolly Roger style */}
      <line x1="-5" y1="-3" x2="-2" y2="0" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="-2" y1="-3" x2="-5" y2="0" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="2" y1="-3" x2="5" y2="0" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5" y1="-3" x2="2" y2="0" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" />
      {/* Wide grin with teeth */}
      <path d="M-5 3 Q0 8 5 3" stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
      <line x1="-2" y1="3.8" x2="-2" y2="5.5" stroke="#2D2D2D" strokeWidth="0.8" />
      <line x1="0" y1="4.3" x2="0" y2="6" stroke="#2D2D2D" strokeWidth="0.8" />
      <line x1="2" y1="3.8" x2="2" y2="5.5" stroke="#2D2D2D" strokeWidth="0.8" />

      {/* STRAW HAT — the iconic element */}
      {/* Hat dome */}
      <path d="M-7 -5 Q-7 -13 0 -14 Q7 -13 7 -5" fill="#F0D48A" stroke="#5C3D2E" strokeWidth="1.5" />
      {/* Hat brim */}
      <ellipse cx="0" cy="-5" rx="11" ry="3" fill="#F0D48A" stroke="#5C3D2E" strokeWidth="1.5" />
      {/* Red ribbon */}
      <rect x="-7.5" y="-7" width="15" height="2.5" rx="1" fill="#E63946" />

      {/* Animated sparkles around the treasure */}
      <g className="sparkle-twinkle" style={{ animationDelay: '0s' }}>
        <line x1="-16" y1="-14" x2="-14" y2="-12" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-15" y1="-14" x2="-15" y2="-12" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="sparkle-twinkle" style={{ animationDelay: '0.5s' }}>
        <line x1="14" y1="-12" x2="16" y2="-14" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="-14" x2="15" y2="-12" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="sparkle-twinkle" style={{ animationDelay: '1s' }}>
        <line x1="-16" y1="10" x2="-14" y2="8" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-15" y1="8" x2="-15" y2="10" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="sparkle-twinkle" style={{ animationDelay: '1.5s' }}>
        <line x1="14" y1="8" x2="16" y2="10" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="8" x2="15" y2="10" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </g>
  );
}

const ICON_RENDERERS: Record<string, () => JSX.Element> = {
  home: HomeIcon,
  journey: ScrollIcon,
  skills: BoltIcon,
  peek: SpyglassIcon,
  treasure: StrawHatSkull,
};

/* ── Compass Rose ── */
function CompassRose({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.svg
      width="36" height="36" viewBox="0 0 36 36"
      className="mx-auto"
      animate={shouldReduceMotion ? undefined : { rotate: 360 }}
      transition={shouldReduceMotion ? undefined : { duration: 30, repeat: Infinity, ease: 'linear' }}
    >
      <g transform="translate(18,18)">
        {/* Outer ring */}
        <circle r="16" fill="none" stroke="#8B735540" strokeWidth="0.5" />
        {/* Cardinal points */}
        <polygon points="0,-14 2.5,-4 -2.5,-4" fill="#2D2D2D" />
        <polygon points="0,14 2.5,4 -2.5,4" fill="#D4A373" />
        <polygon points="14,0 4,2.5 4,-2.5" fill="#D4A373" />
        <polygon points="-14,0 -4,2.5 -4,-2.5" fill="#D4A373" />
        {/* Intermediate points */}
        <polygon points="9,-9 4,-2 2,-4" fill="#D4A37360" />
        <polygon points="9,9 4,2 2,4" fill="#D4A37360" />
        <polygon points="-9,9 -4,2 -2,4" fill="#D4A37360" />
        <polygon points="-9,-9 -4,-2 -2,-4" fill="#D4A37360" />
        {/* Center */}
        <circle r="2.5" fill="#E63946" />
        <circle r="1" fill="#FFD700" />
        {/* N label */}
        <text y="-14.5" fontSize="5" textAnchor="middle" fill="#E63946" fontWeight="bold" fontFamily="serif">N</text>
      </g>
    </motion.svg>
  );
}

/* ── Sea decoration waves ── */
function SeaWaves() {
  return (
    <>
      <path d="M5 160 Q12 155 19 160 Q26 165 33 160" stroke="#4A90D940" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M7 165 Q14 160 21 165 Q28 170 35 165" stroke="#4A90D930" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M100 90 Q107 85 114 90 Q121 95 128 90" stroke="#4A90D940" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M102 95 Q109 90 116 95 Q123 100 130 95" stroke="#4A90D930" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M8 320 Q15 315 22 320 Q29 325 36 320" stroke="#4A90D935" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </>
  );
}

/* ── Dotted border frame ── */
function MapBorder() {
  return (
    <rect
      x="4" y="4" width="132" height="392" rx="6"
      fill="none" stroke="#8B735530" strokeWidth="1"
      strokeDasharray="4 3"
    />
  );
}

/* ── "Here Be Dragons" text ── */
function HereBeDragons() {
  return (
    <text
      x="70" y="398"
      textAnchor="middle"
      fontSize="6"
      fill="#8B735540"
      fontFamily="serif"
      fontStyle="italic"
    >
      Here be dragons
    </text>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function MapScrollNav() {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sections: Section[] = [
    { id: 'hero', label: t('nav.home') },
    { id: 'timeline', label: t('nav.journey') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'sneakpeek', label: t('nav.peek') },
    { id: 'contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);

      const scrollPosition = scrollTop + window.innerHeight / 2;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(i);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const el = document.getElementById(sections[index].id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Serious mode — minimal stepper */
  if (isSerious) {
    return (
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col gap-3">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === index ? 'bg-gray-800 w-10' : 'bg-gray-300 hover:bg-gray-500'
              }`}
              title={section.label}
              aria-label={section.label}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Diary mode: The Treasure Map ── */

  const avatarPos = getAvatarPosition(scrollProgress / 100);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div
        className="relative rounded-2xl wobbly-border"
        style={{
          width: '175px',
          padding: '12px',
          backgroundColor: '#F5E6C8',
          backgroundImage: `
            radial-gradient(circle at 25% 20%, rgba(139,115,85,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 65%, rgba(139,115,85,0.12) 0%, transparent 45%),
            radial-gradient(circle at 40% 85%, rgba(139,115,85,0.10) 0%, transparent 40%),
            radial-gradient(circle at 70% 10%, rgba(160,120,60,0.08) 0%, transparent 30%)
          `,
          boxShadow: `
            4px 4px 12px rgba(0,0,0,0.2),
            inset 0 0 20px rgba(139,115,85,0.15),
            inset 2px 2px 6px rgba(255,255,255,0.1)
          `,
        }}
      >
        {/* Compass Rose */}
        <CompassRose shouldReduceMotion={shouldReduceMotion} />

        {/* The Map SVG */}
        <svg
          width="140"
          height="405"
          viewBox="0 0 140 405"
          className="mx-auto"
          style={{ overflow: 'visible' }}
        >
          {/* Decorative border */}
          <MapBorder />

          {/* Sea wave decorations */}
          <SeaWaves />

          {/* Background path — old faded ink trail */}
          <path
            d={MAP_PATH}
            stroke="#8B7355"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 5"
            opacity="0.3"
          />

          {/* Progress path — red pen marking the route */}
          <motion.path
            d={MAP_PATH}
            stroke="#E63946"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: scrollProgress / 100 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          />

          {/* Landmarks */}
          {LANDMARKS.map((lm, index) => {
            const isActive = activeSection === index;
            const isTreasure = lm.icon === 'treasure';
            const IconComponent = ICON_RENDERERS[lm.icon];

            return (
              <g key={lm.icon}>
                {/* Clickable hit area */}
                <circle
                  cx={lm.x} cy={lm.y} r={20}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => scrollToSection(index)}
                />

                {/* Active scribble-circle highlight */}
                {isActive && !isTreasure && (
                  <ellipse
                    cx={lm.x} cy={lm.y}
                    rx="18" ry="17"
                    fill="none"
                    stroke="#E63946"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.6"
                    transform={`rotate(-5, ${lm.x}, ${lm.y})`}
                  />
                )}

                {/* White circle background for non-treasure icons */}
                {!isTreasure && (
                  <circle
                    cx={lm.x} cy={lm.y} r="16"
                    fill="#F5E6C8"
                    stroke="#8B7355"
                    strokeWidth="1.2"
                    opacity={isActive ? 1 : 0.7}
                  />
                )}

                {/* Icon */}
                <g
                  transform={`translate(${lm.x}, ${lm.y})${isTreasure ? ' scale(1.15)' : ''}`}
                  style={{ color: isActive ? '#2D2D2D' : '#8B7355' }}
                  opacity={isActive ? 1 : 0.65}
                >
                  <IconComponent />
                </g>

                {/* Section label below landmark */}
                <text
                  x={lm.x}
                  y={lm.y + (isTreasure ? 24 : 20)}
                  textAnchor="middle"
                  fontSize="7"
                  fill={isActive ? '#2D2D2D' : '#8B735580'}
                  fontFamily="serif"
                  fontStyle="italic"
                >
                  {sections[index]?.label}
                </text>
              </g>
            );
          })}

          {/* "Here be dragons" at bottom */}
          <HereBeDragons />
        </svg>

        {/* Walking Avatar — follows the path */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `${10 + avatarPos.x * (155 / 140) - 25}px`,
            top: `${52 + avatarPos.y * (405 / 405)}px`,
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : { rotate: ['-4deg', '4deg', '-4deg'] }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* "YOU ARE HERE" flag */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 flag-wave whitespace-nowrap"
            style={{
              background: '#E63946',
              color: 'white',
              fontSize: '7px',
              fontWeight: 'bold',
              padding: '1px 4px',
              borderRadius: '2px',
              fontFamily: 'serif',
            }}
          >
            {isJapanese ? 'ここ!' : 'YOU ARE HERE'}
          </div>
          <Image
            src="/avatar/walking_pose.webp"
            alt="Walking character"
            width={50}
            height={65}
            className="drop-shadow-lg"
          />
        </motion.div>
      </div>
    </div>
  );
}

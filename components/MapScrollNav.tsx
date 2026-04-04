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

/* ═══════════════════════════════════════════════════════════════
   TREASURE MAP SCROLL NAVIGATION

   A hand-illustrated treasure map fixed to the right side of
   the viewport. Each section of the portfolio is a landmark
   on the map. As the user scrolls, a walking avatar traces
   the path. The final destination: a One Piece Straw Hat
   Jolly Roger marking the treasure (contact section).
   ═══════════════════════════════════════════════════════════════ */

// Landmark coordinates in 140×410 SVG space
const LANDMARKS = [
  { x: 70, y: 40 },   // Home — top center
  { x: 108, y: 130 }, // Journey — right
  { x: 32, y: 215 },  // Skills — left
  { x: 102, y: 295 }, // Peek — right
  { x: 70, y: 378 },  // Treasure — bottom center
];

// Hand-drawn path — irregular curves with personality
const MAP_PATH = [
  'M 70 40',
  'C 72 60, 85 75, 92 90',     // gentle right drift
  'C 100 105, 112 115, 108 130', // arrive at journey
  'C 104 148, 75 165, 58 180', // sweep left
  'C 42 195, 30 205, 32 215',  // arrive at skills
  'C 34 230, 50 248, 68 260',  // curve back right
  'C 88 274, 104 285, 102 295', // arrive at peek
  'C 100 310, 90 330, 82 348', // descend
  'C 76 360, 72 370, 70 378',  // arrive at treasure
].join(' ');

// Ghost path — slightly offset for double-stroke hand-drawn effect
const MAP_PATH_GHOST = [
  'M 72 41',
  'C 74 61, 87 76, 94 91',
  'C 102 106, 113 117, 110 131',
  'C 106 149, 77 166, 60 181',
  'C 44 196, 32 206, 34 216',
  'C 36 231, 52 249, 70 261',
  'C 90 275, 106 286, 104 296',
  'C 102 311, 92 331, 84 349',
  'C 78 361, 74 371, 72 379',
].join(' ');

// Avatar path interpolation segments
const SEGMENTS: [number, number, number, number][] = [
  [70, 40, 108, 130],
  [108, 130, 32, 215],
  [32, 215, 102, 295],
  [102, 295, 70, 378],
];

function getAvatarPosition(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const n = SEGMENTS.length;
  const seg = p * n;
  const i = Math.min(Math.floor(seg), n - 1);
  const t = seg - i;
  const [sx, sy, ex, ey] = SEGMENTS[i];
  const mx = (sx + ex) / 2 + (i % 2 === 0 ? 12 : -12);
  const my = (sy + ey) / 2;
  const x = (1 - t) ** 2 * sx + 2 * (1 - t) * t * mx + t ** 2 * ex;
  const y = (1 - t) ** 2 * sy + 2 * (1 - t) * t * my + t ** 2 * ey;
  return { x, y };
}

/* ─────────────────────────────────────
   LANDMARK ICONS
   Each is drawn at origin (0,0) and
   translated to position by the parent.
   ───────────────────────────────────── */

function HomeIcon({ active }: { active: boolean }) {
  const o = active ? 1 : 0.6;
  return (
    <g opacity={o}>
      <path d="M-9 1 L0 -9 L9 1" stroke="#5C3D2E" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="-6" y="1" width="12" height="9" fill="#D4A373" stroke="#5C3D2E" strokeWidth="1.5" rx="0.5" />
      <rect x="-1.5" y="4.5" width="3" height="5.5" fill="#7B4B2A" rx="0.5" />
      <rect x="3" y="3" width="2.5" height="2.5" fill="#A8D8EA" stroke="#5C3D2E" strokeWidth="0.6" />
      <path d="M5 -7 Q7 -10 5 -12" stroke="#8B735560" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

function ScrollIcon({ active }: { active: boolean }) {
  const o = active ? 1 : 0.6;
  return (
    <g opacity={o}>
      <rect x="-7" y="-5.5" width="14" height="11" rx="1.5" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1.5" />
      <ellipse cx="-7" cy="0" rx="1.8" ry="6.5" fill="#E8D5B7" stroke="#5C3D2E" strokeWidth="1.2" />
      <ellipse cx="7" cy="0" rx="1.8" ry="6.5" fill="#E8D5B7" stroke="#5C3D2E" strokeWidth="1.2" />
      <line x1="-3.5" y1="-2.5" x2="3.5" y2="-2.5" stroke="#8B7355" strokeWidth="1" strokeLinecap="round" />
      <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#8B7355" strokeWidth="1" strokeLinecap="round" />
      <line x1="-3.5" y1="2.5" x2="1.5" y2="2.5" stroke="#8B735580" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

function BoltIcon({ active }: { active: boolean }) {
  const o = active ? 1 : 0.6;
  return (
    <g opacity={o}>
      <path d="M1.5 -10 L-3.5 0 L1.5 0 L-1.5 10 L7 -1.5 L2 -1.5 Z"
        fill="#FFD700" stroke="#B8860B" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="-6" y1="-3" x2="-4.5" y2="-1.5" stroke="#FFD70090" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="2" x2="6.5" y2="0.5" stroke="#FFD70090" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

function SpyglassIcon({ active }: { active: boolean }) {
  const o = active ? 1 : 0.6;
  return (
    <g opacity={o}>
      <circle cx="-2" cy="-2" r="5.5" fill="#E8F4F8" stroke="#5C3D2E" strokeWidth="1.8" />
      <line x1="2" y1="2" x2="8" y2="8" stroke="#7B4B2A" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="2" y1="2" x2="8" y2="8" stroke="#A0754A" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M-5 -3.5 Q-3 -5.5 -1 -4.5" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
    </g>
  );
}

function StrawHatSkull({ active }: { active: boolean }) {
  return (
    <g className={active ? 'treasure-glow' : ''} opacity={active ? 1 : 0.7}>
      {/* Crossbones — thick with bone-ends */}
      <line x1="-12" y1="-5" x2="12" y2="8" stroke="#F5E6C8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="12" y1="-5" x2="-12" y2="8" stroke="#F5E6C8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="-12" y1="-5" x2="12" y2="8" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="-5" x2="-12" y2="8" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" />
      {[[-12, -5], [12, -5], [-12, 8], [12, 8]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.2" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1" />
      ))}

      {/* Skull head */}
      <ellipse cx="0" cy="1" rx="8.5" ry="8" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1.8" />
      {/* Jaw */}
      <ellipse cx="0" cy="6" rx="6" ry="3.5" fill="#F5E6C8" stroke="#5C3D2E" strokeWidth="1.2" />

      {/* X-mark eyes — Luffy's Jolly Roger */}
      <line x1="-5" y1="-3" x2="-2" y2="0" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
      <line x1="-2" y1="-3" x2="-5" y2="0" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="-3" x2="5" y2="0" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="-3" x2="2" y2="0" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />

      {/* Wide grin */}
      <path d="M-5 4 Q-2 8 0 8 Q2 8 5 4" stroke="#2D2D2D" strokeWidth="1.3" fill="none" />
      {[-2.5, 0, 2.5].map((tx, i) => (
        <line key={i} x1={tx} y1={5} x2={tx} y2={7} stroke="#2D2D2D" strokeWidth="0.8" />
      ))}

      {/* ── THE STRAW HAT ── */}
      <path d="M-7.5 -5 Q-8 -14 0 -15 Q8 -14 7.5 -5" fill="#F0D48A" stroke="#5C3D2E" strokeWidth="1.5" />
      <ellipse cx="0" cy="-5.5" rx="12" ry="3.2" fill="#F0D48A" stroke="#5C3D2E" strokeWidth="1.5" />
      {/* Red ribbon — the iconic detail */}
      <rect x="-8" y="-8" width="16" height="2.8" rx="1" fill="#E63946" />
      <circle cx="-4" cy="-6.6" r="0.6" fill="#C0392B" />

      {/* Golden sparkles — animated */}
      {[
        { x: -16, y: -14, d: '0s' }, { x: 15, y: -12, d: '0.6s' },
        { x: -15, y: 11, d: '1.2s' }, { x: 14, y: 10, d: '0.3s' },
        { x: 0, y: -20, d: '0.9s' },
      ].map((sp, i) => (
        <g key={i} transform={`translate(${sp.x},${sp.y})`} className="sparkle-twinkle" style={{ animationDelay: sp.d }}>
          <line x1="-1.8" y1="0" x2="1.8" y2="0" stroke="#FFD700" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="0" y1="-1.8" x2="0" y2="1.8" stroke="#FFD700" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

type LandmarkIconComponent = typeof HomeIcon;
const ICON_MAP: Record<string, LandmarkIconComponent> = {
  home: HomeIcon, journey: ScrollIcon, skills: BoltIcon,
  peek: SpyglassIcon, treasure: StrawHatSkull,
};
const ICON_KEYS = ['home', 'journey', 'skills', 'peek', 'treasure'];

/* ── Compass Rose ── */
function CompassRose({ rm }: { rm: boolean | null }) {
  return (
    <motion.svg
      width="34" height="34" viewBox="0 0 34 34" className="mx-auto mb-1"
      animate={rm ? undefined : { rotate: 360 }}
      transition={rm ? undefined : { duration: 30, repeat: Infinity, ease: 'linear' }}
    >
      <g transform="translate(17,17)">
        <circle r="15" fill="none" stroke="#8B735530" strokeWidth="0.5" />
        <polygon points="0,-13 2.2,-4 -2.2,-4" fill="#2D2D2D" />
        <polygon points="0,13 2.2,4 -2.2,4" fill="#C8A97080" />
        <polygon points="13,0 4,2.2 4,-2.2" fill="#C8A97080" />
        <polygon points="-13,0 -4,2.2 -4,-2.2" fill="#C8A97080" />
        {/* Diagonals */}
        <polygon points="8,-8 3,-1.5 1.5,-3" fill="#C8A97050" />
        <polygon points="8,8 3,1.5 1.5,3" fill="#C8A97050" />
        <polygon points="-8,8 -3,1.5 -1.5,3" fill="#C8A97050" />
        <polygon points="-8,-8 -3,-1.5 -1.5,-3" fill="#C8A97050" />
        <circle r="2.2" fill="#E63946" />
        <circle r="0.8" fill="#FFD700" />
        <text y="-13" fontSize="4.5" textAnchor="middle" fill="#E63946" fontWeight="bold" fontFamily="serif" dominantBaseline="auto">N</text>
      </g>
    </motion.svg>
  );
}

/* ── Decorative elements ── */

function MapDecorations() {
  return (
    <>
      {/* Sea waves */}
      <g opacity="0.35">
        <path d="M6 160 Q13 155 20 160 Q27 165 34 160" stroke="#4A90D9" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M8 165 Q15 160 22 165" stroke="#4A90D9" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      </g>
      <g opacity="0.25">
        <path d="M100 95 Q107 90 114 95 Q121 100 128 95" stroke="#4A90D9" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M103 100 Q110 95 117 100" stroke="#4A90D9" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      </g>

      {/* Tiny palm tree */}
      <g transform="translate(18, 85)" opacity="0.35">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#5C3D2E" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M0 0 Q-5 -3 -7 0" stroke="#2E7D32" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M0 0 Q5 -4 8 -1" stroke="#2E7D32" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M0 -1 Q-3 -5 -1 -6" stroke="#2E7D32" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>

      {/* Tiny anchor */}
      <g transform="translate(120, 250)" opacity="0.3">
        <circle cx="0" cy="-4" r="1.5" fill="none" stroke="#5C3D2E" strokeWidth="0.8" />
        <line x1="0" y1="-2.5" x2="0" y2="5" stroke="#5C3D2E" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M-4 3 Q0 7 4 3" stroke="#5C3D2E" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <line x1="-2" y1="-4" x2="2" y2="-4" stroke="#5C3D2E" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* Age spots / foxing */}
      <circle cx="25" cy="55" r="3" fill="#8B735512" />
      <circle cx="115" cy="180" r="2" fill="#8B735510" />
      <circle cx="40" cy="340" r="2.5" fill="#8B735510" />

      {/* Dotted inner border */}
      <rect x="6" y="6" width="128" height="398" rx="5" fill="none" stroke="#8B735520" strokeWidth="0.8" strokeDasharray="3 2.5" />
    </>
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
      const top = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((top / h) * 100);
      const mid = top + window.innerHeight / 2;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= mid) { setActiveSection(i); break; }
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (i: number) => {
    const el = document.getElementById(sections[i].id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isSerious) {
    return (
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col gap-3">
          {sections.map((s, i) => (
            <button key={s.id} onClick={() => scrollToSection(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSection === i ? 'bg-gray-800 w-10' : 'bg-gray-300 hover:bg-gray-500'}`}
              title={s.label} aria-label={s.label} />
          ))}
        </div>
      </div>
    );
  }

  const avatar = getAvatarPosition(scrollProgress / 100);

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div
        className="relative wobbly-border"
        style={{
          width: '175px',
          padding: '10px 10px 8px',
          backgroundColor: '#F5E6C8',
          backgroundImage: `
            radial-gradient(ellipse at 30% 15%, rgba(160,120,60,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 75% 70%, rgba(139,115,85,0.14) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(120,95,65,0.10) 0%, transparent 45%)
          `,
          boxShadow: `
            3px 4px 14px rgba(0,0,0,0.25),
            inset 0 0 30px rgba(100,75,45,0.12),
            inset 1px 1px 4px rgba(255,245,220,0.3)
          `,
        }}
      >
        {/* Burnt edge vignette */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ boxShadow: 'inset 0 0 25px rgba(80,50,20,0.15)' }} />

        <CompassRose rm={shouldReduceMotion} />

        <svg width="140" height="410" viewBox="0 0 140 410" className="mx-auto" style={{ overflow: 'visible' }}>
          <MapDecorations />

          {/* Ghost path — slightly offset for double-stroke hand-drawn effect */}
          <path d={MAP_PATH_GHOST} stroke="#8B7355" strokeWidth="1" fill="none"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />

          {/* Background path — faded ink */}
          <path d={MAP_PATH} stroke="#8B7355" strokeWidth="2.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 4" opacity="0.25" />

          {/* Progress path — red ink */}
          <motion.path
            d={MAP_PATH} stroke="#E63946" strokeWidth="2.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: scrollProgress / 100 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          />

          {/* Landmarks */}
          {LANDMARKS.map((lm, index) => {
            const isActive = activeSection === index;
            const isTreasure = index === 4;
            const key = ICON_KEYS[index];
            const Icon = ICON_MAP[key];

            return (
              <g key={key}>
                {/* Hit area */}
                <circle cx={lm.x} cy={lm.y} r={22} fill="transparent" className="cursor-pointer" onClick={() => scrollToSection(index)} />

                {/* Active ring */}
                {isActive && !isTreasure && (
                  <motion.ellipse
                    cx={lm.x} cy={lm.y} rx="19" ry="18"
                    fill="none" stroke="#E63946" strokeWidth="1.3" strokeDasharray="4 2.5"
                    opacity="0.55" transform={`rotate(-4, ${lm.x}, ${lm.y})`}
                    animate={shouldReduceMotion ? undefined : { scale: [1, 1.06, 1] }}
                    transition={shouldReduceMotion ? undefined : { duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Background circle for non-treasure */}
                {!isTreasure && (
                  <circle cx={lm.x} cy={lm.y} r="15"
                    fill={isActive ? '#FFF9E5' : '#F5E6C8'}
                    stroke={isActive ? '#5C3D2E' : '#8B735560'}
                    strokeWidth={isActive ? 1.5 : 1} />
                )}

                {/* Icon */}
                <g transform={`translate(${lm.x}, ${lm.y})${isTreasure ? ' scale(1.2)' : ''}`}>
                  <Icon active={isActive} />
                </g>

                {/* Label */}
                <text
                  x={lm.x} y={lm.y + (isTreasure ? 26 : 21)}
                  textAnchor="middle" fontSize="6.5"
                  fill={isActive ? '#5C3D2E' : '#8B735570'}
                  fontFamily="Patrick Hand, serif" fontStyle="italic"
                  transform={`rotate(${index % 2 === 0 ? -2 : 2}, ${lm.x}, ${lm.y + 21})`}
                >
                  {sections[index]?.label}
                </text>
              </g>
            );
          })}

          {/* "Here be dragons" */}
          <text x="70" y="406" textAnchor="middle" fontSize="5.5" fill="#8B735535" fontFamily="serif" fontStyle="italic">
            Here be dragons
          </text>
        </svg>

        {/* Walking avatar */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `${8 + avatar.x * (155 / 140) - 22}px`,
            top: `${48 + avatar.y}px`,
          }}
          animate={shouldReduceMotion ? undefined : { rotate: ['-3deg', '3deg', '-3deg'] }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flag-wave whitespace-nowrap"
            style={{ background: '#E63946', color: 'white', fontSize: '6px', fontWeight: 'bold',
              padding: '1px 3px', borderRadius: '2px', fontFamily: 'Patrick Hand, serif' }}>
            {isJapanese ? 'ここ!' : 'HERE!'}
          </div>
          <Image src="/avatar/walking_pose.webp" alt="Walking" width={48} height={62} className="drop-shadow-lg" />
        </motion.div>
      </div>
    </div>
  );
}

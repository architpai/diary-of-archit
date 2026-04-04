'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';

interface Section {
  id: string;
  label: string;
  icon: string;
}

/* ── Landmark SVG icons — filled, ~24px rendered, with paper circle bg ── */

const LandmarkBg = ({ r = 14 }: { r?: number }) => (
  <circle cx="0" cy="0" r={r} fill="#F5E6C8" stroke="#8B7355" strokeWidth="1.2" />
);

const HouseIcon = () => (
  <g>
    <LandmarkBg />
    <path d="M-8 2 L0 -7 L8 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="-5" y="2" width="10" height="7" stroke="currentColor" strokeWidth="2" fill="#D4A37340" rx="0.5" />
    <rect x="-1.5" y="5" width="3" height="4" stroke="currentColor" strokeWidth="1.2" fill="#8B735560" />
  </g>
);

const ScrollIcon = () => (
  <g>
    <LandmarkBg />
    <rect x="-6" y="-7" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" fill="#D4A37330" />
    <line x1="-3" y1="-3" x2="3" y2="-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="-3" y1="0" x2="3" y2="0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="-3" y1="3" x2="1" y2="3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </g>
);

const BoltIcon = () => (
  <g>
    <LandmarkBg />
    <path d="M2 -8 L-3 1 L1 1 L-2 8 L5 -1 L1 -1 Z" stroke="currentColor" strokeWidth="2" fill="#F0C040" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const MagnifyIcon = () => (
  <g>
    <LandmarkBg />
    <circle cx="-1" cy="-2" r="5" stroke="currentColor" strokeWidth="2" fill="#D4A37320" />
    <line x1="2.5" y1="1.5" x2="7" y2="6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </g>
);

/* Straw Hat Jolly Roger - One Piece easter egg — BIGGER (r=18 bg) */
const StrawHatJollyRoger = () => (
  <g>
    <circle cx="0" cy="0" r="18" fill="#F5E6C8" stroke="#8B7355" strokeWidth="1.5" />
    {/* Crossbones behind skull */}
    <line x1="-10" y1="-8" x2="10" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="10" y1="-8" x2="-10" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Bone ends */}
    <circle cx="-10" cy="-8" r="1.8" fill="currentColor" />
    <circle cx="10" cy="-8" r="1.8" fill="currentColor" />
    <circle cx="-10" cy="8" r="1.8" fill="currentColor" />
    <circle cx="10" cy="8" r="1.8" fill="currentColor" />
    {/* Skull */}
    <circle cx="0" cy="-1" r="7" stroke="currentColor" strokeWidth="1.5" fill="#F5E6C8" />
    {/* Eyes - X shapes like Luffy's jolly roger */}
    <line x1="-4" y1="-4" x2="-1.5" y2="-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="-1.5" y1="-4" x2="-4" y2="-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="1.5" y1="-4" x2="4" y2="-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="4" y1="-4" x2="1.5" y2="-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Grinning mouth */}
    <path d="M-4.5 2.5 Q-2.5 5 0 5 Q2.5 5 4.5 2.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <line x1="-2" y1="3" x2="-2" y2="4.3" stroke="currentColor" strokeWidth="0.9" />
    <line x1="0" y1="3.5" x2="0" y2="5" stroke="currentColor" strokeWidth="0.9" />
    <line x1="2" y1="3" x2="2" y2="4.3" stroke="currentColor" strokeWidth="0.9" />
    {/* Straw hat brim */}
    <ellipse cx="0" cy="-7.5" rx="10" ry="2.8" stroke="currentColor" strokeWidth="1.5" fill="#F5E6C8" />
    {/* Hat dome */}
    <path d="M-6.5 -7.5 Q-6.5 -14 0 -14 Q6.5 -14 6.5 -7.5" stroke="currentColor" strokeWidth="1.5" fill="#F5E6C8" />
    {/* Red ribbon band */}
    <rect x="-7" y="-9.5" width="14" height="2.5" rx="0.6" fill="#E63946" stroke="#E63946" strokeWidth="0.3" />
  </g>
);

/* Compass Rose SVG */
const CompassRose = ({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) => (
  <motion.svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    className="mx-auto"
    animate={shouldReduceMotion ? undefined : { rotate: 360 }}
    transition={shouldReduceMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'linear' }}
  >
    <g transform="translate(15,15)">
      {/* Main points */}
      <polygon points="0,-11 2,-3 -2,-3" fill="#2D2D2D" /> {/* N */}
      <polygon points="0,11 2,3 -2,3" fill="#D4A373" />   {/* S */}
      <polygon points="11,0 3,2 3,-2" fill="#D4A373" />    {/* E */}
      <polygon points="-11,0 -3,2 -3,-2" fill="#D4A373" /> {/* W */}
      {/* Intermediate points */}
      <polygon points="7,-7 4,-1 1,-4" fill="#D4A37380" />
      <polygon points="7,7 4,1 1,4" fill="#D4A37380" />
      <polygon points="-7,7 -4,1 -1,4" fill="#D4A37380" />
      <polygon points="-7,-7 -4,-1 -1,-4" fill="#D4A37380" />
      {/* Center circle */}
      <circle cx="0" cy="0" r="2" fill="#E63946" />
      {/* Labels */}
      <text y="-11" fontSize="4" textAnchor="middle" fill="#2D2D2D" fontWeight="bold" dominantBaseline="auto">N</text>
      <text y="14" fontSize="3.5" textAnchor="middle" fill="#8B7355" dominantBaseline="auto">S</text>
      <text x="13" y="1" fontSize="3.5" textAnchor="start" fill="#8B7355" dominantBaseline="middle">E</text>
      <text x="-13" y="1" fontSize="3.5" textAnchor="end" fill="#8B7355" dominantBaseline="middle">W</text>
    </g>
  </motion.svg>
);

/* Scribble-circle highlight for active landmarks */
const ScribbleCircle = ({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={r}
    ry={r - 1}
    fill="none"
    stroke="#E63946"
    strokeWidth="1.4"
    strokeDasharray="3 2"
    opacity="0.7"
    transform={`rotate(-5, ${cx}, ${cy})`}
  />
);

/* Footprint marks along the path */
const Footprint = ({ x, y, rotation }: { x: number; y: number; rotation: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rotation})`}>
    <ellipse cx="-1" cy="0" rx="1" ry="1.8" fill="#8B735580" />
    <ellipse cx="1.5" cy="-1" rx="0.9" ry="1.6" fill="#8B735580" />
  </g>
);

/* Sparkle lines around treasure */
const SparkleLines = ({ cx, cy }: { cx: number; cy: number }) => (
  <g>
    <line x1={cx - 22} y1={cy - 14} x2={cx - 18} y2={cy - 10} stroke="#E6394690" strokeWidth="1.5" strokeLinecap="round" />
    <line x1={cx + 18} y1={cy - 10} x2={cx + 22} y2={cy - 14} stroke="#E6394690" strokeWidth="1.5" strokeLinecap="round" />
    <line x1={cx - 20} y1={cy + 8} x2={cx - 16} y2={cy + 5} stroke="#E6394690" strokeWidth="1.5" strokeLinecap="round" />
    <line x1={cx + 16} y1={cy + 5} x2={cx + 20} y2={cy + 8} stroke="#E6394690" strokeWidth="1.5" strokeLinecap="round" />
    <line x1={cx} y1={cy + 22} x2={cx} y2={cy + 18} stroke="#E6394690" strokeWidth="1.2" strokeLinecap="round" />
  </g>
);

/* Sea wave decorations for visual richness */
const SeaWave = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`} opacity="0.25">
    <path d="M-6 0 Q-4 -3 -2 0 Q0 3 2 0 Q4 -3 6 0" stroke="#5B8FA8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M-5 3 Q-3 0 -1 3 Q1 6 3 3 Q5 0 7 3" stroke="#5B8FA8" strokeWidth="0.8" fill="none" strokeLinecap="round" />
  </g>
);

/* ── Treasure map path waypoints (hand-drawn feel) ── */
// The path winds: top-center -> right -> down-left -> sharp right -> down to treasure
// Waypoints for each section (5 sections = 5 waypoints)
const waypoints = [
  { x: 55, y: 20 },   // 0: Hero - top center-right
  { x: 90, y: 85 },   // 1: Timeline - far right
  { x: 25, y: 155 },  // 2: Skills - far left
  { x: 95, y: 220 },  // 3: Sneak Peek - sharp right
  { x: 55, y: 300 },  // 4: Contact/Treasure - center bottom
];

// Cubic bezier control points for each segment (4 segments)
// Each segment: [cp1x, cp1y, cp2x, cp2y]
const segmentControls = [
  [80, 30, 100, 55],    // seg 0->1: sweep right
  [70, 100, 15, 120],   // seg 1->2: swing down-left
  [10, 185, 100, 190],  // seg 2->3: sharp right turn
  [100, 255, 70, 290],  // seg 3->4: curve down to treasure
];

export default function MapScrollNav() {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sections: Section[] = [
    { id: 'hero', label: t('nav.home'), icon: 'house' },
    { id: 'timeline', label: t('nav.journey'), icon: 'scroll' },
    { id: 'skills', label: t('nav.skills'), icon: 'bolt' },
    { id: 'sneakpeek', label: t('nav.peek'), icon: 'magnify' },
    { id: 'contact', label: t('nav.contact'), icon: 'treasure' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);

      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = scrollTop + window.innerHeight / 2;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
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
    const element = document.getElementById(sections[index].id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isSerious) {
    return (
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col gap-3">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${activeSection === index ? 'bg-gray-800 w-10' : 'bg-gray-300 hover:bg-gray-500'}
              `}
              title={section.label}
              aria-label={section.label}
            />
          ))}
        </div>
      </div>
    );
  }

  // Treasure map navigation
  const svgWidth = 120;
  const totalSvgHeight = 320;

  // Cubic bezier interpolation for a single segment
  const cubicBezier = (t: number, p0: number, cp1: number, cp2: number, p1: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return mt3 * p0 + 3 * mt2 * t * cp1 + 3 * mt * t2 * cp2 + t3 * p1;
  };

  const getPathPosition = (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const totalSections = sections.length - 1;
    const sectionProgress = clampedProgress * totalSections;
    const currentSection = Math.min(Math.floor(sectionProgress), totalSections - 1);
    const localT = sectionProgress - currentSection;

    const wp0 = waypoints[currentSection];
    const wp1 = waypoints[currentSection + 1];
    const ctrl = segmentControls[currentSection];

    const x = cubicBezier(localT, wp0.x, ctrl[0], ctrl[2], wp1.x);
    const y = cubicBezier(localT, wp0.y, ctrl[1], ctrl[3], wp1.y);

    return { x, y };
  };

  const avatarPos = getPathPosition(scrollProgress / 100);

  // Build the winding path string using cubic beziers
  const buildPath = () => {
    let path = `M ${waypoints[0].x} ${waypoints[0].y} `;
    for (let i = 0; i < segmentControls.length; i++) {
      const ctrl = segmentControls[i];
      const wp = waypoints[i + 1];
      path += `C ${ctrl[0]} ${ctrl[1]}, ${ctrl[2]} ${ctrl[3]}, ${wp.x} ${wp.y} `;
    }
    return path.trim();
  };

  const pathD = buildPath();

  // Generate footprint positions between each pair of landmarks
  const footprints: { x: number; y: number; rotation: number }[] = [];
  for (let seg = 0; seg < sections.length - 1; seg++) {
    for (const frac of [0.25, 0.5, 0.75]) {
      const progress = (seg + frac) / (sections.length - 1);
      const pos = getPathPosition(progress);
      const posBefore = getPathPosition(progress - 0.01);
      const angle = Math.atan2(pos.y - posBefore.y, pos.x - posBefore.x) * (180 / Math.PI);
      footprints.push({ x: pos.x, y: pos.y, rotation: angle + 90 });
    }
  }

  // Icon renderer
  const renderLandmarkIcon = (iconName: string) => {
    switch (iconName) {
      case 'house': return <HouseIcon />;
      case 'scroll': return <ScrollIcon />;
      case 'bolt': return <BoltIcon />;
      case 'magnify': return <MagnifyIcon />;
      case 'treasure': return <StrawHatJollyRoger />;
      default: return null;
    }
  };

  // Last section position for "X marks the spot"
  const lastWp = waypoints[waypoints.length - 1];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      {/* Treasure Map Container */}
      <div
        className="relative p-6 rounded-2xl wobbly-border"
        style={{
          width: '160px',
          backgroundColor: '#F5E6C8',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(139,115,85,0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 70%, rgba(139,115,85,0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(139,115,85,0.10) 0%, transparent 35%),
            radial-gradient(circle at 10% 80%, rgba(101,67,33,0.08) 0%, transparent 30%)
          `,
          boxShadow: `
            0 4px 20px rgba(0,0,0,0.15),
            inset 0 0 20px rgba(139,115,85,0.2),
            3px 0 8px -2px rgba(139,115,85,0.3),
            -3px 0 8px -2px rgba(139,115,85,0.3)
          `,
        }}
      >
        {/* Torn paper shadow on edges */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            boxShadow: `
              inset 2px 0 6px rgba(139,115,85,0.25),
              inset -2px 0 6px rgba(139,115,85,0.25),
              inset 0 2px 6px rgba(139,115,85,0.2),
              inset 0 -2px 6px rgba(139,115,85,0.2)
            `,
          }}
        />

        {/* Compass Rose */}
        <div className="mb-3">
          <CompassRose shouldReduceMotion={shouldReduceMotion} />
        </div>

        {/* Winding Path SVG */}
        <svg
          width={svgWidth}
          height={totalSvgHeight}
          viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
          className="relative mx-auto"
        >
          {/* Sea wave decorations in empty areas */}
          <SeaWave x={10} y={60} scale={0.9} />
          <SeaWave x={85} y={180} scale={0.7} />
          <SeaWave x={15} y={260} scale={0.8} />

          {/* Background path - old ink style, dashed trail */}
          <path
            d={pathD}
            stroke="#8B7355"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="6 3"
            opacity="0.4"
          />

          {/* Footprints along the path */}
          {footprints.map((fp, i) => (
            <Footprint key={`fp-${i}`} x={fp.x} y={fp.y} rotation={fp.rotation} />
          ))}

          {/* Progress path - red pen route */}
          <motion.path
            d={pathD}
            stroke="#E63946"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="6 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: scrollProgress / 100 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />

          {/* Bold "X marks the spot" behind the last landmark */}
          <g opacity="0.8">
            <line
              x1={lastWp.x - 16} y1={lastWp.y - 16}
              x2={lastWp.x + 16} y2={lastWp.y + 16}
              stroke="#E63946" strokeWidth="4" strokeLinecap="round"
            />
            <line
              x1={lastWp.x + 16} y1={lastWp.y - 16}
              x2={lastWp.x - 16} y2={lastWp.y + 16}
              stroke="#E63946" strokeWidth="4" strokeLinecap="round"
            />
          </g>

          {/* Sparkle lines around treasure */}
          <SparkleLines cx={lastWp.x} cy={lastWp.y} />

          {/* Section Landmarks */}
          {sections.map((section, index) => {
            const wp = waypoints[index];
            const isActive = activeSection === index;
            const isTreasure = section.icon === 'treasure';

            return (
              <g key={section.id}>
                {/* Clickable area */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r={isTreasure ? 22 : 18}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => scrollToSection(index)}
                />

                {/* Scribble-circle highlight for active */}
                {isActive && <ScribbleCircle cx={wp.x} cy={wp.y} r={isTreasure ? 22 : 18} />}

                {/* Landmark icon */}
                <motion.g
                  transform={`translate(${wp.x},${wp.y})`}
                  style={{ color: isActive ? '#2D2D2D' : '#8B7355' }}
                  className="pointer-events-none"
                  animate={
                    shouldReduceMotion || !isActive ? undefined : { scale: [1, 1.08, 1] }
                  }
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: 0.6, repeat: isActive ? Infinity : 0 }
                  }
                >
                  {renderLandmarkIcon(section.icon)}
                </motion.g>
              </g>
            );
          })}
        </svg>

        {/* Walking Avatar — 50x65, with step tilt animation */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `${20 + avatarPos.x * (128 / svgWidth) - 25}px`,
            top: `${56 + avatarPos.y - 10}px`,
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: [0, -4, 0],
                  rotate: ['-3deg', '3deg', '-3deg'],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* Speech bubble */}
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-1.5 py-0.5 text-[7px] font-bold text-ink/80 whitespace-nowrap shadow-sm border border-ink/10"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {isJapanese ? '\u3053\u3053!' : 'Here!'}
          </div>
          <Image
            src="/avatar/walking_pose.webp"
            alt="Walking character"
            width={50}
            height={65}
            className="drop-shadow-md"
          />
        </motion.div>
      </div>
    </div>
  );
}

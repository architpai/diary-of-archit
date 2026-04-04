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

/* ── Tiny hand-drawn SVG landmark icons (stroke-only, ~20x20) ── */

const HouseIcon = () => (
  <g>
    <path d="M-8 2 L0 -7 L8 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="-5" y="2" width="10" height="7" stroke="currentColor" strokeWidth="1.5" fill="none" rx="0.5" />
    <rect x="-1.5" y="5" width="3" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
  </g>
);

const ScrollIcon = () => (
  <g>
    <rect x="-6" y="-7" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="-3" y1="-3" x2="3" y2="-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="-3" y1="0" x2="3" y2="0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="-3" y1="3" x2="1" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </g>
);

const BoltIcon = () => (
  <g>
    <path d="M2 -8 L-3 1 L1 1 L-2 8 L5 -1 L1 -1 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const MagnifyIcon = () => (
  <g>
    <circle cx="-1" cy="-2" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="2.5" y1="1.5" x2="7" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </g>
);

/* Straw Hat Jolly Roger - One Piece easter egg */
const StrawHatJollyRoger = () => (
  <g>
    {/* Crossbones behind skull */}
    <line x1="-8" y1="-6" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="-6" x2="-8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Bone ends */}
    <circle cx="-8" cy="-6" r="1.2" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="8" cy="-6" r="1.2" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="-8" cy="6" r="1.2" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="8" cy="6" r="1.2" stroke="currentColor" strokeWidth="0.8" fill="none" />
    {/* Skull */}
    <circle cx="0" cy="-1" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="#F5E6C8" />
    {/* Eyes - X shapes like Luffy's jolly roger */}
    <line x1="-3" y1="-3" x2="-1" y2="-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="-1" y1="-3" x2="-3" y2="-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="1" y1="-3" x2="3" y2="-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="3" y1="-3" x2="1" y2="-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    {/* Grinning mouth */}
    <path d="M-3.5 2 Q-2 4 0 4 Q2 4 3.5 2" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
    <line x1="-1.5" y1="2.5" x2="-1.5" y2="3.5" stroke="currentColor" strokeWidth="0.7" />
    <line x1="0" y1="2.8" x2="0" y2="4" stroke="currentColor" strokeWidth="0.7" />
    <line x1="1.5" y1="2.5" x2="1.5" y2="3.5" stroke="currentColor" strokeWidth="0.7" />
    {/* Straw hat brim */}
    <ellipse cx="0" cy="-6" rx="8" ry="2" stroke="currentColor" strokeWidth="1.2" fill="#F5E6C8" />
    {/* Hat dome */}
    <path d="M-5 -6 Q-5 -11 0 -11 Q5 -11 5 -6" stroke="currentColor" strokeWidth="1.2" fill="#F5E6C8" />
    {/* Red ribbon band */}
    <rect x="-5.5" y="-7.5" width="11" height="2" rx="0.5" fill="#E63946" stroke="#E63946" strokeWidth="0.3" />
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
const ScribbleCircle = ({ cx, cy }: { cx: number; cy: number }) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx="13"
    ry="12"
    fill="none"
    stroke="#E63946"
    strokeWidth="1.2"
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
    <line x1={cx - 16} y1={cy - 10} x2={cx - 13} y2={cy - 7} stroke="#E6394680" strokeWidth="1" strokeLinecap="round" />
    <line x1={cx + 13} y1={cy - 7} x2={cx + 16} y2={cy - 10} stroke="#E6394680" strokeWidth="1" strokeLinecap="round" />
    <line x1={cx - 15} y1={cy + 5} x2={cx - 12} y2={cy + 3} stroke="#E6394680" strokeWidth="1" strokeLinecap="round" />
    <line x1={cx + 12} y1={cy + 3} x2={cx + 15} y2={cy + 5} stroke="#E6394680" strokeWidth="1" strokeLinecap="round" />
  </g>
);

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
  const pathHeight = 280;
  const topPadding = 20;
  const bottomPadding = 20;
  const totalSvgHeight = pathHeight + topPadding + bottomPadding;

  const getPathPosition = (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const totalSections = sections.length - 1;
    const sectionProgress = clampedProgress * totalSections;
    const currentSection = Math.min(Math.floor(sectionProgress), sections.length - 2);
    const localProgress = sectionProgress - currentSection;

    const startY = topPadding + (currentSection / (sections.length - 1)) * pathHeight;
    const startX = currentSection % 2 === 0 ? 40 : 60;
    const endY = topPadding + ((currentSection + 1) / (sections.length - 1)) * pathHeight;
    const endX = (currentSection + 1) % 2 === 0 ? 40 : 60;
    const controlX = currentSection % 2 === 0 ? 80 : 20;
    const controlY = (startY + endY) / 2;

    const t = localProgress;
    const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
    const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;

    return { x, y };
  };

  const avatarPos = getPathPosition(scrollProgress / 100);

  // Build the winding path string (reused for bg and progress)
  const buildPath = () => {
    let path = '';
    for (let i = 0; i < sections.length - 1; i++) {
      const y = topPadding + (i / (sections.length - 1)) * pathHeight;
      const x = i % 2 === 0 ? 40 : 60;
      const nextY = topPadding + ((i + 1) / (sections.length - 1)) * pathHeight;
      const nextX = (i + 1) % 2 === 0 ? 40 : 60;
      const controlX = i % 2 === 0 ? 80 : 20;
      const controlY = (y + nextY) / 2;
      if (i === 0) path += `M ${x} ${y} `;
      path += `Q ${controlX} ${controlY} ${nextX} ${nextY} `;
    }
    return path.trim();
  };

  const pathD = buildPath();

  // Generate footprint positions between each pair of landmarks
  const footprints: { x: number; y: number; rotation: number }[] = [];
  for (let seg = 0; seg < sections.length - 1; seg++) {
    for (const frac of [0.3, 0.5, 0.7]) {
      const progress = (seg + frac) / (sections.length - 1);
      const pos = getPathPosition(progress);
      // Approximate tangent direction for rotation
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
  const lastIdx = sections.length - 1;
  const lastY = topPadding + (lastIdx / (sections.length - 1)) * pathHeight;
  const lastX = lastIdx % 2 === 0 ? 40 : 60;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      {/* Treasure Map Container */}
      <div
        className="relative p-6 rounded-2xl wobbly-border shadow-lg"
        style={{
          width: '140px',
          backgroundColor: '#F5E6C8',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(139,115,85,0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 70%, rgba(139,115,85,0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(139,115,85,0.05) 0%, transparent 35%)
          `,
        }}
      >
        {/* Torn paper edge effect via CSS mask */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            boxShadow: 'inset 0 0 15px rgba(139,115,85,0.15)',
          }}
        />

        {/* Compass Rose */}
        <div className="mb-3">
          <CompassRose shouldReduceMotion={shouldReduceMotion} />
        </div>

        {/* Winding Path SVG */}
        <svg
          width="100"
          height={totalSvgHeight}
          viewBox={`0 0 100 ${totalSvgHeight}`}
          className="relative mx-auto"
        >
          {/* Background path - old ink style */}
          <path
            d={pathD}
            stroke="#8B7355"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 4"
            opacity="0.35"
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
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: scrollProgress / 100 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />

          {/* "X marks the spot" behind the last landmark */}
          <g opacity="0.6">
            <line
              x1={lastX - 10} y1={lastY - 10}
              x2={lastX + 10} y2={lastY + 10}
              stroke="#E63946" strokeWidth="2.5" strokeLinecap="round"
            />
            <line
              x1={lastX + 10} y1={lastY - 10}
              x2={lastX - 10} y2={lastY + 10}
              stroke="#E63946" strokeWidth="2.5" strokeLinecap="round"
            />
          </g>

          {/* Sparkle lines around treasure */}
          <SparkleLines cx={lastX} cy={lastY} />

          {/* Section Landmarks */}
          {sections.map((section, index) => {
            const yPos = topPadding + (index / (sections.length - 1)) * pathHeight;
            const xPos = index % 2 === 0 ? 40 : 60;
            const isActive = activeSection === index;

            return (
              <g key={section.id}>
                {/* Clickable area */}
                <circle
                  cx={xPos}
                  cy={yPos}
                  r={15}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => scrollToSection(index)}
                />

                {/* Scribble-circle highlight for active */}
                {isActive && <ScribbleCircle cx={xPos} cy={yPos} />}

                {/* Landmark icon */}
                <motion.g
                  transform={`translate(${xPos},${yPos})`}
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

        {/* Walking Avatar */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `${20 + avatarPos.x - 17}px`,
            top: `${56 + avatarPos.y}px`,
          }}
          animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={
            shouldReduceMotion ? undefined : { duration: 1, repeat: Infinity, ease: 'easeInOut' }
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
            width={35}
            height={45}
            className="drop-shadow-md"
          />
        </motion.div>
      </div>
    </div>
  );
}

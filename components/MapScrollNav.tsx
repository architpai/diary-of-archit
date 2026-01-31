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

export default function MapScrollNav() {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sections: Section[] = [
    { id: 'hero', label: t('nav.home'), icon: '🏠' },
    { id: 'timeline', label: t('nav.journey'), icon: '🗺️' },
    { id: 'skills', label: t('nav.skills'), icon: '⚡' },
    { id: 'sneakpeek', label: t('nav.peek'), icon: '👀' },
    { id: 'contact', label: t('nav.contact'), icon: '📬' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Calculate total scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);

      // Determine active section
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

    handleScroll(); // Initial check
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
    // Minimal stepper for serious mode
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

  // Fun map-based navigation for diary mode
  const pathHeight = 280; // Height for the actual path
  const topPadding = 20;  // Padding at top for first checkpoint
  const bottomPadding = 20; // Padding at bottom for last checkpoint
  const totalSvgHeight = pathHeight + topPadding + bottomPadding;
  
  // Calculate position along the curved path - uses same formula as SVG path
  const getPathPosition = (progress: number) => {
    // Clamp progress to 0-1 to prevent avatar from going beyond bounds
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const totalSections = sections.length - 1;
    const sectionProgress = clampedProgress * totalSections;
    const currentSection = Math.min(Math.floor(sectionProgress), sections.length - 2);
    const localProgress = sectionProgress - currentSection;
    
    // Get the current segment's start, end, and control points (same as SVG path)
    const startY = topPadding + (currentSection / (sections.length - 1)) * pathHeight;
    const startX = currentSection % 2 === 0 ? 40 : 60;
    const endY = topPadding + ((currentSection + 1) / (sections.length - 1)) * pathHeight;
    const endX = (currentSection + 1) % 2 === 0 ? 40 : 60;
    const controlX = currentSection % 2 === 0 ? 80 : 20;
    const controlY = (startY + endY) / 2;
    
    // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const t = localProgress;
    const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
    const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
    
    return { x, y };
  };

  const avatarPos = getPathPosition(scrollProgress / 100);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        {/* Map Container - wider for better visibility */}
        <div className="relative bg-paper/95 p-6 rounded-2xl wobbly-border shadow-lg" style={{ width: '140px' }}>
          {/* Treasure Map Title */}
          <div className="text-center mb-3">
            <span 
              className="handwritten text-sm text-ink/70"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              {t('nav.map_title')}
            </span>
          </div>

          {/* Winding Path SVG */}
          <svg
            width="100"
            height={totalSvgHeight}
            viewBox={`0 0 100 ${totalSvgHeight}`}
            className="relative mx-auto"
          >
            {/* Background path (faded) */}
            <path
              d={(() => {
                let path = '';
                for (let i = 0; i < sections.length - 1; i++) {
                  const y = topPadding + (i / (sections.length - 1)) * pathHeight;
                  const x = i % 2 === 0 ? 40 : 60;
                  const nextY = topPadding + ((i + 1) / (sections.length - 1)) * pathHeight;
                  const nextX = (i + 1) % 2 === 0 ? 40 : 60;
                  const controlX = i % 2 === 0 ? 80 : 20;
                  const controlY = (y + nextY) / 2;
                  
                  if (i === 0) {
                    path += `M ${x} ${y} `;
                  }
                  path += `Q ${controlX} ${controlY} ${nextX} ${nextY} `;
                }
                return path.trim();
              })()}
              stroke="#D4A373"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="10 5"
              opacity="0.3"
            />
            
            {/* Progress path (animated) */}
          <motion.path
            d={(() => {
                let path = '';
                for (let i = 0; i < sections.length - 1; i++) {
                  const y = topPadding + (i / (sections.length - 1)) * pathHeight;
                  const x = i % 2 === 0 ? 40 : 60;
                  const nextY = topPadding + ((i + 1) / (sections.length - 1)) * pathHeight;
                  const nextX = (i + 1) % 2 === 0 ? 40 : 60;
                  const controlX = i % 2 === 0 ? 80 : 20;
                  const controlY = (y + nextY) / 2;
                  
                  if (i === 0) {
                    path += `M ${x} ${y} `;
                  }
                  path += `Q ${controlX} ${controlY} ${nextX} ${nextY} `;
                }
                return path.trim();
              })()}
              stroke="#E63946"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="10 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: scrollProgress / 100 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />

            {/* Section Landmarks - clickable map pins */}
            {sections.map((section, index) => {
              const yPos = topPadding + (index / (sections.length - 1)) * pathHeight;
              const xPos = index % 2 === 0 ? 40 : 60;
              const isActive = activeSection === index;

              return (
                <g key={section.id}>
                  {/* Clickable area (larger for easier clicking) */}
                  <circle
                    cx={xPos}
                    cy={yPos}
                    r={15}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => scrollToSection(index)}
                  />
                  
                  {/* Map Pin */}
                <motion.circle
                  cx={xPos}
                  cy={yPos}
                  r={isActive ? 10 : 8}
                  fill={isActive ? '#FFCC33' : '#fff'}
                  stroke="#2D2D2D"
                  strokeWidth="2"
                  className="cursor-pointer pointer-events-none"
                  animate={
                    shouldReduceMotion || !isActive ? undefined : { scale: [1, 1.1, 1] }
                  }
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: 0.5, repeat: isActive ? Infinity : 0 }
                  }
                />
                  
                  {/* Icon */}
                  <text
                    x={xPos}
                    y={yPos + 1}
                    fontSize="9"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                  >
                    {section.icon}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Walking Avatar - follows curve with offset */}
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

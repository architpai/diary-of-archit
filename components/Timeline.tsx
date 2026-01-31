'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import BlobDivider from './BlobDivider';
import FloatingDoodles from './FloatingDoodles';

// Map doodle types to avatar poses
const doodlePoses: Record<string, string> = {
  celebration: '/avatar/victory_pose.webp',
  coding: '/avatar/coding_pose.webp',
  newbie: '/avatar/waving_pose.webp',
};

interface Experience {
  id: string;
  date: string;
  professionalTitle: string;
  company: string;
  diaryNarrative: string;
  resumeBulletPoints: string[];
  isResumeWorthy: boolean;
  doodleType: string;
}

// ExperienceCard component - extracted to avoid hooks issues
interface ExperienceCardProps {
  exp: Experience;
  index: number;
  isExpanded: boolean;
  onInView: () => void;
}

function ExperienceCard({ exp, index, isExpanded, onInView }: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { margin: "0px 0px -20% 0px", once: true });

  useEffect(() => {
    if (isInView) {
      onInView();
    }
  }, [isInView, onInView]);

  return (
    <motion.div
      ref={cardRef}
      className={`flex flex-col md:flex-row items-center gap-8 ${
        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Map Pin Landmark */}
      <motion.div
        className="relative flex-shrink-0"
        whileHover={{ scale: 1.1, rotate: 10 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Pin shadow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl" />
    
        {/* Pin with avatar */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center scale-75">
            <Image
              src={doodlePoses[exp.doodleType] || doodlePoses.coding}
              alt={`${exp.doodleType} doodle`}
              width={80}
              height={104}
              className="object-contain"
            />
          </div>
        </div>
    
        {/* Pin pointer */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-yellow-600" />
    
        {/* Year badge */}
        <motion.div 
          className="absolute -top-2 -right-2 bg-margin-blue text-white px-3 py-1 rounded-full shadow-lg"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="handwritten text-sm font-bold">{exp.date}</span>
        </motion.div>
      </motion.div>

      {/* Experience Card */}
      <motion.div
        className="flex-1 max-w-xl"
        whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="relative p-6 wobbly-border bg-paper/95 tape-corner shadow-xl">
          {/* Header */}
          <div className="mb-4">
            <h3 className="handwritten text-xl md:text-2xl font-bold text-ink">
              {exp.professionalTitle}
            </h3>
            <p className="handwritten text-gray-600">@ {exp.company}</p>
          </div>

          {/* Diary Narrative */}
          <motion.p
            className="diary-narrative handwritten text-lg text-ink mb-4 italic bg-yellow-100/50 p-3 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            &ldquo;{exp.diaryNarrative}&rdquo;
          </motion.p>

          {/* Resume Bullet Points (auto-expand with letter opening animation) */}
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: isExpanded ? 1 : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.4, 0.0, 0.2, 1],
              }}
              style={{
                transformOrigin: 'top',
              }}
            >
              <div className="pt-3 border-t border-ink/10">
                <ul className="list-disc list-inside space-y-1 handwritten text-sm text-ink/70">
                  {exp.resumeBulletPoints.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Timeline() {
  const { isSerious } = useSeriousMode();
  const { content, t, isJapanese } = useTranslation();
  const experiences = content.experiences as Experience[];
  const [openedExperiences, setOpenedExperiences] = useState<Set<number>>(new Set());

  const handleCardInView = useCallback((index: number) => {
    setOpenedExperiences(prev => {
      if (prev.has(index)) return prev; // Don't create new Set if already has this index
      return new Set(prev).add(index);
    });
  }, []);

  return (
    <section className={`py-20 relative ${!isSerious ? 'section-blue' : ''}`}>
      {/* Top Wave Divider */}
      {!isSerious && (
        <BlobDivider position="top" fillColor="var(--paper)" variant={1} />
      )}
      
      {/* Floating Background Doodles */}
      {!isSerious && <FloatingDoodles variant="tech" density="sparse" />}
      
      <motion.h2
        className={`diary-title text-3xl md:text-4xl text-center mb-16 pt-16 ${!isSerious ? 'text-white drop-shadow-lg' : 'text-ink'}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
      >
        {!isSerious ? t('timeline.title_diary') : t('timeline.title_serious')}
      </motion.h2>

      <div className="relative max-w-5xl mx-auto px-4">
        {isSerious ? (
          // Clean vertical timeline for serious mode
          <div className="timeline max-w-4xl">
            <div className="timeline-line bg-gray-300" />
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="relative mb-16"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div
                  className="timeline-dot bg-gray-600 border-white"
                  style={{ top: '20px' }}
                />
                <div className="ml-8 p-6 bg-white border border-gray-200 rounded">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-lg font-bold font-sans">{exp.date}</span>
                      <h3 className="text-xl md:text-2xl font-bold text-ink font-sans">
                        {exp.professionalTitle}
                      </h3>
                      <p className="text-gray-600 font-sans text-sm">
                        @ {exp.company}
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 font-sans text-sm text-gray-800">
                    {exp.resumeBulletPoints.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Fun winding map path for diary mode
          <div className="relative">
            {/* Winding Path SVG */}
            <svg
              className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none hidden md:block"
              width="200"
              height={`${experiences.length * 650 + 100}`}
              viewBox={`0 0 200 ${experiences.length * 650 + 100}`}
              style={{ zIndex: 0 }}
            >
              {/* Background path - using cubic Bezier for smooth curves */}
              <path
                d={(() => {
                  const pathParts: string[] = [];
                  const spacing = 650;
                  for (let i = 0; i < experiences.length; i++) {
                    const y = i * spacing + 150;
                    const x = i % 2 === 0 ? 50 : 150;
                    const nextY = (i + 1) * spacing + 150;
                    const nextX = (i + 1) % 2 === 0 ? 50 : 150;
                    
                    // Use quadratic Bezier for curved joins at each checkpoint
                    // Control point at midpoint horizontally to create smooth S-curve
                    const midY = (y + nextY) / 2;
                    const controlX = 100; // Center of path for smooth curve through midpoint
                    
                    if (i === 0) {
                      pathParts.push(`M ${x} ${y}`);
                    }
                    if (i < experiences.length - 1) {
                      // S-curve: first curve from current to center, then center to next
                      const firstControlX = i % 2 === 0 ? 100 : 100;
                      const firstControlY = y + spacing * 0.25;
                      const midX = 100;
                      const secondControlY = nextY - spacing * 0.25;
                      pathParts.push(`C ${x} ${firstControlY} ${midX} ${midY - 50} ${midX} ${midY}`);
                      pathParts.push(`C ${midX} ${midY + 50} ${nextX} ${secondControlY} ${nextX} ${nextY}`);
                    }
                  }
                  return pathParts.join(' ');
                })()}
                stroke="#D4A373"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="15 10"
                opacity="0.4"
              />

              {/* Animated progress path - using cubic Bezier for smooth curves */}
              <motion.path
                d={(() => {
                  const pathParts: string[] = [];
                  const spacing = 650;
                  for (let i = 0; i < experiences.length; i++) {
                    const y = i * spacing + 150;
                    const x = i % 2 === 0 ? 50 : 150;
                    const nextY = (i + 1) * spacing + 150;
                    const nextX = (i + 1) % 2 === 0 ? 50 : 150;
                    
                    // Use quadratic Bezier for curved joins at each checkpoint
                    const midY = (y + nextY) / 2;
                    
                    if (i === 0) {
                      pathParts.push(`M ${x} ${y}`);
                    }
                    if (i < experiences.length - 1) {
                      // S-curve: first curve from current to center, then center to next
                      const firstControlY = y + spacing * 0.25;
                      const midX = 100;
                      const secondControlY = nextY - spacing * 0.25;
                      pathParts.push(`C ${x} ${firstControlY} ${midX} ${midY - 50} ${midX} ${midY}`);
                      pathParts.push(`C ${midX} ${midY + 50} ${nextX} ${secondControlY} ${nextX} ${nextY}`);
                    }
                  }
                  return pathParts.join(' ');
                })()}
                stroke="#FFCC33"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="15 10"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>

            {/* Experience Cards */}
            <div className="relative z-10 space-y-32">
              {experiences.map((exp, index) => (
                <ExperienceCard
                  key={exp.id}
                  exp={exp}
                  index={index}
                  isExpanded={openedExperiences.has(index)}
                  onInView={() => handleCardInView(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Wave Divider */}
      {!isSerious && (
        <BlobDivider position="bottom" fillColor="var(--paper)" variant={2} />
      )}
    </section>
  );
}


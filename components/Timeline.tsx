'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import { EXPERIENCE_PIN, experienceColor } from './hero3d/mapData';

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
function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, isJapanese } = useTranslation();
  const toggleExpanded = () => setIsExpanded((current) => !current);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  const pinColor = experienceColor(exp.id);

  return (
      <motion.div
        id={exp.id}
        data-map-waypoint={EXPERIENCE_PIN[exp.id]}
        data-waypoint-side={index % 2 === 0 ? 'right' : 'left'}
        className={`flex flex-col items-center md:flex-row pointer-events-auto ${
          index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
        }`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
        whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
      >
      {/* Experience Card — narrow and docked to the edge so the map
          (and the marker we just flew to) stays visible beside it */}
      <motion.div
        className="w-full md:w-[26rem] lg:w-[30rem] flex-none"
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
        transition={shouldReduceMotion ? undefined : { type: "spring", stiffness: 300 }}
      >
        <div
          className="relative cursor-pointer overflow-hidden rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
          style={{ perspective: '1200px' }}
          onClick={toggleExpanded}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`${exp.professionalTitle} at ${exp.company}`}
        >
          {/* ── TOP HALF — always visible (diary side) ── */}
          <div className="relative p-6 wobbly-border bg-paper/95 tape-corner shadow-xl">
            {/* Header — avatar pose + year tucked into the corner */}
            <div className="mb-4 relative pr-20">
              <div className="absolute top-0 right-0 flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-full border-[3px] bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex items-center justify-center"
                  style={{ borderColor: pinColor }}
                >
                  <Image
                    src={doodlePoses[exp.doodleType] || doodlePoses.coding}
                    alt={`${exp.doodleType} doodle`}
                    width={44}
                    height={57}
                    className="object-contain mt-2"
                  />
                </div>
                <span
                  className="handwritten text-xs font-bold text-white px-2 py-0.5 rounded-full -mt-2 shadow"
                  style={{ backgroundColor: pinColor }}
                >
                  {exp.date}
                </span>
              </div>
              <h3
                className="handwritten text-xl md:text-2xl font-bold text-ink"
                style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
              >
                {exp.professionalTitle}
              </h3>
              <p
                className="handwritten font-bold"
                style={{
                  color: pinColor,
                  ...(isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}),
                }}
              >
                @ {exp.company}
              </p>
              <span
                className="map-coords mt-2"
                style={{
                  color: pinColor,
                  borderColor: `${pinColor}77`,
                  ...(isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}),
                }}
              >
                📍 {t(`timeline.loc_${exp.id}`)}
              </span>
            </div>

            {/* Diary Narrative */}
            <motion.p
              className="diary-narrative handwritten text-lg text-ink italic bg-yellow-100/50 p-3 rounded-lg"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }}
            >
              &ldquo;{exp.diaryNarrative}&rdquo;
            </motion.p>

            {/* Tap to unfold hint */}
            {!isExpanded && (
              <span className="block mt-3 text-xs text-ink/40 handwritten text-center"
                style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
              >
                {isJapanese ? '開く' : <><span className="md:hidden">tap</span><span className="hidden md:inline">click</span> to unfold</>}
              </span>
            )}
          </div>

          {/* ── BOTTOM HALF — unfolds to reveal resume bullets ── */}
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? 'auto' : 0,
              rotateX: isExpanded ? 0 : -90,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }
            }
            style={{
              transformOrigin: 'top center',
              overflow: 'hidden',
            }}
          >
            <div
              className="p-6 pt-5 wobbly-border shadow-lg"
              style={{
                background: 'linear-gradient(to bottom, #F0E8D8 0%, var(--paper) 8%)',
                marginTop: '-2px',
                borderTop: '1px dashed rgba(0,0,0,0.1)',
              }}
            >
              <ul className="list-disc list-inside space-y-2 handwritten text-sm text-ink/70">
                {exp.resumeBulletPoints.map((point: string, i: number) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Timeline() {
  const { isSerious } = useSeriousMode();
  const { content, t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const experiences = content.experiences as Experience[];

  return (
    <section className="py-20 relative">
      {!isSerious ? (
        <motion.div
          className="text-center mb-24 px-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="map-cartouche inline-block px-8 py-4 pointer-events-auto">
            <h2
              className="diary-title text-3xl md:text-4xl text-ink"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              {t('timeline.title_diary')}
            </h2>
            <p
              className="handwritten text-ink/50 text-sm mt-1"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              {t('timeline.map_hint')}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.h2
          className="diary-title text-3xl md:text-4xl text-center mb-10 pt-16 text-ink"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
        >
          {t('timeline.title_serious')}
        </motion.h2>
      )}

      <div className="relative max-w-7xl mx-auto px-4 md:px-10">
        {isSerious ? (
          // Clean vertical timeline for serious mode
          <div className="timeline max-w-4xl">
            <div className="timeline-line bg-gray-300" />
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="relative mb-16"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.2 }}
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
          // Journey waypoints — big gaps between cards let the map (and the
          // camera flight) show through.
          <div className="relative">
            {experiences.map((exp, index) => (
              <div key={exp.id}>
                {index > 0 && (
                  <div
                    className="route-leg py-16 md:py-28 text-base md:text-lg"
                    style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
                  >
                    {t(`timeline.leg_${index}`)}
                  </div>
                )}
                <ExperienceCard exp={exp} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

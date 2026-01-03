'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';
import BlobDivider from './BlobDivider';
import FloatingDoodles from './FloatingDoodles';

// Map doodle types to avatar poses
const doodlePoses: Record<string, string> = {
  celebration: '/avatar/victory_pose.png',
  coding: '/avatar/coding_pose.png',
  newbie: '/avatar/thinking_pose.png',
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

export default function Timeline() {
  const { isSerious } = useSeriousMode();
  const experiences = content.experiences as Experience[];

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
      >
        {!isSerious ? '📅 The Journey So Far...' : 'Professional Experience'}
      </motion.h2>

      <div className="timeline relative max-w-4xl mx-auto px-4">
        {/* Timeline Line */}
        <div className={`timeline-line ${!isSerious ? 'bg-white/30' : ''}`} style={!isSerious ? { backgroundColor: 'rgba(255,255,255,0.3)' } : {}} />

        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            className="relative mb-16"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            {/* Timeline Dot */}
            <div
              className={`timeline-dot ${!isSerious ? 'bg-yellow-400 border-white' : ''}`}
              style={{ top: '20px', ...(isSerious ? {} : { backgroundColor: '#FFCC33', borderColor: 'white' }) }}
            />

            {/* Content Card */}
            <motion.div 
              className={`
                ml-8 p-6 relative
                ${isSerious ? 'bg-white border border-gray-200 rounded' : 'wobbly-border bg-paper/95 tape-corner'}
              `}
              whileHover={!isSerious ? { scale: 1.02, rotate: 0.5 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <span className={`
                    text-lg font-bold 
                    ${isSerious ? 'font-sans' : 'handwritten text-margin-blue'}
                  `}>
                    {exp.date}
                  </span>
                  <h3 className={`
                    text-xl md:text-2xl font-bold text-ink
                    ${isSerious ? 'font-sans' : 'handwritten'}
                  `}>
                    {exp.professionalTitle}
                  </h3>
                  <p className={`text-gray-600 ${isSerious ? 'font-sans text-sm' : 'handwritten'}`}>
                    @ {exp.company}
                  </p>
                </div>

                {/* PNG Avatar Doodle - hidden in serious mode, larger size */}
                {!isSerious && (
                  <motion.div
                    className="doodle-animate"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Image
                      src={doodlePoses[exp.doodleType] || doodlePoses.coding}
                      alt={`${exp.doodleType} doodle`}
                      width={120}
                      height={155}
                      className="object-contain drop-shadow-md"
                    />
                  </motion.div>
                )}
              </div>

              {/* Diary Narrative - hidden in serious mode */}
              {!isSerious && (
                <motion.p
                  className="diary-narrative handwritten text-lg text-ink mb-4 italic bg-yellow-100/50 p-3 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  &ldquo;{exp.diaryNarrative}&rdquo;
                </motion.p>
              )}

              {/* Resume Bullet Points - shown in serious mode or as subtle in fun mode */}
              <ul className={`
                list-disc list-inside space-y-1
                ${isSerious 
                  ? 'font-sans text-sm text-gray-800' 
                  : 'handwritten text-base text-ink/70'
                }
              `}>
                {exp.resumeBulletPoints.map((point: string, i: number) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Wave Divider */}
      {!isSerious && (
        <BlobDivider position="bottom" fillColor="var(--paper)" variant={2} />
      )}
    </section>
  );
}


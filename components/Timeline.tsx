'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';

// Doodle SVGs for different milestone types
const doodles: Record<string, React.ReactElement> = {
  celebration: (
    <svg viewBox="0 0 60 60" className="w-16 h-16">
      <motion.path
        d="M30 10 L30 5 M30 55 L30 50 M10 30 L5 30 M55 30 L50 30"
        stroke="#E63946"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.circle
        cx="30"
        cy="30"
        r="15"
        fill="#FFD700"
        stroke="#2D2D2D"
        strokeWidth="2"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      <text x="30" y="36" textAnchor="middle" fontSize="16">🎉</text>
    </svg>
  ),
  coding: (
    <svg viewBox="0 0 60 60" className="w-16 h-16">
      <rect x="10" y="15" width="40" height="30" rx="3" fill="#E8E8E8" stroke="#2D2D2D" strokeWidth="2" />
      <rect x="15" y="20" width="30" height="20" fill="#1a1a1a" />
      <motion.text
        x="20"
        y="33"
        fill="#00ff00"
        fontSize="8"
        fontFamily="monospace"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        {'</>'}
      </motion.text>
      <motion.rect
        x="35"
        y="28"
        width="6"
        height="10"
        fill="#00ff00"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </svg>
  ),
  newbie: (
    <svg viewBox="0 0 60 60" className="w-16 h-16">
      <motion.circle
        cx="30"
        cy="25"
        r="12"
        fill="#FFE4B5"
        stroke="#2D2D2D"
        strokeWidth="2"
      />
      <circle cx="26" cy="23" r="2" fill="#2D2D2D" />
      <circle cx="34" cy="23" r="2" fill="#2D2D2D" />
      <motion.path
        d="M 25 30 Q 30 35, 35 30"
        stroke="#2D2D2D"
        strokeWidth="1.5"
        fill="none"
        animate={{ d: ["M 25 30 Q 30 35, 35 30", "M 25 28 Q 30 32, 35 28", "M 25 30 Q 30 35, 35 30"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.text
        x="30"
        y="50"
        textAnchor="middle"
        fontSize="10"
        animate={{ y: [50, 48, 50] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🌱
      </motion.text>
    </svg>
  ),
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
    <section className="py-20 relative">
      <motion.h2
        className="diary-title text-3xl md:text-4xl text-center mb-16 text-ink"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        The Journey So Far...
      </motion.h2>

      <div className="timeline relative max-w-4xl mx-auto px-4">
        {/* Timeline Line */}
        <div className="timeline-line" />

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
              className="timeline-dot"
              style={{ top: '20px' }}
            />

            {/* Content Card */}
            <div className={`
              ml-8 p-6 
              ${isSerious ? 'bg-white border border-gray-200 rounded' : 'wobbly-border bg-paper/80'}
            `}>
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

                {/* Doodle - hidden in serious mode */}
                {!isSerious && (
                  <motion.div
                    className="doodle-animate"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {doodles[exp.doodleType] || doodles.coding}
                  </motion.div>
                )}
              </div>

              {/* Diary Narrative - hidden in serious mode */}
              {!isSerious && (
                <motion.p
                  className="diary-narrative handwritten text-lg text-ink mb-4 italic"
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
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

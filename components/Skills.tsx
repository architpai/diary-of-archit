'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import StickerStars, { levelToStars } from './StickerStars';
import { LegendSymbol } from './icons/LegendSymbols';

interface Skill {
  name: string;
  level: number;
  category: string;
}

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
  cloud: '#5A6B8D',      // Desaturated Blue
  database: '#5C7C5C',   // Desaturated Green
  mapping: '#A65D57',    // Desaturated Red
  frontend: '#7D6B8D',   // Desaturated Purple
  backend: '#B88B4A',    // Desaturated Orange
  domain: '#4A6B6B',     // Desaturated Teal
  graphics: '#A67C52',   // Desaturated Brown
  architecture: '#6B6B6B', // Desaturated Gray
  devops: '#578D82',     // Desaturated Mint
};

export default function Skills() {
  const { isSerious } = useSeriousMode();
  const { content, t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const skills = content.skills as Skill[];

  return (
    <section className="py-20 relative">
      {!isSerious ? (
        <motion.div
          className="text-center mb-16 px-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="map-cartouche inline-block px-8 py-4 pointer-events-auto">
            <h2
              className="diary-title text-3xl md:text-4xl text-ink"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              {t('skills.title_diary')}
            </h2>
            <p
              className="handwritten text-ink/50 text-sm mt-1 tracking-widest uppercase"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              {t('skills.legend_sub')}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.h2
          className="text-3xl md:text-4xl text-center mb-16 pt-16 font-sans font-bold text-ink"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('skills.title_serious')}
        </motion.h2>
      )}

      <div className="max-w-5xl mx-auto px-4 relative z-20">
        {isSerious ? (
          // Organized skills by category for serious mode
          <div className="max-w-4xl mx-auto">
            {Object.entries(
              skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, typeof skills>)
            ).map(([category, categorySkills], categoryIndex) => (
              <motion.div 
                key={category} 
                className="mb-8"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: categoryIndex * 0.1 }}
              >
                <h3 className="font-sans text-lg font-bold capitalize mb-4 text-gray-700 border-b border-gray-300 pb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      className="flex items-center justify-between"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, delay: index * 0.05 }}
                    >
                      <span className="font-sans text-sm">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full overflow-hidden bg-gray-200">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: '#2D2D2D' }}
                            initial={shouldReduceMotion ? false : { width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-sans w-8">{skill.level}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Map legend for diary mode — categories are legend groups with
          // hand-drawn cartographic symbols; dotted leaders run to the stars.
          <motion.div
            className="map-panel max-w-4xl mx-auto p-6 md:p-10 pointer-events-auto"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {Object.entries(
                skills.reduce((acc, skill) => {
                  if (!acc[skill.category]) acc[skill.category] = [];
                  acc[skill.category].push(skill);
                  return acc;
                }, {} as Record<string, typeof skills>)
              ).map(([category, categorySkills], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={
                    shouldReduceMotion ? { duration: 0 } : { delay: categoryIndex * 0.07 }
                  }
                >
                  {/* Legend group header */}
                  <div
                    className="flex items-center gap-3 pb-2 mb-3"
                    style={{ borderBottom: `2px solid ${categoryColors[category]}55` }}
                  >
                    <LegendSymbol category={category} color={categoryColors[category]} />
                    <h3
                      className="handwritten text-xl font-bold capitalize"
                      style={{ color: categoryColors[category] }}
                    >
                      {category}
                    </h3>
                  </div>

                  {/* Legend entries: name … stars */}
                  <ul className="space-y-2">
                    {categorySkills.map((skill) => (
                      <li key={skill.name} className="flex items-end gap-2">
                        <span className="handwritten text-ink text-base whitespace-nowrap">
                          {skill.name}
                        </span>
                        <span
                          className="flex-1 mb-1.5 border-b-2 border-dotted"
                          style={{ borderColor: 'rgba(45,45,45,0.25)' }}
                        />
                        <StickerStars
                          rating={levelToStars(skill.level)}
                          color={categoryColors[skill.category]}
                        />
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Fun disclaimer in diary mode */}
        {!isSerious && (
          <motion.div
            className="text-center mt-8"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="handwritten text-ink/60 italic inline-block bg-paper/80 px-4 py-2 rounded-lg" style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}>
              {t('skills.disclaimer')}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import BlobDivider from './BlobDivider';
import FloatingDoodles from './FloatingDoodles';

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

// Category icons
const categoryIcons: Record<string, string> = {
  cloud: '☁️',
  database: '🗃️',
  mapping: '🗺️',
  frontend: '🎨',
  backend: '⚙️',
  domain: '🎯',
  graphics: '🧱',
  architecture: '🏗️',
  devops: '🛠️',
};

export default function Skills() {
  const { isSerious } = useSeriousMode();
  const { content, t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const skills = content.skills as Skill[];

  return (
    <section className={`py-20 relative ${!isSerious ? 'section-yellow' : ''}`}>
      {/* Top Wave Divider */}
      {!isSerious && (
        <BlobDivider position="top" fillColor="var(--paper)" variant={2} />
      )}
      
      {/* Floating Background Doodles */}
      {!isSerious && <FloatingDoodles variant="fun" density="sparse" />}
      
      <motion.h2
        className={`text-3xl md:text-4xl text-center mb-16 pt-16 ${isSerious ? 'font-sans font-bold text-ink' : 'diary-title text-ink drop-shadow-lg'}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={isJapanese && !isSerious ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
      >
        {isSerious ? t('skills.title_serious') : t('skills.title_diary')}
      </motion.h2>

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
          // RPG Card Style for Diary Mode
          <>
            {/* Group skills by category */}
            {Object.entries(
              skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, typeof skills>)
            ).map(([category, categorySkills], categoryIndex) => (
              <div key={category} className="mb-12">
                {/* Category Header */}
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: categoryIndex * 0.1 }}
                >
                  <span className="text-3xl">{categoryIcons[category] || '🔧'}</span>
                  <h3 className="handwritten text-2xl font-bold capitalize" style={{ color: categoryColors[category] }}>
                    {category}
                  </h3>
                  <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: categoryColors[category] + '30' }} />
                </motion.div>

                {/* Skills Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorySkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      className="relative group"
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              duration: 0.5,
                              delay: index * 0.1,
                              type: "spring",
                              stiffness: 100,
                            }
                      }
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                              scale: 1.05,
                              rotateY: 5,
                              rotateX: 5,
                              z: 50,
                            }
                      }
                      style={{ perspective: 1000 }}
                    >
                      {/* Card */}
                      <div 
                        className="relative p-5 rounded-xl shadow-lg wobbly-border bg-gradient-to-br from-paper/95 to-white/90 overflow-hidden"
                        style={{
                          borderColor: categoryColors[skill.category],
                          borderWidth: '3px',
                        }}
                      >
                        {/* Subtle paper-like shadow on hover, no digital glows */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                          style={{ backgroundColor: 'black' }}
                        />

                        {/* Corner decoration (ink smudge style) */}
                        <div 
                          className="absolute top-0 right-0 w-12 h-12 opacity-5"
                          style={{
                            background: `radial-gradient(circle at top right, ${categoryColors[skill.category]}, transparent)`,
                          }}
                        />

                        {/* Skill Name */}
                        <div className="relative z-10 mb-3">
                          <h4 className="handwritten text-lg font-bold text-ink flex items-center gap-2">
                            <span className="text-2xl">{categoryIcons[skill.category] || '🔧'}</span>
                            {skill.name}
                          </h4>
                        </div>

                        {/* Segmented Stamina Bar */}
                        <div className="relative z-10">
                          <div className="flex items-center justify-end mb-1">
                            <span 
                              className="handwritten text-sm font-bold"
                              style={{ color: categoryColors[skill.category] }}
                            >
                              {skill.level}%
                            </span>
                          </div>
                          
                          {/* Continuous scribble bar */}
                          <div className="relative h-4 rounded-sm border-2 border-ink/40 overflow-hidden bg-white/50 wobbly-border-light">
                            <motion.div
                              className="h-full scribble-texture absolute left-0 top-0"
                              style={{ 
                                backgroundColor: categoryColors[skill.category],
                                opacity: 0.8,
                              }}
                              initial={shouldReduceMotion ? false : { width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={
                                shouldReduceMotion
                                  ? { duration: 0 }
                                  : {
                                      duration: 1,
                                      delay: categoryIndex * 0.1 + index * 0.05,
                                      ease: "easeOut",
                                    }
                              }
                            />
                            {/* Hand-drawn marker lines */}
                            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                              {[25, 50, 75].map(marker => (
                                <div key={marker} className="h-full w-[1px] bg-ink/20" style={{ marginLeft: `${marker}%` }} />
                              ))}
                            </div>
                          </div>
                        </div>


                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </>
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

      {/* Bottom Wave Divider */}
      {!isSerious && (
        <BlobDivider position="bottom" fillColor="var(--paper)" variant={3} />
      )}
    </section>
  );
}

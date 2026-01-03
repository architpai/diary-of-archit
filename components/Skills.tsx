'use client';

import { motion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';
import BlobDivider from './BlobDivider';
import FloatingDoodles from './FloatingDoodles';

interface Skill {
  name: string;
  level: number;
  category: string;
}

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
  cloud: '#3B5998',
  database: '#27ae60',
  mapping: '#e74c3c',
  frontend: '#9b59b6',
  backend: '#f39c12',
  language: '#1abc9c',
};

// Category icons
const categoryIcons: Record<string, string> = {
  cloud: '☁️',
  database: '🗃️',
  mapping: '🗺️',
  frontend: '🎨',
  backend: '⚙️',
  language: '💬',
};

export default function Skills() {
  const { isSerious } = useSeriousMode();
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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {isSerious ? 'Technical Skills' : '💪 My Superpowers ⚡'}
      </motion.h2>

      <div className="max-w-3xl mx-auto px-4">
        <div className={`grid gap-4 ${!isSerious ? 'bg-paper/90 p-6 rounded-2xl wobbly-border' : ''}`}>
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              className={`
                ${isSerious ? 'border-b border-gray-200 pb-3' : 'relative'}
              `}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  font-bold flex items-center gap-2
                  ${isSerious ? 'font-sans text-sm' : 'handwritten text-lg'}
                `}>
                  {!isSerious && <span>{categoryIcons[skill.category] || '🔧'}</span>}
                  {skill.name}
                </span>
                {!isSerious && (
                  <span 
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{ 
                      backgroundColor: categoryColors[skill.category] + '30',
                      color: categoryColors[skill.category]
                    }}
                  >
                    {skill.category}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className={`
                h-6 rounded-full overflow-hidden relative
                ${isSerious ? 'bg-gray-200' : 'wobbly-border-light bg-white/50'}
              `}>
                <motion.div
                  className="h-full rounded-full flex items-center justify-end pr-2"
                  style={{ 
                    backgroundColor: isSerious ? '#2D2D2D' : categoryColors[skill.category]
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                >
                  {!isSerious && (
                    <span className="text-white text-xs font-bold">{skill.level}%</span>
                  )}
                </motion.div>
              </div>

              {isSerious && (
                <span className="text-xs text-gray-500 font-sans">
                  {skill.level}%
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Fun disclaimer in diary mode */}
        {!isSerious && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="handwritten text-ink/60 italic inline-block bg-paper/80 px-4 py-2 rounded-lg">
              * These percentages are totally scientific and not made up at all 😉
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


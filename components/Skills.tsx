'use client';

import { motion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';

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

export default function Skills() {
  const { isSerious } = useSeriousMode();
  const skills = content.skills as Skill[];

  return (
    <section className="py-20 relative">
      <motion.h2
        className={`text-3xl md:text-4xl text-center mb-16 text-ink ${isSerious ? 'font-sans font-bold' : 'diary-title'}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {isSerious ? 'Technical Skills' : 'My Superpowers ⚡'}
      </motion.h2>

      <div className="max-w-3xl mx-auto px-4">
        <div className="grid gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              className={`
                ${isSerious ? 'border-b border-gray-200 pb-3' : ''}
              `}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  font-bold
                  ${isSerious ? 'font-sans text-sm' : 'handwritten text-lg'}
                `}>
                  {skill.name}
                </span>
                {!isSerious && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: categoryColors[skill.category] + '20',
                      color: categoryColors[skill.category]
                    }}
                  >
                    {skill.category}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className={`
                h-4 rounded-full overflow-hidden
                ${isSerious ? 'bg-gray-200' : 'wobbly-border-light bg-paper'}
              `}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: isSerious ? '#2D2D2D' : categoryColors[skill.category]
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                />
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
          <motion.p
            className="handwritten text-center mt-8 text-ink/60 italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            * These percentages are totally scientific and not made up at all 😉
          </motion.p>
        )}
      </div>
    </section>
  );
}

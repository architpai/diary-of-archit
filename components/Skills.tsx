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
  domain: '#2c7a7b',
  graphics: '#e67e22',
  architecture: '#7f8c8d',
  devops: '#1abc9c',
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

      <div className="max-w-5xl mx-auto px-4">
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h3 className="font-sans text-lg font-bold capitalize mb-4 text-gray-700 border-b border-gray-300 pb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <span className="font-sans text-sm">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full overflow-hidden bg-gray-200">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: '#2D2D2D' }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
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
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: categoryIndex * 0.1 }}
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
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        rotateY: 5,
                        rotateX: 5,
                        z: 50,
                      }}
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
                        {/* Glow effect on hover */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                          style={{ backgroundColor: categoryColors[skill.category] }}
                        />

                        {/* Corner decoration */}
                        <div 
                          className="absolute top-0 right-0 w-16 h-16 opacity-10"
                          style={{
                            background: `linear-gradient(135deg, transparent 50%, ${categoryColors[skill.category]} 50%)`,
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
                          <div className="flex items-center justify-between mb-1">
                            <span className="handwritten text-xs text-ink/60">Power Level</span>
                            <span 
                              className="handwritten text-sm font-bold"
                              style={{ color: categoryColors[skill.category] }}
                            >
                              {skill.level}
                            </span>
                          </div>
                          
                          {/* Segmented bars (like RPG stamina) */}
                          <div className="flex gap-1">
                            {Array.from({ length: 10 }).map((_, i) => {
                              const segmentFilled = ((i + 1) * 10) <= skill.level;
                              const isPartialFill = ((i * 10) < skill.level) && (skill.level < ((i + 1) * 10));
                              const partialWidth = isPartialFill ? ((skill.level % 10) * 10) : 100;

                              return (
                                <motion.div
                                  key={i}
                                  className="flex-1 h-3 rounded-sm border border-ink/20 overflow-hidden relative"
                                  style={{ backgroundColor: '#f5f5f5' }}
                                  initial={{ scaleX: 0 }}
                                  whileInView={{ scaleX: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ 
                                    duration: 0.3, 
                                    delay: categoryIndex * 0.2 + index * 0.1 + i * 0.02 
                                  }}
                                >
                                  {(segmentFilled || isPartialFill) && (
                                    <motion.div
                                      className="h-full absolute left-0 top-0"
                                      style={{ 
                                        backgroundColor: categoryColors[skill.category],
                                        width: isPartialFill ? `${partialWidth}%` : '100%',
                                      }}
                                      initial={{ width: 0 }}
                                      whileInView={{ 
                                        width: isPartialFill ? `${partialWidth}%` : '100%' 
                                      }}
                                      viewport={{ once: true }}
                                      transition={{ 
                                        duration: 0.5, 
                                        delay: categoryIndex * 0.2 + index * 0.1 + i * 0.05,
                                        ease: "easeOut"
                                      }}
                                    />
                                  )}
                                </motion.div>
                              );
                            })}
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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="handwritten text-ink/60 italic inline-block bg-paper/80 px-4 py-2 rounded-lg">
              * These percentages are totally scientific and not made up at all 
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


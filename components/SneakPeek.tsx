'use client';

import { motion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';

interface Hobby {
  id: string;
  title: string;
  narrative: string;
  icon: string;
}

export default function SneakPeek() {
  const { isSerious } = useSeriousMode();
  const hobbies = content.personal.hobbies as Hobby[];

  // Hide this section in serious mode
  if (isSerious) return null;

  return (
    <section className="py-20 relative">
      {/* Section Title */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="diary-title text-3xl md:text-4xl text-ink mb-2">
          The &ldquo;Sneak Peek&rdquo; Section
        </h2>
        <p className="diary-subtitle text-margin-blue handwritten">
          (The stuff that doesn&apos;t go on the resume... but should)
        </p>
      </motion.div>

      {/* Hobbies Grid */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {hobbies.map((hobby, index) => (
          <motion.div
            key={hobby.id}
            className="post-it p-6"
            style={{ transform: `rotate(${(index - 1) * 3}deg)` }}
            initial={{ opacity: 0, y: 50, rotate: (index - 1) * 3 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            whileHover={{ 
              scale: 1.05, 
              rotate: 0,
              boxShadow: '5px 5px 15px rgba(0,0,0,0.3)'
            }}
          >
            {/* Icon */}
            <motion.div
              className="text-5xl mb-4 text-center"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: index * 0.3
              }}
            >
              {hobby.icon}
            </motion.div>

            {/* Title */}
            <h3 className="handwritten text-xl font-bold text-ink text-center mb-3">
              {hobby.title}
            </h3>

            {/* Narrative */}
            <p className="handwritten text-ink text-center leading-relaxed">
              {hobby.narrative}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Current Setup Note */}
      <motion.div
        className="mt-16 max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div className="post-it-blue p-4 text-center" style={{ transform: 'rotate(2deg)' }}>
          <p className="handwritten text-ink">
            Current Weapon of Choice: <strong>{content.personal.currentSetup}</strong> 💪
          </p>
        </div>
      </motion.div>

      {/* Floating Doodles */}
      <motion.div
        className="absolute top-20 left-5 text-4xl floating-doodle opacity-50"
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🎮
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-4xl floating-doodle opacity-50"
        animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      >
        ☕
      </motion.div>
    </section>
  );
}

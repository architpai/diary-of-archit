'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';
import BlobDivider from './BlobDivider';
import FloatingDoodles from './FloatingDoodles';

interface Hobby {
  id: string;
  title: string;
  narrative: string;
  icon: string;
}

// Map hobbies to specific avatar poses
const hobbyPoses: Record<string, string> = {
  pokemon: '/avatar/waving_pose.png',
  gym: '/avatar/flexing_pose.png',
  llm: '/avatar/coding_pose.png',
};

// Hobby card colors
const hobbyColors: Record<string, { bg: string; accent: string }> = {
  pokemon: { bg: '#FFEB3B', accent: '#FDD835' },
  gym: { bg: '#FF69B4', accent: '#FF1493' },
  llm: { bg: '#87CEEB', accent: '#4682B4' },
};

export default function SneakPeek() {
  const { isSerious } = useSeriousMode();
  const hobbies = content.personal.hobbies as Hobby[];

  // Hide this section in serious mode
  if (isSerious) return null;

  return (
    <section className="py-20 relative section-blue">
      {/* Top Wave Divider */}
      <BlobDivider position="top" fillColor="var(--paper)" variant={3} />
      
      {/* Floating Background Doodles */}
      <FloatingDoodles variant="fun" density="normal" />

      {/* Section Title */}
      <motion.div
        className="text-center mb-16 pt-16 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="diary-title text-3xl md:text-4xl text-white drop-shadow-lg mb-2">
          👀 The &ldquo;Sneak Peek&rdquo; Section
        </h2>
        <p className="diary-subtitle text-white/80 handwritten">
          (The stuff that doesn&apos;t go on the resume... but should)
        </p>
      </motion.div>

      {/* Hobbies Grid */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {hobbies.map((hobby, index) => (
          <motion.div
            key={hobby.id}
            className="relative"
            style={{ transform: `rotate(${(index - 1) * 3}deg)` }}
            initial={{ opacity: 0, y: 50, rotate: (index - 1) * 3 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            {/* Post-it Card */}
            <motion.div
              className="p-6 flex flex-col items-center relative tape-corner"
              style={{
                background: `linear-gradient(135deg, ${hobbyColors[hobby.id]?.bg || '#FFEB3B'} 0%, ${hobbyColors[hobby.id]?.accent || '#FDD835'} 100%)`,
                boxShadow: '4px 4px 12px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.1)',
              }}
              whileHover={{ 
                scale: 1.08, 
                rotate: 0,
                boxShadow: '8px 8px 20px rgba(0,0,0,0.35)',
                zIndex: 20
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Pin decoration */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl drop-shadow-md">
                📌
              </div>

              {/* Avatar Pose */}
              <motion.div
                className="mb-4 flex justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src={hobbyPoses[hobby.id] || '/avatar/waving_pose.png'}
                  alt={`${hobby.title} pose`}
                  width={140}
                  height={175}
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              {/* Title */}
              <h3 className="handwritten text-xl font-bold text-ink text-center mb-3">
                {hobby.icon} {hobby.title}
              </h3>

              {/* Narrative */}
              <p className="handwritten text-ink text-center leading-relaxed text-sm">
                {hobby.narrative}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Current Setup Note */}
      <motion.div
        className="mt-16 max-w-md mx-auto relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div 
          className="p-5 text-center relative"
          style={{ 
            background: 'linear-gradient(135deg, #98FB98 0%, #32CD32 100%)',
            transform: 'rotate(2deg)',
            boxShadow: '3px 3px 10px rgba(0,0,0,0.2)'
          }}
        >
          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xl">📌</span>
          <p className="handwritten text-ink text-lg">
            Current Weapon of Choice: <strong>{content.personal.currentSetup}</strong> 💪
          </p>
        </div>
      </motion.div>

      {/* Bottom Wave Divider */}
      <BlobDivider position="bottom" fillColor="var(--paper)" variant={1} />
    </section>
  );
}


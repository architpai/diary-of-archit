'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';

interface Hobby {
  id: string;
  title: string;
  narrative: string;
  details?: string;
  icon: string;
}

// Map hobbies to specific avatar poses
const hobbyPoses: Record<string, string> = {
  pokemon: '/avatar/waving_pose.webp',
  gym: '/avatar/flexing_pose.webp',
  llm: '/avatar/coding_pose.webp',
  agents: '/avatar/victory_pose.webp',
};

// Hobby card colors
const hobbyColors: Record<string, { bg: string; accent: string }> = {
  pokemon: { bg: '#FFEB3B', accent: '#FDD835' },
  gym: { bg: '#FF69B4', accent: '#FF1493' },
  llm: { bg: '#87CEEB', accent: '#4682B4' },
  agents: { bg: '#B39DDB', accent: '#7E57C2' },
};

function HobbyCard({ hobby, index, shouldReduceMotion, isJapanese }: {
  hobby: Hobby;
  index: number;
  shouldReduceMotion: boolean | null;
  isJapanese: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const colors = hobbyColors[hobby.id] || { bg: '#FFEB3B', accent: '#FDD835' };
  const rotation = (index - 1) * 3;
  const toggleFlipped = () => setIsFlipped((current) => !current);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFlipped();
    }
  };

  const cardShadow = '4px 4px 12px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.1)';

  return (
    <motion.div
      className="relative cursor-pointer rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
      style={{ perspective: '1000px', transform: `rotate(${rotation}deg)` }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 50, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.15 }}
      onClick={toggleFlipped}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${hobby.title}: ${isFlipped ? 'show summary' : 'show details'}`}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
      >
        {/* ── FRONT — stays in normal flow so it sizes the container ── */}
        <div
          className="p-6 flex flex-col items-center relative tape-corner"
          style={{
            background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent} 100%)`,
            boxShadow: cardShadow,
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl drop-shadow-md">📌</div>

          <motion.div
            className="mb-4 flex justify-center"
            animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={shouldReduceMotion ? undefined : { duration: 2, repeat: Infinity, delay: index * 0.3, ease: 'easeInOut' }}
          >
            <Image
              src={hobbyPoses[hobby.id] || '/avatar/waving_pose.webp'}
              alt={`${hobby.title} pose`}
              width={140}
              height={175}
              className="object-contain drop-shadow-lg"
            />
          </motion.div>

          <h3
            className="handwritten text-xl font-bold text-ink text-center mb-3"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {hobby.icon} {hobby.title}
          </h3>

          <p
            className="handwritten text-ink text-center leading-relaxed text-sm"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {hobby.narrative}
          </p>

          <span className="mt-3 text-xs text-ink/50 handwritten"><span className="md:hidden">tap</span><span className="hidden md:inline">click</span> to flip</span>
        </div>

        {/* ── BACK — positioned via inset-0 inside the preserve-3d container ── */}
        <div
          className="p-6 flex flex-col items-center justify-center tape-corner"
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.bg} 100%)`,
            boxShadow: cardShadow,
          }}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl drop-shadow-md">📌</div>

          <h3
            className="handwritten text-xl font-bold text-ink text-center mb-4"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {hobby.icon} The Details
          </h3>

          <p
            className="handwritten text-ink text-center leading-relaxed text-sm"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {hobby.details || hobby.narrative}
          </p>

          <span className="mt-4 text-xs text-ink/50 handwritten"><span className="md:hidden">tap</span><span className="hidden md:inline">click</span> to flip back</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SneakPeek() {
  const { isSerious } = useSeriousMode();
  const { t, content, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const hobbies = content.personal.hobbies as Hobby[];

  // Hide this section in serious mode
  if (isSerious) return null;

  return (
    <section className="py-20 relative">
      {/* Section Title — uncharted territory cartouche */}
      <motion.div
        className="text-center mb-16 relative z-10 px-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="map-cartouche relative inline-block px-8 py-4 pointer-events-auto">
          <h2
            className="diary-title text-3xl md:text-4xl text-ink mb-2"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {t('sneakpeek.title')}
          </h2>
          <p
            className="diary-subtitle text-ink/60 handwritten"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {t('sneakpeek.subtitle')}
          </p>
          {/* Old-map warning stamp */}
          <span
            className="absolute -top-5 -right-8 rotate-12 handwritten text-sm font-bold px-3 py-1 border-[2.5px] rounded-md hidden sm:block"
            style={{
              color: '#C0392B',
              borderColor: '#C0392B',
              background: 'rgba(255,249,229,0.9)',
              fontFamily: isJapanese ? 'var(--font-jp-handwritten)' : undefined,
            }}
          >
            🐉 {t('sneakpeek.stamp')}
          </span>
        </div>
      </motion.div>

      {/* Hobbies Grid */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 pointer-events-auto">
        {hobbies.map((hobby, index) => (
          <HobbyCard
            key={hobby.id}
            hobby={hobby}
            index={index}
            shouldReduceMotion={shouldReduceMotion}
            isJapanese={isJapanese}
          />
        ))}
      </div>

      {/* Current Setup Note */}
      <motion.div
        className="mt-16 max-w-md mx-auto relative z-10 pointer-events-auto"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
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
          <p 
            className="handwritten text-ink text-lg"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {t('sneakpeek.current_setup')}: <strong>{content.personal.currentSetup}</strong> 💪
          </p>
        </div>
      </motion.div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  InkChip,
  InkClaw,
  InkDumbbell,
  InkSerpent,
  InkSpyglass,
  InkThumbtack,
} from './icons/InkIcons';

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

// One desaturated pigment per hobby — parchment artifacts, not neon post-its.
const hobbyAccents: Record<string, string> = {
  gym: '#B05F66', // oxide — a gym day-pass stub
  llm: '#3B5F8A', // prussian — a lab specimen card
  agents: '#64513B', // sepia — a wanted poster
};

// Drawn ink icon per hobby (replaces the emoji from content json)
function HobbyIcon({ id, color, className }: { id: string; color: string; className?: string }) {
  switch (id) {
    case 'gym':
      return <InkDumbbell className={className} color={color} />;
    case 'llm':
      return <InkChip className={className} color={color} />;
    case 'agents':
      return <InkClaw className={className} color={color} />;
    default:
      return null;
  }
}

function HobbyCard({ hobby, index, shouldReduceMotion, isJapanese }: {
  hobby: Hobby;
  index: number;
  shouldReduceMotion: boolean | null;
  isJapanese: boolean;
}) {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const accent = hobbyAccents[hobby.id] ?? '#64513B';
  const rotation = (index - 1) * 2.5;
  const jpFont = isJapanese
    ? ({ fontFamily: 'var(--font-jp-handwritten)' } as React.CSSProperties)
    : ({} as React.CSSProperties);
  const toggleFlipped = () => setIsFlipped((current) => !current);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFlipped();
    }
  };

  return (
    <motion.div
      className="relative cursor-pointer rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
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
          className="artifact-card p-6 pb-8 flex flex-col items-center relative tape-corner"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-md">
            <InkThumbtack className="w-7 h-8" color={accent} />
          </div>

          {/* artifact label — what kind of paper this pretends to be */}
          <span
            className="artifact-label self-start mb-3"
            style={{ color: accent, ...jpFont }}
          >
            {t(`sneakpeek.label_${hobby.id}`)}
          </span>

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
            className="handwritten text-xl font-bold text-ink text-center mb-3 inline-flex items-center gap-2"
            style={jpFont}
          >
            <HobbyIcon id={hobby.id} color={accent} className="w-7 h-7 shrink-0" />
            {hobby.title}
          </h3>

          <p
            className="handwritten text-ink/85 text-center leading-relaxed text-sm"
            style={jpFont}
          >
            {hobby.narrative}
          </p>

          {/* dog-eared corner + handwritten flip hint */}
          <span className="page-curl" aria-hidden="true" />
          <span
            className="absolute bottom-2 right-9 handwritten text-xs -rotate-3"
            style={{ color: accent, ...jpFont }}
          >
            {t('sneakpeek.flip_hint')}
          </span>
        </div>

        {/* ── BACK — positioned via inset-0 inside the preserve-3d container ── */}
        <div
          className="artifact-card p-6 pb-8 flex flex-col items-center justify-center tape-corner"
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            borderColor: accent,
          }}
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-md">
            <InkThumbtack className="w-7 h-8" color={accent} />
          </div>

          <h3
            className="handwritten text-xl font-bold text-ink text-center mb-4 inline-flex items-center gap-2"
            style={jpFont}
          >
            <HobbyIcon id={hobby.id} color={accent} className="w-7 h-7 shrink-0" />
            {t('sneakpeek.label_details')}
          </h3>

          <p
            className="handwritten text-ink/85 text-center leading-relaxed text-sm"
            style={jpFont}
          >
            {hobby.details || hobby.narrative}
          </p>

          <span
            className="absolute bottom-2 right-4 handwritten text-xs -rotate-2"
            style={{ color: accent, ...jpFont }}
          >
            {t('sneakpeek.flip_back')}
          </span>
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
  const jpFont = isJapanese
    ? ({ fontFamily: 'var(--font-jp-handwritten)' } as React.CSSProperties)
    : ({} as React.CSSProperties);

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
            className="diary-title text-3xl md:text-4xl text-ink mb-2 inline-flex items-center gap-3"
            style={jpFont}
          >
            <InkSpyglass className="w-9 h-9 shrink-0 text-ink/80" />
            {t('sneakpeek.title')}
          </h2>
          <p
            className="diary-subtitle text-ink/60 handwritten"
            style={jpFont}
          >
            {t('sneakpeek.subtitle')}
          </p>
          {/* Old-map warning stamp */}
          <span
            className="stamp-seal absolute -top-7 -right-10 rotate-6 hidden sm:inline-flex items-center gap-2"
            aria-hidden="true"
          >
            <InkSerpent className="w-9 h-6 shrink-0" color="#B05F66" />
            <span style={jpFont}>
              <span className="block text-sm font-bold leading-tight">
                {t('sneakpeek.stamp')}
              </span>
              <span className="block text-[9px] tracking-[0.22em] opacity-80 normal-case">
                {t('sneakpeek.stamp_latin')}
              </span>
            </span>
          </span>
        </div>
      </motion.div>

      {/* Hobbies Grid — sails the camera off the chart into uncharted
          waters (sea serpent, compass rose, here-be-dragons caption) */}
      <div
        data-map-waypoint="view-uncharted"
        className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 pointer-events-auto"
      >
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

      {/* Current Setup — the expedition's vessel, on a ship's-manifest tag */}
      <motion.div
        className="mt-16 flex justify-center relative z-10 pointer-events-auto px-4"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div className="manifest-tag rotate-[1.5deg]">
          <p className="handwritten text-ink text-base md:text-lg" style={jpFont}>
            <span className="uppercase tracking-[0.14em] text-sepia text-xs md:text-sm font-bold mr-2">
              {t('sneakpeek.current_setup')}:
            </span>
            <strong>{content.personal.currentSetup}</strong>
          </p>
        </div>
      </motion.div>
    </section>
  );
}

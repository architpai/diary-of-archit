'use client';

import { useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import Image from 'next/image';
import { avatarBox } from './avatarDimensions';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  InkChip,
  InkClaw,
  InkDumbbell,
  InkEyelet,
  InkSerpent,
  InkSpyglass,
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

// One sepia "field ink" for every specimen. The three cards used to be three
// different artifacts (day-pass / lab-specimen / wanted poster); they are now a
// single tagged-specimen system, so one accent keeps them cohesive.
const SPECIMEN_INK = '#64513B'; // --sepia

// Decorative "collected at" grid references nodding to the journey-map cities,
// so each card reads as a specimen logged on the survey.
const SPECIMEN_COORDS: Record<string, string> = {
  gym: '34.7°N 135.5°E', // Osaka — present base
  llm: '35.7°N 139.7°E', // Tokyo
  agents: '19.1°N 72.9°E', // Mumbai — origin
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

// A strand of the twisted pair, sampled as a fine polyline so it reads as a
// continuous thread (not a few fat loops). `amp` is the helix radius, `phase`
// offsets the two strands by π so they wind around each other.
const TWINE_TURNS = 4;
const TWINE_LEN = 31;
const TWINE_PTS = 56;
function twineStrand(amp: number, phase: number): string {
  let d = '';
  for (let i = 0; i <= TWINE_PTS; i++) {
    const t = i / TWINE_PTS;
    const x = (10 + amp * Math.sin(2 * Math.PI * TWINE_TURNS * t + phase)).toFixed(2);
    const y = (1 + t * TWINE_LEN).toFixed(2);
    d += `${i === 0 ? 'M' : 'L'}${x} ${y} `;
  }
  return d.trim();
}

// The twine above each eyelet: two thin strands woven into a tight twisted pair.
// At rest it's a relaxed cord; on flip the helix winds tighter (amplitude grows)
// and STAYS wound until it flips back — real twine doesn't spring straight. Both
// states share the same polyline structure so framer morphs smoothly between them.
function WindingTwine({ wound, color }: { wound: boolean; color: string }) {
  const amp = wound ? 3.1 : 1.1;
  const front = twineStrand(amp, 0);
  const back = twineStrand(amp, Math.PI);
  const tr = { type: 'spring', stiffness: 150, damping: 14 } as const;
  const base = { fill: 'none', strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 20 33" className="w-3.5 h-8" aria-hidden="true">
      {/* back strand — faded + slightly thinner reads as behind */}
      <motion.path initial={false} animate={{ d: back }} transition={tr} stroke={color} strokeWidth={1.1} opacity={0.5} {...base} />
      {/* front strand — full weight, drawn last so it crosses over */}
      <motion.path initial={false} animate={{ d: front }} transition={tr} stroke={color} strokeWidth={1.4} {...base} />
    </svg>
  );
}

// Per-card pendulum springs — slightly different so the tags desync naturally.
const SWING_SPRINGS = [
  { stiffness: 55, damping: 9, mass: 1.0 },
  { stiffness: 48, damping: 8, mass: 1.15 },
  { stiffness: 62, damping: 10, mass: 0.92 },
];
const SWAY_MAX = 10; // degrees of swing at full scroll velocity

function HobbyCard({ hobby, index, shouldReduceMotion, isJapanese, scrollVelocity }: {
  hobby: Hobby;
  index: number;
  shouldReduceMotion: boolean | null;
  isJapanese: boolean;
  scrollVelocity: MotionValue<number>;
}) {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const accent = SPECIMEN_INK;
  const specimenNo = String(index + 1).padStart(2, '0');
  const coord = SPECIMEN_COORDS[hobby.id];
  const restTilt = (index - 1) * 1.2; // tags hang at slightly different rest angles

  // Dangling pendulum: scroll velocity pushes the tag sideways; an underdamped
  // spring lets it swing past and settle. Faster scroll → bigger swing.
  const spring = SWING_SPRINGS[index % SWING_SPRINGS.length];
  const swayTarget = useTransform(scrollVelocity, [-4000, 0, 4000], [SWAY_MAX, 0, -SWAY_MAX], { clamp: true });
  const swaySpring = useSpring(swayTarget, spring);
  const sway = useTransform(swaySpring, (s) => restTilt + s);

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
      style={{ perspective: '1000px' }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
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
      {/* SWAY — the whole tag swings from the twine anchor above its top edge */}
      <motion.div
        className="relative"
        style={{
          rotate: shouldReduceMotion ? restTilt : sway,
          transformOrigin: '50% -10px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* TWINE TIE — anchored to the page. The eyelet stays put; the twine
            above it winds into a tighter coil on flip and stays wound. */}
        <div
          className="absolute -top-7 left-1/2 z-20 flex flex-col items-center drop-shadow-sm"
          style={{ transform: 'translateX(-50%) translateZ(2px)' }}
        >
          <WindingTwine wound={isFlipped && !shouldReduceMotion} color={accent} />
          <InkEyelet className="w-6 h-5 -mt-1.5" color={accent} />
        </div>

        <motion.div
          className="relative w-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
        >
        {/* ── FRONT — a field-survey specimen tag (sizes the container) ── */}
        <div
          className="specimen-tag p-6 pt-7 pb-8 flex flex-col items-center relative"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* unified specimen header — identical on every card */}
          <div
            className="self-stretch flex items-end justify-between gap-2 pb-1 border-b-2"
            style={{ borderColor: accent, color: accent }}
          >
            <span
              className="handwritten uppercase text-[0.7rem] font-bold tracking-[0.2em] opacity-80"
              style={jpFont}
            >
              {t('sneakpeek.spec_label')}
            </span>
            <span className="handwritten text-sm font-bold tracking-wide shrink-0">
              Nº {specimenNo}
            </span>
          </div>
          {/* survey detail — where this specimen was logged */}
          {coord && (
            <span
              className="self-start mt-1 mb-3 handwritten text-[0.7rem] tracking-wide inline-flex items-center gap-1"
              style={{ color: accent, opacity: 0.8 }}
            >
              <span aria-hidden="true">⌖</span>
              {coord}
            </span>
          )}

          <motion.div
            className="mb-3 flex justify-center"
            animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={shouldReduceMotion ? undefined : { duration: 2, repeat: Infinity, delay: index * 0.3, ease: 'easeInOut' }}
          >
            <Image
              src={hobbyPoses[hobby.id] || '/avatar/waving_pose.webp'}
              alt={`${hobby.title} pose`}
              {...avatarBox(hobbyPoses[hobby.id] || '/avatar/waving_pose.webp', 140)}
              className="object-contain drop-shadow-lg"
            />
          </motion.div>

          <h3
            className="handwritten text-xl font-bold text-ink text-center mb-2 inline-flex items-center gap-2"
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

        {/* ── BACK — the specimen's field notes (inset-0 in the 3d container) ── */}
        <div
          className="specimen-tag p-6 pt-7 pb-8 flex flex-col items-center justify-center"
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* same header as the front — keeps the specimen identified when flipped */}
          <div
            className="self-stretch flex items-end justify-between gap-2 mb-3 pb-1 border-b-2"
            style={{ borderColor: accent, color: accent }}
          >
            <span
              className="handwritten uppercase text-[0.7rem] font-bold tracking-[0.2em] opacity-80"
              style={jpFont}
            >
              {t('sneakpeek.label_notes')}
            </span>
            <span className="handwritten text-sm font-bold tracking-wide shrink-0">
              Nº {specimenNo}
            </span>
          </div>

          <h3
            className="handwritten text-lg font-bold text-ink text-center mb-3 inline-flex items-center gap-2"
            style={jpFont}
          >
            <HobbyIcon id={hobby.id} color={accent} className="w-6 h-6 shrink-0" />
            {hobby.title}
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
    </motion.div>
  );
}

export default function SneakPeek() {
  const { isSerious } = useSeriousMode();
  const { t, content, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const hobbies = content.personal.hobbies as Hobby[];

  // Shared scroll velocity → each specimen tag swings from its twine.
  const { scrollY } = useScroll();
  const rawVelocity = useVelocity(scrollY);
  const scrollVelocity = useSpring(rawVelocity, { damping: 50, stiffness: 350, mass: 0.6 });

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
            scrollVelocity={scrollVelocity}
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

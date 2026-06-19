'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import Image from 'next/image';
import { avatarBox } from './avatarDimensions';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import { EXPERIENCE_PIN, experienceColor } from './hero3d/mapData';
import { InkPlane, InkRoute } from './icons/InkIcons';

// Map doodle types to avatar poses
const doodlePoses: Record<string, string> = {
  celebration: '/avatar/victory_pose.webp',
  coding: '/avatar/coding_pose.webp',
  newbie: '/avatar/waving_pose.webp',
};

interface Experience {
  id: string;
  date: string;
  professionalTitle: string;
  company: string;
  diaryNarrative: string;
  resumeBulletPoints: string[];
  isResumeWorthy: boolean;
  doodleType: string;
}

// How many survey notes show before the fold. The rest live behind the
// "unfold the full survey notes" expander — the full list is on /resume.
const NOTES_ABOVE_FOLD = 3;

// "Plotting the route" reveal — resume bullets are waypoints inked onto the
// field log one after another, joined by dashed legs: the same visual
// language as the journey trail on the map. Only opacity/transform animate,
// so the card's height never changes while the camera tracks its rect.
// Delays are computed per index (via `custom`) so the sequence is exact:
// dot i stamps → text i inks → leg draws toward dot i+1.
const WP_BASE = 0.15;
const WP_STEP = 0.4;
const waypointItem: Variants = {
  hidden: {},
  visible: {},
};
const waypointDot: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 18,
      delay: WP_BASE + i * WP_STEP,
    },
  }),
};
const waypointText: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, delay: WP_BASE + i * WP_STEP + 0.1 },
  }),
};
const waypointLeg: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: (i: number) => ({
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: 'easeIn',
      delay: WP_BASE + i * WP_STEP + 0.22,
    },
  }),
};

/** Passport-style tenure stamp: city, entry year, coordinates. */
function PassportStamp({
  city,
  entryWord,
  year,
  coords,
  color,
  jpFont,
}: {
  city: string;
  entryWord: string;
  year: string;
  coords: string;
  color: string;
  jpFont: React.CSSProperties;
}) {
  return (
    <span className="passport-stamp mt-2" style={{ color, ...jpFont }}>
      <span className="block text-sm font-bold">
        {city} · {entryWord} {year}
      </span>
      <span className="block text-[10px] tracking-[0.18em] opacity-80">
        {coords}
      </span>
    </span>
  );
}

// ExperienceCard component - extracted to avoid hooks issues
function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const { t, isJapanese } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const pinColor = experienceColor(exp.id);
  const jpFont = isJapanese
    ? ({ fontFamily: 'var(--font-jp-handwritten)' } as React.CSSProperties)
    : ({} as React.CSSProperties);

  const bullets = exp.resumeBulletPoints;
  const visibleBullets = expanded ? bullets : bullets.slice(0, NOTES_ABOVE_FOLD);
  const hiddenCount = bullets.length - NOTES_ABOVE_FOLD;

  return (
      <motion.div
        id={exp.id}
        className={`flex flex-col items-center justify-end min-h-[100svh] pb-[7svh] md:min-h-0 md:pb-0 md:flex-row pointer-events-auto ${
          index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
        }`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
        whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
      >
      {/* Experience Card — one journal sheet, narrow and docked to the edge
          so the map (and the marker we just flew to) stays visible beside it */}
      <motion.div
        data-map-waypoint={EXPERIENCE_PIN[exp.id]}
        data-waypoint-side={index % 2 === 0 ? 'right' : 'left'}
        className="w-full md:w-[26rem] lg:w-[30rem] flex-none"
        whileHover={shouldReduceMotion ? undefined : { scale: 1.01, rotate: index % 2 === 0 ? 0.5 : -0.5 }}
        transition={shouldReduceMotion ? undefined : { type: "spring", stiffness: 300 }}
      >
        <div className="relative p-6 wobbly-border bg-paper/95 tape-corner shadow-xl">
          {/* Header — avatar pose + year tucked into the corner */}
          <div className="mb-4 relative pr-20">
            <div className="absolute top-0 right-0 flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full border-[3px] bg-parchment overflow-hidden flex items-center justify-center"
                style={{ borderColor: pinColor }}
              >
                <Image
                  src={doodlePoses[exp.doodleType] || doodlePoses.coding}
                  alt={`${exp.doodleType} doodle`}
                  {...avatarBox(doodlePoses[exp.doodleType] || doodlePoses.coding, 44)}
                  className="object-contain mt-2"
                />
              </div>
              <span
                className="handwritten text-xs font-bold text-white px-2 py-0.5 rounded-full -mt-2 shadow"
                style={{ backgroundColor: pinColor }}
              >
                {exp.date}
              </span>
            </div>
            <h3
              className="handwritten text-xl md:text-2xl font-bold text-ink"
              style={jpFont}
            >
              {exp.professionalTitle}
            </h3>
            <p
              className="handwritten font-bold"
              style={{ color: pinColor, ...jpFont }}
            >
              @ {exp.company}
            </p>
            <PassportStamp
              city={t(`timeline.city_${exp.id}`)}
              entryWord={t('timeline.stamp_entry')}
              year={exp.date}
              coords={t(`timeline.coords_${exp.id}`)}
              color={pinColor}
              jpFont={jpFont}
            />
          </div>

          {/* Diary Narrative */}
          <motion.p
            className="diary-narrative handwritten text-lg text-ink italic bg-[#EFE3B8]/60 p-3 rounded-lg"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }}
          >
            &ldquo;{exp.diaryNarrative}&rdquo;
          </motion.p>

          {/* Fold crease between the diary half and the survey notes */}
          <div
            className="my-5 -mx-6"
            style={{
              borderTop: '2px dashed rgba(100, 81, 59, 0.3)',
              boxShadow: '0 1.5px 0 rgba(255,255,255,0.55)',
            }}
          />

          {/* Survey notes — top bullets plotted like route waypoints. On
              mobile the whole block stays folded so the card is a compact band
              at the bottom and the map (with the marker we flew to) reads above
              it; on desktop it's always open beside the map. */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr] ${
              expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
          <div className="overflow-hidden">
          <motion.ul
            className="space-y-3 handwritten text-sm text-ink/70"
            style={jpFont}
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {visibleBullets.map((point: string, i: number) => {
              const isExtra = i >= NOTES_ABOVE_FOLD;
              return (
                <motion.li
                  key={i}
                  custom={i}
                  className="relative pl-7"
                  variants={shouldReduceMotion || isExtra ? undefined : waypointItem}
                  initial={isExtra && !shouldReduceMotion ? { opacity: 0, y: 6 } : undefined}
                  animate={isExtra ? { opacity: 1, y: 0 } : undefined}
                  transition={
                    isExtra && !shouldReduceMotion
                      ? { duration: 0.3, delay: (i - NOTES_ABOVE_FOLD) * 0.1 }
                      : undefined
                  }
                >
                  <motion.span
                    aria-hidden="true"
                    className="waypoint-dot"
                    style={{ background: pinColor }}
                    variants={shouldReduceMotion || isExtra ? undefined : waypointDot}
                  />
                  {i < visibleBullets.length - 1 && (
                    <motion.span
                      aria-hidden="true"
                      className="waypoint-leg"
                      variants={shouldReduceMotion || isExtra ? undefined : waypointLeg}
                    />
                  )}
                  <motion.span
                    className="block"
                    variants={shouldReduceMotion || isExtra ? undefined : waypointText}
                  >
                    {point}
                  </motion.span>
                </motion.li>
              );
            })}
          </motion.ul>
          </div>
          </div>

          {/* Unfold — on mobile reveals the whole folded notes block; on desktop
              only appears when there are notes beyond the fold. */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={`mt-4 handwritten text-sm text-ink/60 hover:text-ink transition-colors cursor-pointer ${
              hiddenCount > 0 ? '' : 'md:hidden'
            }`}
            style={{
              textDecoration: 'underline dashed',
              textDecorationColor: `${pinColor}88`,
              textUnderlineOffset: '4px',
              ...jpFont,
            }}
          >
            {expanded ? (
              `${t('timeline.notes_less')} ↑`
            ) : (
              <>
                {t('timeline.notes_more')}{' '}
                <span className="md:hidden">({bullets.length})</span>
                {hiddenCount > 0 && (
                  <span className="hidden md:inline">(+{hiddenCount})</span>
                )}{' '}
                ↓
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Boarding-pass stub marking the travel leg between two journey stops. */
function BoardingStub({ leg }: { leg: number }) {
  const { t, isJapanese } = useTranslation();
  const jpFont = isJapanese
    ? ({ fontFamily: 'var(--font-jp-handwritten)' } as React.CSSProperties)
    : ({} as React.CSSProperties);

  return (
    <div className="route-leg py-16 md:py-28" style={jpFont}>
      <p className="text-sm md:text-base text-ink/50 mb-3">
        {t(`timeline.leg_${leg}_rewind`)}
      </p>
      <div
        className="boarding-stub"
        style={{ transform: `rotate(${leg % 2 === 0 ? 1.5 : -1.5}deg)` }}
      >
        <div className="boarding-stub-main">
          <div className="flex items-center gap-2.5">
            <InkPlane className="w-5 h-5 shrink-0" color="#64513B" />
            <span className="boarding-route">{t(`timeline.leg_${leg}_route`)}</span>
          </div>
          <p className="text-sm opacity-80 mt-0.5">{t(`timeline.leg_${leg}_note`)}</p>
        </div>
        <div className="boarding-stub-tear">
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">
            {isJapanese ? '年' : 'YR'}
          </span>
          <span className="text-lg font-bold leading-none text-ink">
            {t(`timeline.leg_${leg}_year`)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const { isSerious } = useSeriousMode();
  const { content, t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const experiences = content.experiences as Experience[];

  return (
    <section className="py-20 relative">
      {!isSerious ? (
        <motion.div
          className="text-center mb-24 px-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="map-cartouche inline-block px-8 py-4 pointer-events-auto">
            <h2
              className="diary-title text-3xl md:text-4xl text-ink inline-flex items-center gap-3"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              <InkRoute className="w-9 h-9 shrink-0 text-ink/80" />
              {t('timeline.title_diary')}
            </h2>
            <p
              className="handwritten text-ink/50 text-sm mt-1"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              {t('timeline.map_hint')}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.h2
          className="diary-title text-3xl md:text-4xl text-center mb-10 pt-16 text-ink"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
        >
          {t('timeline.title_serious')}
        </motion.h2>
      )}

      <div className="relative max-w-7xl mx-auto px-4 md:px-10">
        {isSerious ? (
          // Clean vertical timeline for serious mode
          <div className="timeline max-w-4xl">
            <div className="timeline-line bg-gray-300" />
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="relative mb-16"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.2 }}
              >
                <div
                  className="timeline-dot bg-gray-600 border-white"
                  style={{ top: '20px' }}
                />
                <div className="ml-8 p-6 bg-white border border-gray-200 rounded">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-lg font-bold font-sans">{exp.date}</span>
                      <h3 className="text-xl md:text-2xl font-bold text-ink font-sans">
                        {exp.professionalTitle}
                      </h3>
                      <p className="text-gray-600 font-sans text-sm">
                        @ {exp.company}
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 font-sans text-sm text-gray-800">
                    {exp.resumeBulletPoints.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Journey waypoints — big gaps between cards let the map (and the
          // camera flight) show through; boarding-pass stubs mark each leg.
          <div className="relative">
            {experiences.map((exp, index) => (
              <div key={exp.id}>
                {index > 0 && <BoardingStub leg={index} />}
                <ExperienceCard exp={exp} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

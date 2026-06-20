'use client';

import { type ComponentType, type CSSProperties, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import { CATEGORY_COLORS } from '@/components/hero3d/mapData';
import {
  InkBrackets,
  InkCloud,
  InkCompass,
  InkDatabase,
  InkSerpent,
  InkServer,
} from '@/components/icons/InkIcons';
import BasecampLottie from './BasecampLottie';

interface Skill {
  id?: string;
  name: string;
  level: number;
  category: string;
  tier?: string;
}

type InkGlyph = ComponentType<{ className?: string; color?: string }>;

/** A worn sepia for the unexplored "here be dragons" frontier — it has no
 *  entry in CATEGORY_COLORS because it isn't a charted category yet. */
const FRONTIER_COLOR = '#7E5A3C';
/** Cream the pin glyphs are drawn in, so the ink reads on the solid marker. */
const PIN_GLYPH_INK = '#FFF9E5';

interface SkillGroup {
  id: string;
  /** Maps to the .skills-basecamp-pin-_N position slots in globals.css */
  className: string;
  labelKey: string;
  color: string;
  Icon: InkGlyph;
  /** Skill ids resolved against content.skills for their localized names */
  skillIds: string[];
  /** ui-copy keys for skills not in content.skills (the frontier two) */
  chartKeys?: string[];
  frontier?: boolean;
}

// Six kits laid out as regions on the map — the diary's real skill
// categories grouped, coloured by CATEGORY_COLORS so they match the rest of
// the map's legend. The frontier kit is the uncharted AI edge.
const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'mapping',
    className: '_1',
    labelKey: 'skills.group_mapping',
    color: CATEGORY_COLORS.mapping,
    Icon: InkCompass,
    skillIds: ['geo', 'mvt', 'wayfinding', 'maplibre'],
  },
  {
    id: 'data',
    className: '_2',
    labelKey: 'skills.group_data',
    color: CATEGORY_COLORS.database,
    Icon: InkDatabase,
    skillIds: ['postgis', 'redis'],
  },
  {
    id: 'frontend',
    className: '_3',
    labelKey: 'skills.group_frontend',
    color: CATEGORY_COLORS.frontend,
    Icon: InkBrackets,
    skillIds: ['react', 'ts', 'redux', 'threejs'],
  },
  {
    id: 'backend',
    className: '_4',
    labelKey: 'skills.group_backend',
    color: CATEGORY_COLORS.backend,
    Icon: InkServer,
    skillIds: ['node', 'python', 'sysdesign'],
  },
  {
    id: 'cloud',
    className: '_5',
    labelKey: 'skills.group_cloud',
    color: CATEGORY_COLORS.cloud,
    Icon: InkCloud,
    skillIds: ['azure', 'docker', 'cicd'],
  },
  {
    id: 'frontier',
    className: '_6',
    labelKey: 'skills.group_frontier',
    color: FRONTIER_COLOR,
    Icon: InkSerpent,
    skillIds: [],
    chartKeys: ['skills.chart_1', 'skills.chart_2'],
    frontier: true,
  },
];

export default function Skills() {
  const { isSerious } = useSeriousMode();
  const { content, t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const skills = content.skills as Skill[];

  // id → localized skill name, so a group's pins can list their tools.
  const skillNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const skill of skills) if (skill.id) map[skill.id] = skill.name;
    return map;
  }, [skills]);

  const activeGroup = SKILL_GROUPS.find((group) => group.id === activeGroupId);

  const groupSkillNames = (group: SkillGroup): string[] => [
    ...group.skillIds.map((id) => skillNameById[id]).filter(Boolean),
    ...(group.chartKeys ?? []).map((key) => t(key)),
  ];

  return (
    <section
      className={isSerious ? 'py-20 relative' : 'skills-basecamp-section relative'}
      // While this section is centred, the persistent terrain backdrop dims its
      // pin labels + markers (CameraRig reads this) so they don't bleed through
      // the basecamp illustration. Inert in serious mode (no 3D backdrop).
      data-map-waypoint={isSerious ? undefined : 'view-network'}
    >
      {isSerious && (
        <motion.h2
          className="text-3xl md:text-4xl text-center mb-16 pt-16 font-sans font-bold text-ink"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('skills.title_serious')}
        </motion.h2>
      )}

      {isSerious ? (
        // Organized skills by category for serious mode
        <div className="max-w-5xl mx-auto px-4 relative z-20">
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
        </div>
      ) : (
        <div className="skills-basecamp-inner">
          <motion.div
            className="skills-basecamp-heading"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
          >
            {/* Hand-surveyed, not campaign-poster: the diary's brush type with
                a gentle wobble on each line, no mechanical scroll-parallax. */}
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16, rotate: -2.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.05 }}
            >
              there&apos;s always
            </motion.span>
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16, rotate: 2.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
            >
              more to explore
            </motion.span>
            <Image
              className="skills-basecamp-cloud"
              src="/basecamp/cloud01.svg"
              alt=""
              aria-hidden="true"
              width={90}
              height={60}
            />
          </motion.div>

          {/* The hint fades out once a kit is open, so it never competes with
              the popup card for the same patch of screen. */}
          <p
            className="skills-basecamp-hint"
            style={{ opacity: activeGroup ? 0 : 1 }}
            aria-hidden={activeGroup ? true : undefined}
          >
            {t('skills.map_hint')}
          </p>

          <div className="skills-basecamp-map-stage">
            <div
              className="skills-basecamp-map-wrap"
              onMouseLeave={() => setActiveGroupId(null)}
            >
              <BasecampLottie
                className="skills-basecamp-lottie"
                path="/basecamp/kaart-loop.json"
              />

              {SKILL_GROUPS.map((group) => {
                const Icon = group.Icon;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`skills-basecamp-pin skills-basecamp-pin-${group.className}${
                      group.frontier ? ' skills-basecamp-pin-frontier' : ''
                    }`}
                    style={{ backgroundColor: group.color }}
                    aria-label={t(group.labelKey)}
                    title={t(group.labelKey)}
                    // One model: hover, focus, or tap all OPEN this group; the
                    // wrap's onMouseLeave + onBlur close it. (A toggle on click
                    // would cancel the open that mouseenter/focus just set,
                    // breaking "tap on mobile".)
                    onFocus={() => setActiveGroupId(group.id)}
                    onBlur={() => setActiveGroupId((cur) => (cur === group.id ? null : cur))}
                    onMouseEnter={() => setActiveGroupId(group.id)}
                    onClick={() => setActiveGroupId(group.id)}
                  >
                    <Icon className="skills-basecamp-pin-glyph" color={PIN_GLYPH_INK} />
                  </button>
                );
              })}

              {activeGroup && (
                <div
                  className={`skills-basecamp-popup skills-basecamp-popup-${activeGroup.className}`}
                  style={{ '--pin-color': activeGroup.color } as CSSProperties}
                  role="status"
                >
                  <span className="skills-basecamp-popup-head">
                    <activeGroup.Icon
                      className="skills-basecamp-popup-glyph"
                      color={activeGroup.color}
                    />
                    {t(activeGroup.labelKey)}
                  </span>
                  <ul className="skills-basecamp-popup-list">
                    {groupSkillNames(activeGroup).map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                  {activeGroup.frontier && (
                    <span className="skills-basecamp-popup-note">{t('skills.tier_charting')}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

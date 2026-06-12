'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import { InkKey } from './icons/InkIcons';
import { StarGlyph } from './icons/StarGlyphs';
import { CATEGORY_COLORS } from './hero3d/mapData';
import { sceneState } from './hero3d/sceneState';

interface Skill {
  id?: string;
  name: string;
  level: number;
  category: string;
  tier?: string;
}

const UNCHARTED_COLOR = '#3E6B5E';

export default function Skills() {
  const { isSerious } = useSeriousMode();
  const { content, t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const skills = content.skills as Skill[];
  const jpFont = isJapanese
    ? ({ fontFamily: 'var(--font-jp-handwritten)' } as React.CSSProperties)
    : ({} as React.CSSProperties);

  // Category key for the glyph legend — every glyph genuinely shines above.
  const categories: { key: string; color: string; label: string }[] = [
    ...Array.from(new Set(skills.map((s) => s.category))).map((c) => ({
      key: c,
      color: CATEGORY_COLORS[c] ?? '#64513B',
      label: c,
    })),
    { key: 'uncharted', color: UNCHARTED_COLOR, label: t('skills.tier_charting') },
  ];

  return (
    <section className="py-20 relative">
      {!isSerious ? (
        <motion.div
          className="text-center mb-10 px-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="map-cartouche inline-block px-8 py-4 pointer-events-auto">
            <h2
              className="diary-title text-3xl md:text-4xl text-ink inline-flex items-center gap-3"
              style={jpFont}
            >
              <InkKey className="w-9 h-9 shrink-0 text-ink/80" />
              {t('skills.title_diary')}
            </h2>
            <p
              className="handwritten text-ink/50 text-sm mt-1 tracking-widest uppercase"
              style={jpFont}
            >
              {t('skills.legend_sub')}
            </p>
          </div>
        </motion.div>
      ) : (
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
        // ── Diary mode: the night sky IS the section. ──
        // The 3D constellation (SkillsConstellation) fills this space;
        // the spacer below is the camera waypoint and stays transparent
        // to pointers so the stars themselves are hoverable.
        <>
          <motion.div
            className="text-center px-4 mb-2"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
          >
            <p
              className="inline-block handwritten text-ink/70 text-sm md:text-base bg-paper/85 px-4 py-1.5 wobbly-border-light"
              style={jpFont}
            >
              {t('skills.sky_hint')}
            </p>
          </motion.div>

          {/* Open sky — the waypoint that tilts the camera up at night */}
          <div
            data-map-waypoint="view-network"
            className="h-[85vh] md:h-[95vh]"
            aria-hidden="true"
          />

          {/* How to read this sky — glyph key matching the stars above */}
          <div className="max-w-3xl mx-auto px-4 relative z-20 pointer-events-auto">
            <motion.div
              className="map-panel px-5 py-4"
              style={{ background: 'rgba(255, 249, 229, 0.82)', backdropFilter: 'blur(1.5px)' }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-baseline justify-between gap-4 mb-2.5">
                <p className="artifact-label inline-block text-sepia" style={jpFont}>
                  {t('skills.key_title')}
                </p>
                <p className="handwritten text-xs text-ink/55 text-right" style={jpFont}>
                  {t('skills.size_note')}
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {categories.map((cat) => (
                  <li
                    key={cat.key}
                    className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors duration-150 hover:bg-ink/5 cursor-default"
                    onMouseEnter={() => {
                      sceneState.hoverCategory = cat.key;
                    }}
                    onMouseLeave={() => {
                      if (sceneState.hoverCategory === cat.key) {
                        sceneState.hoverCategory = null;
                      }
                    }}
                  >
                    <StarGlyph category={cat.key} color={cat.color} className="w-5 h-5 shrink-0" />
                    <span
                      className="handwritten text-sm capitalize"
                      style={{ color: cat.color, ...jpFont }}
                    >
                      {cat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Fun disclaimer */}
            <motion.div
              className="text-center mt-6"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p
                className="handwritten text-ink/60 italic inline-block bg-paper/80 px-4 py-2 rounded-lg"
                style={jpFont}
              >
                {t('skills.disclaimer')}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </section>
  );
}

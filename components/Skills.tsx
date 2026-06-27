'use client';

import {
  type ComponentType,
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

// Run the clamp before paint on the client (no flash of the off-screen popup),
// but fall back to useEffect on the server so SSR doesn't warn.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Skill {
  id?: string;
  name: string;
  level: number;
  category: string;
  tier?: string;
}

type InkGlyph = ComponentType<{ className?: string; color?: string }>;

/** A worn sepia for the unsurveyed "frontier" station — it has no entry in
 *  CATEGORY_COLORS because it isn't a charted category yet. */
const FRONTIER_COLOR = '#7E5A3C';
/** Cream the pin glyphs are drawn in, so the ink reads on the solid station. */
const PIN_GLYPH_INK = '#FFF9E5';

// The survey chart is drawn in a 1000×446 viewBox (≈ the wrap's 3250/1450
// aspect), so a station's % position maps straight onto chart coordinates.
const VIEW_W = 1000;
const VIEW_H = 446;

interface SkillGroup {
  id: string;
  /** Identifier hook for the popup anchor query + position class. */
  className: string;
  labelKey: string;
  color: string;
  Icon: InkGlyph;
  /** Skill ids resolved against content.skills for their localized names */
  skillIds: string[];
  /** ui-copy keys for skills not in content.skills (the frontier two) */
  chartKeys?: string[];
  frontier?: boolean;
  /** Station position as a % of the chart wrap (x = left, y = top). */
  xPct: number;
  yPct: number;
}

// Six stations triangulated across the survey of the toolkit. Coloured by
// CATEGORY_COLORS so they read against the rest of the map's legend; the
// frontier station is the uncharted AI edge (dashed, "still charting").
const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'mapping',
    className: '_1',
    labelKey: 'skills.group_mapping',
    color: CATEGORY_COLORS.mapping,
    Icon: InkCompass,
    skillIds: ['geo', 'mvt', 'wayfinding', 'maplibre'],
    xPct: 9,
    yPct: 36,
  },
  {
    id: 'data',
    className: '_2',
    labelKey: 'skills.group_data',
    color: CATEGORY_COLORS.database,
    Icon: InkDatabase,
    skillIds: ['postgis', 'redis'],
    xPct: 27,
    yPct: 16,
  },
  {
    id: 'frontend',
    className: '_3',
    labelKey: 'skills.group_frontend',
    color: CATEGORY_COLORS.frontend,
    Icon: InkBrackets,
    skillIds: ['react', 'ts', 'redux', 'threejs'],
    xPct: 45,
    yPct: 38,
  },
  {
    id: 'backend',
    className: '_4',
    labelKey: 'skills.group_backend',
    color: CATEGORY_COLORS.backend,
    Icon: InkServer,
    skillIds: ['node', 'python', 'sysdesign'],
    xPct: 60,
    yPct: 18,
  },
  {
    id: 'cloud',
    className: '_5',
    labelKey: 'skills.group_cloud',
    color: CATEGORY_COLORS.cloud,
    Icon: InkCloud,
    skillIds: ['azure', 'docker', 'cicd'],
    xPct: 74,
    yPct: 40,
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
    xPct: 89,
    yPct: 22,
  },
];

// Station centre in chart coordinates (the pin sits centred on its %).
const stationXY = (g: SkillGroup) => ({
  x: (g.xPct / 100) * VIEW_W,
  y: (g.yPct / 100) * VIEW_H,
});

/** A faint hand-inked survey chart: contour summits, the traverse that threads
 *  the stations, a north mark + scale bar. Purely decorative (the stations on
 *  top are the interactive layer), so it's aria-hidden. */
function SurveyChart() {
  const pts = SKILL_GROUPS.map(stationXY);
  // The traverse: a dashed survey line threading the stations in order, so the
  // route and the stations tell ONE story (the stations ARE the stops).
  const traverse = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(' ');

  // A few contour "summits" sat under stations so they read as charted ground.
  const summits = [
    { cx: 150, cy: 250, n: 4, rx: 70, ry: 40, rot: -8 },
    { cx: 470, cy: 250, n: 5, rx: 95, ry: 52, rot: 6 },
    { cx: 760, cy: 150, n: 4, rx: 78, ry: 44, rot: -4 },
    { cx: 880, cy: 320, n: 3, rx: 52, ry: 30, rot: 10 },
  ];

  return (
    <svg
      className="survey-chart"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-hidden="true"
    >
      {/* sheet + neat-line border (the survey sheet frame) */}
      <rect x="3" y="3" width={VIEW_W - 6} height={VIEW_H - 6} className="survey-sheet" />
      <rect x="12" y="12" width={VIEW_W - 24} height={VIEW_H - 24} className="survey-neatline" />

      {/* contour summits — concentric rings = charted elevation */}
      {summits.map((s, si) => (
        <g key={si} transform={`rotate(${s.rot} ${s.cx} ${s.cy})`} className="survey-contour-group">
          {Array.from({ length: s.n }).map((_, ri) => (
            <ellipse
              key={ri}
              cx={s.cx}
              cy={s.cy}
              rx={s.rx - ri * (s.rx / (s.n + 0.6))}
              ry={s.ry - ri * (s.ry / (s.n + 0.6))}
              className="survey-contour"
            />
          ))}
        </g>
      ))}

      {/* a low coastline/hatched valley sweeping across the lower sheet */}
      <path
        d="M40 360 Q220 330 400 362 T760 356 T980 372"
        className="survey-valley"
      />

      {/* the traverse threading the stations */}
      <path d={traverse} className="survey-traverse" />
      {/* a small bearing tick at each station node */}
      {pts.map((p, i) => (
        <g key={i} className="survey-node">
          <path d={`M${p.x - 13} ${p.y} L${p.x + 13} ${p.y} M${p.x} ${p.y - 13} L${p.x} ${p.y + 13}`} className="survey-node-cross" />
        </g>
      ))}

      {/* marginalia — north mark (top-left) + scale bar (bottom-right) */}
      <g className="survey-north" transform="translate(56 60)">
        <path d="M0 -22 L7 8 L0 1 L-7 8 Z" className="survey-north-needle" />
        <text x="0" y="-26" className="survey-north-label">N</text>
      </g>
      <g className="survey-scale" transform={`translate(${VIEW_W - 200} ${VIEW_H - 40})`}>
        <path d="M0 0 H140" className="survey-scale-bar" />
        {[0, 35, 70, 105, 140].map((x) => (
          <path key={x} d={`M${x} -5 V5`} className="survey-scale-tick" />
        ))}
      </g>
    </svg>
  );
}

export default function Skills() {
  const { isSerious } = useSeriousMode();
  const { content, t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const skills = content.skills as Skill[];

  // id → localized skill name, so a station's popup can list its tools.
  const skillNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const skill of skills) if (skill.id) map[skill.id] = skill.name;
    return map;
  }, [skills]);

  const activeGroup = SKILL_GROUPS.find((group) => group.id === activeGroupId);
  const popupId = 'skills-station-popup';

  const close = useCallback(() => setActiveGroupId(null), []);

  // The popup is anchored to its pin's actual position so it always tracks the
  // station wherever it sits, then nudged fully on-screen via --pop-dx/--pop-dy.
  const popupRef = useRef<HTMLDivElement>(null);
  const reposition = useCallback(() => {
    const el = popupRef.current;
    if (!el || !activeGroup) return;
    const pin = document.querySelector<HTMLElement>(
      `.skills-basecamp-pin-${activeGroup.className}`
    );
    const wrap = el.parentElement;
    if (pin && wrap) {
      const pr = pin.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      el.style.left = `${pr.left - wr.left + pr.width / 2}px`;
      el.style.top = `${pr.top - wr.top}px`;
      el.style.right = 'auto';
    }
    // Nudge fully on-screen.
    el.style.setProperty('--pop-dx', '0px');
    el.style.setProperty('--pop-dy', '0px');
    const r = el.getBoundingClientRect();
    const m = 8; // keep this much clear of every edge
    let dx = 0;
    let dy = 0;
    if (r.top < m) dy = m - r.top;
    else if (r.bottom > window.innerHeight - m) dy = window.innerHeight - m - r.bottom;
    if (r.left < m) dx = m - r.left;
    else if (r.right > window.innerWidth - m) dx = window.innerWidth - m - r.right;
    el.style.setProperty('--pop-dx', `${dx}px`);
    el.style.setProperty('--pop-dy', `${dy}px`);
  }, [activeGroup]);

  useIsoLayoutEffect(() => {
    if (!activeGroup) return;
    reposition();
  }, [activeGroup, reposition]);

  // Keep the popup anchored + on-screen while it's open: recompute on resize and
  // scroll (the clamp was previously open-once and could drift off the edge),
  // and close on Escape or an outside tap (the reliable touch-dismiss path).
  useEffect(() => {
    if (!activeGroup) return;
    const onResize = () => reposition();
    const onScroll = () => reposition();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const pin = document.querySelector<HTMLElement>(
          `.skills-basecamp-pin-${activeGroup.className}`
        );
        close();
        pin?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const wrap = popupRef.current?.parentElement;
      if (wrap && !wrap.contains(e.target as Node)) close();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [activeGroup, reposition, close]);

  const groupSkillNames = (group: SkillGroup): string[] => [
    ...group.skillIds.map((id) => skillNameById[id]).filter(Boolean),
    ...(group.chartKeys ?? []).map((key) => t(key)),
  ];

  return (
    <section
      className={isSerious ? 'py-20 relative' : 'skills-survey-section relative'}
      // While this section is centred, the persistent terrain backdrop dims its
      // pin labels + markers (CameraRig reads this) so they don't bleed through
      // the survey chart. Inert in serious mode (no 3D backdrop).
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
        <div className="skills-survey-inner">
          {/* Section header — shares the cartouche system with every other
              section so the four headers read as one designed set. */}
          <motion.div
            className="text-center mb-6 px-4 relative z-10"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
          >
            <div className="map-cartouche inline-block px-8 py-4 pointer-events-auto">
              <h2 className="diary-title text-3xl md:text-4xl text-ink inline-flex items-center gap-3">
                <InkCompass className="w-9 h-9 shrink-0 text-ink/80" />
                {t('skills.title_diary')}
              </h2>
            </div>
            {/* The hint fades out once a station is open, so it never competes
                with the popup card for the same patch of screen. */}
            <p
              className="section-subhint"
              style={{ opacity: activeGroup ? 0 : 1 }}
              aria-hidden={activeGroup ? true : undefined}
            >
              {t('skills.map_hint')}
            </p>
          </motion.div>

          <div className="skills-survey-stage">
            <motion.div
              className="skills-basecamp-map-wrap skills-survey-wrap"
              onMouseLeave={close}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' }}
            >
              <SurveyChart />

              {SKILL_GROUPS.map((group) => {
                const Icon = group.Icon;
                const isActive = group.id === activeGroupId;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`skills-basecamp-pin skills-basecamp-pin-${group.className}${
                      group.frontier ? ' skills-basecamp-pin-frontier' : ''
                    }${isActive ? ' skills-basecamp-pin-active' : ''}`}
                    style={{
                      backgroundColor: group.color,
                      left: `${group.xPct}%`,
                      top: `${group.yPct}%`,
                    }}
                    aria-label={t(group.labelKey)}
                    title={t(group.labelKey)}
                    aria-expanded={isActive}
                    aria-controls={isActive ? popupId : undefined}
                    // Hover/focus/tap all OPEN this station; the wrap's
                    // onMouseLeave + Escape + an outside tap close it. (A toggle
                    // on click would cancel the open that mouseenter/focus set.)
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
                  ref={popupRef}
                  id={popupId}
                  className={`skills-basecamp-popup skills-basecamp-popup-${activeGroup.className}`}
                  style={{ '--pin-color': activeGroup.color } as CSSProperties}
                  role="group"
                  aria-label={t(activeGroup.labelKey)}
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
                  {/* tether caret pointing down toward the station */}
                  <span className="skills-basecamp-popup-caret" aria-hidden="true" />
                </div>
              )}
            </motion.div>

            {/* Legend — names each station so a kit is identifiable before you
                open it (and survives the small station glyphs on mobile). */}
            <ul className="survey-legend">
              {SKILL_GROUPS.map((group) => (
                <li key={group.id}>
                  <span className="survey-legend-swatch" style={{ backgroundColor: group.color }} />
                  {t(group.labelKey)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

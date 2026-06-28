'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';

interface Section {
  id: string;
  label: string;
}

/* ═══════════════════════════════════════════════════════════════
   BOOKMARK TAB NAVIGATION

   Colored sticky tabs that poke out from the right edge of the
   page, like index tabs on a real notebook. The active section's
   tab slides out further and brightens.
   ═══════════════════════════════════════════════════════════════ */

// Desaturated vintage-map pigments — the tabs are paper artifacts too.
const TAB_COLORS = [
  { bg: '#B9A37E', text: '#2D2D2D' },  // Home — aged tan
  { bg: '#3B5F8A', text: '#FFF9E5' },  // Journey — prussian blue
  { bg: '#B05F66', text: '#FFF9E5' },  // Skills — oxide red
  { bg: '#7D6B8D', text: '#FFF9E5' },  // Peek — faded violet
  { bg: '#82A775', text: '#2D2D2D' },  // Contact — sage
];

export default function MapScrollNav() {
  const { isSerious } = useSeriousMode();
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState(0);

  const sections: Section[] = useMemo(() => [
    { id: 'hero', label: t('nav.home') },
    { id: 'timeline', label: t('nav.journey') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'sneakpeek', label: t('nav.peek') },
    { id: 'contact', label: t('nav.contact') },
  ], [t]);

  useEffect(() => {
    const handleScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= mid) { setActiveSection(i); break; }
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (i: number) => {
    const el = document.getElementById(sections[i].id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isSerious) {
    return (
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col gap-3">
          {sections.map((s, i) => (
            <button key={s.id} onClick={() => scrollToSection(i)}
              className={`h-3 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink ${activeSection === i ? 'bg-gray-800 w-10' : 'bg-gray-300 hover:bg-gray-500 w-3'}`}
              title={s.label} aria-label={s.label} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: bookmark tabs on right edge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-1.5">
        {sections.map((s, i) => {
          const isActive = activeSection === i;
          const color = TAB_COLORS[i];
          const tilt = [1.5, -1, 2, -1.5, 0.5][i];

          return (
            <motion.button
              key={s.id}
              onClick={() => scrollToSection(i)}
              className="relative cursor-pointer block text-right rounded-l-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
              style={{ transformOrigin: 'right center' }}
              animate={{
                x: isActive ? 0 : 55,
                rotate: isActive ? 0 : tilt,
              }}
              whileHover={{ x: 0, rotate: 0 }}
              whileFocus={{ x: 0, rotate: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 25 }
              }
              aria-label={s.label}
              aria-current={isActive ? 'true' : undefined}
              title={s.label}
            >
              {/* hand-cut paper index tab: irregular radius + ink stroke + the
                  offset hard ink-shadow used across the diary (not flat UI). */}
              <div
                className="px-4 py-2.5 handwritten text-sm font-bold whitespace-nowrap"
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  opacity: isActive ? 1 : 0.78,
                  border: '2px solid #2D2D2D',
                  borderRadius: '13px 5px 9px 7px',
                  boxShadow: isActive
                    ? '-3px 3px 0 rgba(45,45,45,0.28)'
                    : '-2px 2px 0 rgba(45,45,45,0.2)',
                  minWidth: '80px',
                }}
              >
                {s.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Mobile: colored dots + the active section's name for wayfinding,
          tucked top-left past the red margin line. Each dot carries a ~40px tap
          target (the serious-mode toggle now lives bottom-right, so the top-
          right is free of collisions). */}
      <div className="fixed top-3 left-16 z-50 flex md:hidden items-center gap-0.5 pl-2 pr-3 py-1 rounded-full"
        style={{ backgroundColor: 'rgba(255,249,229,0.9)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
      >
        {sections.map((s, i) => {
          const isActive = activeSection === i;
          const color = TAB_COLORS[i];
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(i)}
              className="flex items-center justify-center rounded-full focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              style={{ width: '28px', height: '40px' }}
              aria-label={s.label}
              aria-current={isActive ? 'true' : undefined}
            >
              <span
                className="block transition-[width,opacity] duration-300"
                style={{
                  width: isActive ? '22px' : '9px',
                  height: '9px',
                  borderRadius: '5px',
                  backgroundColor: color.bg,
                  border: '1px solid rgba(45,45,45,0.55)',
                  opacity: isActive ? 1 : 0.6,
                }}
              />
            </button>
          );
        })}
        <span className="handwritten text-xs font-bold text-ink/80 whitespace-nowrap pl-1 pr-0.5" aria-hidden="true">
          {sections[activeSection].label}
        </span>
      </div>
    </>
  );
}

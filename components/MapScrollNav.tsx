'use client';

import { useState, useEffect } from 'react';
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

const TAB_COLORS = [
  { bg: '#FFD700', text: '#2D2D2D' },  // Home — gold
  { bg: '#4A90D9', text: '#FFFFFF' },  // Journey — blue
  { bg: '#FF6B6B', text: '#FFFFFF' },  // Skills — coral
  { bg: '#9B59B6', text: '#FFFFFF' },  // Peek — purple
  { bg: '#2ECC71', text: '#FFFFFF' },  // Contact — green
];

export default function MapScrollNav() {
  const { isSerious } = useSeriousMode();
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState(0);

  const sections: Section[] = [
    { id: 'hero', label: t('nav.home') },
    { id: 'timeline', label: t('nav.journey') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'sneakpeek', label: t('nav.peek') },
    { id: 'contact', label: t('nav.contact') },
  ];

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
  }, []);

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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSection === i ? 'bg-gray-800 w-10' : 'bg-gray-300 hover:bg-gray-500'}`}
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
              className="relative cursor-pointer block text-right"
              style={{ transformOrigin: 'right center' }}
              animate={{
                x: isActive ? 0 : 55,
                rotate: isActive ? 0 : tilt,
              }}
              whileHover={{ x: 0, rotate: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 25 }
              }
              aria-label={s.label}
              title={s.label}
            >
              <div
                className="px-4 py-2.5 handwritten text-sm font-bold whitespace-nowrap shadow-md"
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  opacity: isActive ? 1 : 0.7,
                  borderRadius: '8px 0 0 8px',
                  boxShadow: isActive
                    ? '-3px 3px 8px rgba(0,0,0,0.25)'
                    : '-2px 2px 4px rgba(0,0,0,0.15)',
                  minWidth: '80px',
                }}
              >
                {s.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Mobile: colored dots at bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex md:hidden gap-2.5 px-4 py-2 rounded-full"
        style={{ backgroundColor: 'rgba(255,249,229,0.85)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
      >
        {sections.map((s, i) => {
          const isActive = activeSection === i;
          const color = TAB_COLORS[i];
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(i)}
              className="transition-all duration-300"
              style={{
                width: isActive ? '24px' : '10px',
                height: '10px',
                borderRadius: '5px',
                backgroundColor: color.bg,
                opacity: isActive ? 1 : 0.5,
              }}
              aria-label={s.label}
            />
          );
        })}
      </div>
    </>
  );
}

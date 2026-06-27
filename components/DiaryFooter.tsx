'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { avatarBox } from './avatarDimensions';
import { useSeriousMode } from '@/contexts/SeriousModeContext';

// Mirrored cartographer waving off the page edge.
const FOOTER_AVATAR = avatarBox('/avatar/waving_pose.webp', 72);
import { useTranslation } from '@/hooks/useTranslation';

export default function DiaryFooter() {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const jpFont = isJapanese
    ? ({ fontFamily: 'var(--font-jp-handwritten)' } as React.CSSProperties)
    : ({} as React.CSSProperties);

  if (isSerious) {
    return (
      <footer className="py-8 text-center font-sans text-sm text-gray-500">
        <p>{t('footer.copyright')}</p>
      </footer>
    );
  }

  return (
    <footer className="relative pt-4 pb-14 overflow-hidden">
      {/* Colophon — the mapmaker's imprint at the foot of the chart */}
      <motion.div
        className="relative z-10 mx-auto max-w-md flex flex-col items-center gap-1.5 pt-8 pb-6 px-6 pointer-events-auto text-center bg-[rgba(255,249,229,0.55)] rounded-2xl shadow-[2px_4px_0_rgba(45,45,45,0.07)]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="colophon" style={jpFont}>
          {t('footer.colophon')}
        </p>
        <p className="colophon opacity-75" style={jpFont}>
          {t('footer.edition')}
        </p>

        {/* Wobbly rule */}
        <div className="mt-3 mb-2" style={{ width: '170px', height: '4px' }}>
          <svg viewBox="0 0 150 4" className="w-full">
            <path
              d="M0 2 Q20 0 40 2 Q60 4 80 2 Q100 0 120 2 Q140 4 150 2"
              stroke="var(--ink)"
              strokeWidth="1"
              fill="none"
              opacity="0.25"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* The engraver's mark — how the chart was actually made */}
        <p className="handwritten text-ink/45 text-xs italic" style={jpFont}>
          {t('footer.tech')}
        </p>
        <p className="handwritten text-ink/60 text-sm" style={jpFont}>
          {t('footer.scribbled')}
        </p>

        <p className="handwritten text-ink/30 text-xs mt-1" style={jpFont}>
          {isJapanese ? 'おしまい' : '~ fin ~'}
        </p>
      </motion.div>

      {/* The cartographer walks off the east edge of the page — journey over */}
      <motion.div
        className="absolute bottom-4 right-0 translate-x-[38%] pointer-events-none select-none"
        aria-hidden="true"
        initial={shouldReduceMotion ? false : { opacity: 0, x: -14 }}
        whileInView={{ opacity: 0.9, x: 0 }}
        viewport={{ once: true }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.3 }}
      >
        <Image
          src="/avatar/waving_pose.webp"
          alt=""
          width={FOOTER_AVATAR.width}
          height={FOOTER_AVATAR.height}
          className="object-contain drop-shadow-lg"
          style={{ ...FOOTER_AVATAR.style, transform: 'scaleX(-1)' }}
        />
      </motion.div>
    </footer>
  );
}

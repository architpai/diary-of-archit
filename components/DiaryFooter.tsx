'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function DiaryFooter() {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  if (isSerious) {
    return (
      <footer className="py-8 text-center font-sans text-sm text-gray-500">
        <p>{t('footer.copyright')}</p>
      </footer>
    );
  }

  return (
    <footer className="relative pt-4 pb-16 overflow-hidden">
      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-center gap-4 md:gap-8 pt-12 px-4 pointer-events-auto">
        {/* Waving avatar — left side */}
        <div className="flex-shrink-0">
          <Image
            src="/avatar/waving_pose.webp"
            alt="Waving goodbye"
            width={80}
            height={104}
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Sign-off text — right side */}
        <motion.div
          className="text-center md:text-left"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            className="handwritten text-ink/70 text-lg mb-1"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {t('footer.scribbled')}
          </p>

          {/* Notebook rule line under the text */}
          <div className="mx-auto md:mx-0 mt-3 mb-2" style={{ width: '150px', height: '2px' }}>
            <svg viewBox="0 0 150 4" className="w-full">
              <path
                d="M0 2 Q20 0 40 2 Q60 4 80 2 Q100 0 120 2 Q140 4 150 2"
                stroke="var(--ink)"
                strokeWidth="1"
                fill="none"
                opacity="0.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="handwritten text-ink/30 text-xs">
            {isJapanese ? 'おしまい' : '~ fin ~'}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

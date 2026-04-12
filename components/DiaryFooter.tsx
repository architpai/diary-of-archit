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
    <footer className="relative pt-4 pb-16 overflow-hidden section-yellow">
      {/* Torn paper edge at top */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '20px', overflow: 'hidden' }}>
        <svg
          viewBox="0 0 1200 20"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ display: 'block' }}
        >
          <path
            d="M0 20 L0 8 Q30 12 60 6 Q90 0 120 8 Q150 14 180 6 Q210 2 240 10 Q270 16 300 7 Q330 0 360 9 Q390 15 420 5 Q450 0 480 8 Q510 14 540 6 Q570 0 600 10 Q630 16 660 5 Q690 0 720 8 Q750 13 780 6 Q810 0 840 9 Q870 15 900 7 Q930 0 960 8 Q990 14 1020 6 Q1050 0 1080 10 Q1110 15 1140 7 Q1170 2 1200 8 L1200 20 Z"
            fill="var(--paper)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-center gap-4 md:gap-8 pt-12 px-4">
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

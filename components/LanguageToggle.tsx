'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, isTransitioning } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ja' : 'en';
    setLanguage(newLanguage);
  };

  return (
    // will-change:transform promotes this to its own compositor layer so it
    // stays pinned during momentum/async scroll over the continuously-
    // repainting 3D canvas (mobile would otherwise drift it out and back).
    <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50 will-change-transform">
      <button
        onClick={toggleLanguage}
        disabled={isTransitioning}
        className={`wobbly-border bg-paper/95 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 shadow-lg transition-[opacity,transform,box-shadow] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink ${
          isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
        }`}
        aria-label={`Switch language to ${language === 'en' ? 'Japanese' : 'English'}`}
      >
        {/* The inactive language used to be struck through, so in English mode
            日本語 rendered crossed out. A strikethrough reads as "unavailable",
            not "click to switch", which is the wrong signal on the wrong control
            for a portfolio aimed at Japanese employers. In a real notebook you
            circle the option you chose; you do not cross out the alternative. */}
        <div className="flex items-center gap-1 md:gap-2">
          <span
            className={`lang-option text-sm md:text-lg ${
              language === 'en' ? 'lang-option-active' : 'text-sepia'
            }`}
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            EN
          </span>

          <span className="text-sm md:text-base text-ink/40" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            |
          </span>

          <span
            className={`lang-option text-sm md:text-lg ${
              language === 'ja' ? 'lang-option-active' : 'text-sepia'
            }`}
            style={{ fontFamily: "var(--font-jp-handwritten)" }}
          >
            日本語
          </span>
        </div>
      </button>
    </div>
  );
}

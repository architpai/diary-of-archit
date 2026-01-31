'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, isTransitioning } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ja' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50">
      <button
        onClick={toggleLanguage}
        disabled={isTransitioning}
        className={`wobbly-border bg-paper/95 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 shadow-lg transition-all ${
          isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-1 md:gap-2">
          <span 
            className={`text-sm md:text-lg ${
              language === 'en' 
                ? 'text-ink font-bold' 
                : 'text-ink/50 scribble-strikethrough'
            }`}
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            EN
          </span>

          <span className="text-sm md:text-base text-ink/30" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            |
          </span>

          <span 
            className={`text-sm md:text-lg ${
              language === 'ja' 
                ? 'text-ink font-bold' 
                : 'text-ink/50 scribble-strikethrough'
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

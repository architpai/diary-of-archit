'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  targetLanguage: Language;
  setLanguage: (lang: Language) => void;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [targetLanguage, setTargetLanguage] = useState<Language>('en');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Resolve the language on mount: an explicit stored choice always wins, and
  // failing that, fall back to what the browser asks for. A portfolio aimed at
  // employers in Osaka used to open in English for a Japanese visitor no matter
  // what their browser said, and only ever offered the switch as a control they
  // had to notice.
  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem('diary-language');
      // 'jp' is a legacy value from an earlier build; normalise it.
      const explicit = stored === 'jp' ? 'ja' : stored;
      if (explicit === 'ja' || explicit === 'en') {
        if (stored !== explicit) localStorage.setItem('diary-language', explicit);
        setLanguageState(explicit);
        setTargetLanguage(explicit);
        return;
      }

      const prefersJapanese = (navigator.languages ?? [navigator.language]).some(
        (tag) => typeof tag === 'string' && tag.toLowerCase().startsWith('ja'),
      );
      if (prefersJapanese) {
        setLanguageState('ja');
        setTargetLanguage('ja');
      }
    });
  }, []);

  const setLanguage = (lang: Language) => {
    if (lang === language || isTransitioning) return;
    
    setIsTransitioning(true);
    setTargetLanguage(lang);
    localStorage.setItem('diary-language', lang);
    
    // Delay actual state change until animation midpoint
    setTimeout(() => {
      setLanguageState(lang);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 500); // Half of 1s animation
  };

  return (
    <LanguageContext.Provider value={{ language, targetLanguage, setLanguage, isTransitioning }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

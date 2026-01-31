'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'jp';

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

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('diary-language');
    if (stored === 'jp' || stored === 'en') {
      setLanguageState(stored as Language);
      setTargetLanguage(stored as Language);
    }
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

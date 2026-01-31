'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

export default function LanguageHtmlWrapper() {
  const { language } = useLanguage();

  useEffect(() => {
    // Update the html lang attribute when language changes
    document.documentElement.lang = language;
  }, [language]);

  return null; // This component doesn't render anything
}

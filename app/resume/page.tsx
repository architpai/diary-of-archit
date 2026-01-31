'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import ResumeEN from '@/components/resume/ResumeEN';
import ResumeJP from '@/components/resume/ResumeJP';
import SeriousModeToggle from '@/components/SeriousModeToggle';
import LanguageToggle from '@/components/LanguageToggle';

export default function ResumePage() {
  const { language } = useLanguage();
  
  return (
    <>
      <LanguageToggle />
      <SeriousModeToggle />
      {language === 'ja' ? <ResumeJP /> : <ResumeEN />}
    </>
  );
}

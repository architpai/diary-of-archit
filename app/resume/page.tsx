'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import ResumeEN from '@/components/resume/ResumeEN';
import ResumeJP from '@/components/resume/ResumeJP';
import SeriousModeToggle from '@/components/SeriousModeToggle';

export default function ResumePage() {
  const { language } = useLanguage();
  
  return (
    <>
      <SeriousModeToggle />
      {language === 'jp' ? <ResumeJP /> : <ResumeEN />}
    </>
  );
}

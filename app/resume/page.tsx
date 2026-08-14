'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import ResumeEN from '@/components/resume/ResumeEN';
import ResumeJP from '@/components/resume/ResumeJP';
import Rirekisho from '@/components/resume/Rirekisho';
import SeriousModeToggle from '@/components/SeriousModeToggle';
import LanguageToggle from '@/components/LanguageToggle';

type JpDoc = 'shokumu' | 'rirekisho';

export default function ResumePage() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [jpDoc, setJpDoc] = useState<JpDoc>('shokumu');

  return (
    <>
      <LanguageToggle />
      <SeriousModeToggle />

      {/* JP-only document switcher: 職務経歴書 ⇄ 履歴書. Hidden in print so only
          the active document reaches the page. */}
      {language === 'ja' && (
        <div className="print:hidden fixed top-2 left-2 md:top-4 md:left-4 z-50 flex items-center gap-1 rounded-lg bg-white/95 backdrop-blur-sm p-1 shadow-lg border border-gray-300">
          {(['shokumu', 'rirekisho'] as const).map((doc) => (
            <button
              key={doc}
              onClick={() => setJpDoc(doc)}
              aria-pressed={jpDoc === doc}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                jpDoc === doc
                  ? 'bg-black text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{ fontFamily: 'var(--font-jp-clean), "Noto Sans JP", sans-serif' }}
            >
              {doc === 'shokumu' ? t('resume.doc_shokumu') : t('resume.doc_rirekisho')}
            </button>
          ))}
        </div>
      )}

      {language === 'ja'
        ? jpDoc === 'rirekisho'
          ? <Rirekisho />
          : <ResumeJP />
        : <ResumeEN />}
    </>
  );
}

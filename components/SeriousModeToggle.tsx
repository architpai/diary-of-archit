'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function SeriousModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, isJapanese } = useTranslation();
  const isOnResume = pathname === '/resume';

  const handleToggle = () => {
    if (isOnResume) {
      router.push('/');
    } else {
      router.push('/resume');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`print:hidden fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-lg transition-all duration-300 font-sans text-sm font-medium shadow-lg isolate ${
        isOnResume ? '' : 'wobble-hover'
      }`}
      style={{
        backgroundColor: isOnResume ? '#2D2D2D' : '#FFF9E5',
        color: isOnResume ? 'white' : '#2D2D2D',
        border: isOnResume ? 'none' : '2px solid #2D2D2D',
        borderRadius: isOnResume ? '8px' : '255px 15px 225px 15px/15px 225px 15px 255px',
      }}
      aria-label={isOnResume ? 'Switch to Fun Mode' : 'Switch to Serious Mode'}
    >
      {isOnResume ? (
        <span 
          className="flex items-center gap-2"
          style={isJapanese ? { fontFamily: 'var(--font-jp-clean)' } : {}}
        >
          {t('mode.fun')}
        </span>
      ) : (
        <span 
          className="flex items-center gap-2 text-lg" 
          style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : { fontFamily: "'Patrick Hand', cursive" }}
        >
          {t('mode.serious')}
        </span>
      )}
    </button>
  );
}

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { InkNib, InkTie } from './icons/InkIcons';

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
      className={`print:hidden fixed top-14 right-4 md:top-auto md:bottom-6 md:right-6 z-[9999] px-3 py-2 md:px-4 md:py-3 rounded-lg transition-[background-color,color,border-color,box-shadow,transform] duration-300 font-sans text-sm font-medium shadow-lg isolate focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink ${
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
          <InkNib className="w-5 h-5 md:hidden" color="#FFF9E5" />
          <span className="hidden md:inline-flex items-center gap-2">
            <InkNib className="w-4 h-4" color="#FFF9E5" />
            {t('mode.fun')}
          </span>
        </span>
      ) : (
        <span 
          className="flex items-center gap-2 text-lg" 
          style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : { fontFamily: "'Patrick Hand', cursive" }}
        >
          <InkTie className="w-5 h-5 md:hidden" color="#2D2D2D" />
          <span className="hidden md:inline-flex items-center gap-2">
            <InkTie className="w-4 h-4" color="#2D2D2D" />
            {t('mode.serious')}
          </span>
        </span>
      )}
    </button>
  );
}

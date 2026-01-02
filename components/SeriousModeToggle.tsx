'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function SeriousModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
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
      className="print:hidden fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-lg transition-all duration-300 font-sans text-sm font-medium shadow-lg"
      style={{
        backgroundColor: isOnResume ? '#2D2D2D' : '#FFF9E5',
        color: isOnResume ? 'white' : '#2D2D2D',
        border: isOnResume ? 'none' : '2px solid #2D2D2D',
        borderRadius: isOnResume ? '8px' : '255px 15px 225px 15px/15px 225px 15px 255px',
      }}
      aria-label={isOnResume ? 'Switch to Fun Mode' : 'Switch to Serious Mode'}
    >
      {isOnResume ? (
        <span className="flex items-center gap-2">
          🎨 Fun Mode
        </span>
      ) : (
        <span className="flex items-center gap-2 text-lg" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          👔 Serious Mode
        </span>
      )}
    </button>
  );
}

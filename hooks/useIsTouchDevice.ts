import { useSyncExternalStore } from 'react';

const QUERY = '(pointer: coarse)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  window.addEventListener('resize', onChange);
  return () => {
    mq.removeEventListener('change', onChange);
    window.removeEventListener('resize', onChange);
  };
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches || window.innerWidth < 768;
}

// SSR has no viewport; assume non-touch so the server markup matches the
// desktop-default first client render, then resolve on hydration.
function getServerSnapshot() {
  return false;
}

/**
 * True on touch / small-screen devices, kept in sync via matchMedia + resize.
 * Use it to *downgrade* expensive effects on mobile (e.g. scroll-linked
 * springs), not to gate first-paint layout.
 */
export function useIsTouchDevice() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

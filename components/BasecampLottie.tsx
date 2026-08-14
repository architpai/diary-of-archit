'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { AnimationItem } from 'lottie-web';

interface BasecampLottieProps {
  className?: string;
  path: string;
  loop?: boolean;
  autoplay?: boolean;
}

export default function BasecampLottie({
  className,
  path,
  loop = true,
  autoplay = true,
}: BasecampLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  // The folded map is an 880KB JSON for a section around 6,000px down the page.
  // Nothing above the fold needs it, so it waits until the reader is heading
  // that way rather than competing with the terrain for bandwidth on arrival.
  const [inRange, setInRange] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInRange(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInRange(true);
          observer.disconnect();
        }
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let animation: AnimationItem | undefined;
    let isDisposed = false;
    const container = containerRef.current;

    if (!container || !inRange) return;

    const loadAnimation = async () => {
      const lottie = (await import('lottie-web')).default;

      if (isDisposed) return;

      animation = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: shouldReduceMotion ? false : loop,
        autoplay: shouldReduceMotion ? false : autoplay,
        path,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: true,
        },
      });

      if (shouldReduceMotion) {
        animation.addEventListener('DOMLoaded', () => {
          animation?.goToAndStop(Math.max(animation.totalFrames - 1, 0), true);
        });
      }
    };

    loadAnimation();

    return () => {
      isDisposed = true;
      animation?.destroy();
      container.textContent = '';
    };
  }, [autoplay, inRange, loop, path, shouldReduceMotion]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}

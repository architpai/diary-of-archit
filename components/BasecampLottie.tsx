'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    let animation: AnimationItem | undefined;
    let isDisposed = false;
    const container = containerRef.current;

    if (!container) return;

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
  }, [autoplay, loop, path, shouldReduceMotion]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}

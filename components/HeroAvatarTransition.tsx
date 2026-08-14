"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroAvatarTransitionProps {
  width: number;
  height: number;
  className?: string;
}

const FIRST_FRAME = 1;
const LAST_FRAME = 40;

/** The two poses the avatar actually rests in: frame 1 is EN, frame 40 is JA. */
function restFrame(language: "en" | "ja") {
  return language === "ja" ? LAST_FRAME : FIRST_FRAME;
}

function frameSrc(frame: number) {
  return `/avatar/sequence/ezgif-frame-${frame.toString().padStart(3, "0")}.webp`;
}

/**
 * The cartographer, who changes clothes when the page changes language.
 *
 * The 40-frame sequence is 2.6 MB and only ever plays if someone presses the
 * language toggle, so it is NOT on the critical path: mount loads the single
 * resting frame, and the rest of the sequence is fetched during idle time (or
 * on demand if the toggle is pressed first). Under reduced motion the sequence
 * is never fetched at all, because the transition snaps.
 */
export default function HeroAvatarTransition({
  width,
  height,
  className = "",
}: HeroAvatarTransitionProps) {
  const { targetLanguage } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [currentFrame, setCurrentFrame] = useState(() => restFrame(targetLanguage));
  const [sequenceReady, setSequenceReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const currentFrameRef = useRef(restFrame(targetLanguage));
  const imagesRef = useRef<Record<number, HTMLImageElement>>({});
  const pendingRef = useRef<Record<number, Promise<void>>>({});
  const previousTargetRef = useRef<"en" | "ja">(targetLanguage);
  const pixelRatioRef = useRef(1);

  const updateCanvasResolution = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    pixelRatioRef.current = ratio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }, [height, width]);

  const drawFrame = useCallback(
    (frame: number) => {
      const canvas = canvasRef.current;
      const image = imagesRef.current[frame];
      if (!canvas || !image) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      const pixelRatio = pixelRatioRef.current;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
    },
    [height, width],
  );

  /** Fetch one frame, de-duplicating concurrent requests for the same index. */
  const loadFrame = useCallback((frame: number) => {
    if (imagesRef.current[frame]) return Promise.resolve();
    const inFlight = pendingRef.current[frame];
    if (inFlight) return inFlight;

    const promise = new Promise<void>((resolve) => {
      const img = new window.Image();
      img.decoding = "sync";
      img.onload = async () => {
        try {
          await img.decode();
        } catch {
          // Fall back to the browser's own decode timing.
        }
        imagesRef.current[frame] = img;
        resolve();
      };
      img.onerror = () => resolve(); // a missing frame must not stall the toggle
      img.src = frameSrc(frame);
    });

    pendingRef.current[frame] = promise;
    return promise;
  }, []);

  const loadSequence = useCallback(async () => {
    const frames = [];
    for (let i = FIRST_FRAME; i <= LAST_FRAME; i++) frames.push(loadFrame(i));
    await Promise.all(frames);
    setSequenceReady(true);
  }, [loadFrame]);

  // Mount: the resting pose only, so the polaroid fills in with one small image.
  useEffect(() => {
    let cancelled = false;
    const frame = restFrame(targetLanguage);
    loadFrame(frame).then(() => {
      if (cancelled) return;
      currentFrameRef.current = frame;
      setCurrentFrame(frame);
      updateCanvasResolution();
      drawFrame(frame);
    });
    return () => {
      cancelled = true;
    };
    // targetLanguage is intentionally omitted: this is the first-paint pose, and
    // later language changes are handled by the transition effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawFrame, loadFrame, updateCanvasResolution]);

  // Warm the rest of the sequence once the page is idle. Reduced motion snaps
  // between poses, so it never needs the in-between frames.
  useEffect(() => {
    if (shouldReduceMotion) return;
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => void loadSequence(), { timeout: 4000 });
      return () => w.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(() => void loadSequence(), 2500);
    return () => window.clearTimeout(timer);
  }, [loadSequence, shouldReduceMotion]);

  useEffect(() => {
    updateCanvasResolution();
    drawFrame(currentFrameRef.current);
    const onResize = () => {
      updateCanvasResolution();
      drawFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawFrame, updateCanvasResolution]);

  useEffect(() => {
    currentFrameRef.current = currentFrame;
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  // Animate between poses when the language changes.
  useEffect(() => {
    if (previousTargetRef.current === targetLanguage) return;
    previousTargetRef.current = targetLanguage;

    const targetFrame = restFrame(targetLanguage);
    const startFrame = currentFrameRef.current;

    // No in-between frames yet (or none wanted): fetch just the destination pose
    // and cut to it. The sequence keeps warming in the background, so a second
    // toggle animates properly.
    if (shouldReduceMotion || !sequenceReady) {
      if (!sequenceReady && !shouldReduceMotion) void loadSequence();
      let cancelled = false;
      loadFrame(targetFrame).then(() => {
        if (cancelled) return;
        currentFrameRef.current = targetFrame;
        setCurrentFrame(targetFrame);
      });
      return () => {
        cancelled = true;
      };
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const durationMs = 950;
    const startedAt = performance.now();
    const frameDistance = targetFrame - startFrame;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const nextFrame = Math.round(startFrame + frameDistance * progress);

      if (nextFrame !== currentFrameRef.current) {
        currentFrameRef.current = nextFrame;
        setCurrentFrame(nextFrame);
      }

      if (progress >= 1) {
        setCurrentFrame(targetFrame);
        currentFrameRef.current = targetFrame;
        animationRef.current = null;
        return;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetLanguage, sequenceReady, shouldReduceMotion, loadFrame, loadSequence]);

  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
      aria-label="Archit's Avatar"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto drop-shadow-2xl object-contain"
      />
    </div>
  );
}

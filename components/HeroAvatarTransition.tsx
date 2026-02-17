"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroAvatarTransitionProps {
  width: number;
  height: number;
  className?: string;
}

export default function HeroAvatarTransition({
  width,
  height,
  className = "",
}: HeroAvatarTransitionProps) {
  const { targetLanguage } = useLanguage();
  const firstFrame = 1;
  const lastFrame = 40;
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentFrameRef = useRef(1);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const previousTargetRef = useRef<"en" | "ja">("en");
  const targetLanguageRef = useRef<"en" | "ja">(targetLanguage);
  const shouldReduceMotion = useReducedMotion();
  const pixelRatioRef = useRef(1);

  const updateCanvasResolution = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    pixelRatioRef.current = ratio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }, [height, width]);

  const drawFrame = useCallback((frame: number) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frame];
    if (!canvas || !image) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const pixelRatio = pixelRatioRef.current;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
  }, [height, width]);

  useEffect(() => {
    targetLanguageRef.current = targetLanguage;
  }, [targetLanguage]);

  // Preload all frames on mount
  useEffect(() => {
    const preloadImages = async () => {
      const promises = [];
      for (let i = firstFrame; i <= lastFrame; i++) {
        const img = new window.Image();
        img.decoding = "sync";
        const frameNum = i.toString().padStart(3, "0");
        imagesRef.current[i] = img;
        promises.push(
          new Promise<void>((resolve) => {
            img.onload = async () => {
              try {
                await img.decode();
              } catch {
                // Ignore decode issues and keep rendering with browser fallback decoding.
              }
              resolve();
            };
            img.onerror = () => resolve(); // Continue even if one fails
          }),
        );
        img.src = `/avatar/sequence/ezgif-frame-${frameNum}.webp`;
      }
      await Promise.all(promises);
      const initialFrame = targetLanguageRef.current === "ja" ? lastFrame : firstFrame;
      currentFrameRef.current = initialFrame;
      setCurrentFrame(initialFrame);
      previousTargetRef.current = targetLanguageRef.current;
      setIsLoaded(true);
    };

    preloadImages();
  }, [firstFrame, lastFrame]);

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
    if (isLoaded) {
      drawFrame(currentFrame);
    }
  }, [currentFrame, drawFrame, isLoaded]);

  // Animate through frames when target language changes
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (previousTargetRef.current === targetLanguage) {
      return;
    }

    const targetFrame = targetLanguage === "ja" ? lastFrame : firstFrame;
    const startFrame = currentFrameRef.current;

    if (shouldReduceMotion) {
      animationRef.current = requestAnimationFrame(() => {
        currentFrameRef.current = targetFrame;
        setCurrentFrame(targetFrame);
        animationRef.current = null;
      });
      previousTargetRef.current = targetLanguage;
      return;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    previousTargetRef.current = targetLanguage;

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
  }, [targetLanguage, isLoaded, shouldReduceMotion]);

  return (
    <motion.div
      className={`relative ${className}`}
      animate={
        shouldReduceMotion
          ? undefined
          : {
              y: [0, -15, 0],
            }
      }
      transition={
        shouldReduceMotion
          ? undefined
          : {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
      style={{ aspectRatio: `${width} / ${height}` }}
      aria-label="Archit's Avatar"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto drop-shadow-2xl object-contain"
      />
    </motion.div>
  );
}

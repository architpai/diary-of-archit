"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroAvatarTransitionProps {
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}

export default function HeroAvatarTransition({
  width,
  height,
  className = "",
  sizes,
}: HeroAvatarTransitionProps) {
  const { targetLanguage, isTransitioning } = useLanguage();
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const previousTargetRef = useRef<"en" | "ja">("en");
  const shouldReduceMotion = useReducedMotion();

  // Preload all frames on mount
  useEffect(() => {
    const preloadImages = async () => {
      const promises = [];
      for (let i = 1; i <= 40; i++) {
        const img = new window.Image();
        const frameNum = i.toString().padStart(3, "0");
        img.src = `/avatar/sequence/ezgif-frame-${frameNum}.webp`;
        imagesRef.current[i] = img;
        promises.push(
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
          }),
        );
      }
      await Promise.all(promises);
      setIsLoaded(true);
    };

    preloadImages();
  }, []);

  // Animate through frames when target language changes
  useEffect(() => {
    if (!isLoaded) {
      setCurrentFrame(targetLanguage === "en" ? 1 : 40);
      previousTargetRef.current = targetLanguage;
      return;
    }

    if (previousTargetRef.current === targetLanguage) {
      return;
    }

    const targetFrame = targetLanguage === "ja" ? 40 : 1;

    if (shouldReduceMotion) {
      setCurrentFrame(targetFrame);
      previousTargetRef.current = targetLanguage;
      return;
    }

    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    const startFrame = targetLanguage === "ja" ? 1 : 40;
    const direction = targetLanguage === "ja" ? 1 : -1;

    let frame = startFrame;
    setCurrentFrame(frame);
    previousTargetRef.current = targetLanguage;

    const frameInterval = 25;

    animationRef.current = setInterval(() => {
      frame += direction;

      if (
        (direction === 1 && frame > targetFrame) ||
        (direction === -1 && frame < targetFrame)
      ) {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        setCurrentFrame(targetFrame);
        return;
      }

      setCurrentFrame(frame);
    }, frameInterval);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetLanguage, isLoaded, shouldReduceMotion]);

  const frameNum = currentFrame.toString().padStart(3, "0");
  const frameSrc = `/avatar/sequence/ezgif-frame-${frameNum}.webp`;

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
    >
      <Image
        src={frameSrc}
        alt="Archit's Avatar"
        width={width}
        height={height}
        priority
        sizes={sizes}
        className="w-full h-auto drop-shadow-2xl object-contain"
      />
    </motion.div>
  );
}

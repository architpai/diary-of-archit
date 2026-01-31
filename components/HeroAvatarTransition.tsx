"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroAvatarTransitionProps {
  width: number;
  height: number;
}

export default function HeroAvatarTransition({
  width,
  height,
}: HeroAvatarTransitionProps) {
  const { targetLanguage, isTransitioning } = useLanguage();
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const previousTargetRef = useRef<"en" | "jp">("en");

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
      // Set initial frame based on target language
      setCurrentFrame(targetLanguage === "en" ? 1 : 40);
      previousTargetRef.current = targetLanguage;
      return;
    }

    // If target hasn't changed, don't animate
    if (previousTargetRef.current === targetLanguage) {
      return;
    }

    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    const targetFrame = targetLanguage === "jp" ? 40 : 1;
    const startFrame = targetLanguage === "jp" ? 1 : 40;
    const direction = targetLanguage === "jp" ? 1 : -1;

    let frame = startFrame;
    setCurrentFrame(frame);
    previousTargetRef.current = targetLanguage;

    const frameInterval = 25; // 25ms per frame = 1000ms total for 40 frames

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
  }, [targetLanguage, isLoaded]);

  const frameNum = currentFrame.toString().padStart(3, "0");
  const frameSrc = `/avatar/sequence/ezgif-frame-${frameNum}.webp`;

  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Image
        src={frameSrc}
        alt="Archit's Avatar"
        width={width}
        height={height}
        priority
        className="drop-shadow-2xl object-contain"
      />
    </motion.div>
  );
}

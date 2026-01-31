"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroAvatarTransition from "./HeroAvatarTransition";
import BlobDivider from "./BlobDivider";
import FloatingDoodles from "./FloatingDoodles";
import { useSeriousMode } from "@/contexts/SeriousModeContext";
import { useTranslation } from "@/hooks/useTranslation";

export default function Hero() {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className={`min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden ${!isSerious ? "section-yellow" : ""}`}
    >
      {/* Floating Background Doodles */}
      {!isSerious && <FloatingDoodles variant="code" density="normal" />}

      {/* Large corner doodles */}
      {!isSerious && (
        <>
          <motion.div
            className="absolute top-10 right-10 text-8xl opacity-30 hidden md:block"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -20, 0],
                    rotate: [0, 10, 0],
                  }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            💻
          </motion.div>
          <motion.div
            className="absolute bottom-32 left-10 text-7xl opacity-25 hidden md:block"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -15, 0],
                    rotate: [0, -5, 0],
                  }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : {
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }
            }
          >
            ⚡
          </motion.div>
          <motion.div
            className="absolute top-1/4 left-[5%] text-5xl opacity-20"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                  }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }
            }
          >
            {"{ }"}
          </motion.div>
          <motion.div
            className="absolute top-[15%] right-[20%] text-4xl opacity-20 font-mono"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    rotate: [0, 360],
                  }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 20, repeat: Infinity, ease: "linear" }
            }
          >
            ⚙️
          </motion.div>
        </>
      )}

      {/* Main Content */}
        <motion.div
          className="text-center z-10 relative"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
          animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
        >
        {/* Title with enhanced hand-drawn style */}
          <motion.div
            className="mb-8"
            initial={shouldReduceMotion ? false : { scale: 0.8 }}
            animate={shouldReduceMotion ? { scale: 1 } : { scale: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
          >
          <h1
            className={`diary-title ${!isSerious ? 'text-ink drop-shadow-lg' : 'text-ink'}`}
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            <motion.span
              className="block"
              initial={shouldReduceMotion ? false : { x: -50, opacity: 0 }}
              animate={shouldReduceMotion ? { x: 0, opacity: 1 } : { x: 0, opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
            >
              {t('hero.diary')}
            </motion.span>
            <motion.span
              className={`block ${!isSerious ? 'text-white text-shadow-outline' : 'text-margin-blue'}`}
              initial={shouldReduceMotion ? false : { x: 50, opacity: 0 }}
              animate={shouldReduceMotion ? { x: 0, opacity: 1 } : { x: 0, opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
              style={
                !isSerious
                  ? {
                      textShadow:
                        '2px 2px 0 #2D2D2D, -2px -2px 0 #2D2D2D, 2px -2px 0 #2D2D2D, -2px 2px 0 #2D2D2D',
                    }
                  : {}
              }
            >
              {t('hero.of')}
            </motion.span>
            <motion.span
              className={`block ${!isSerious ? 'scribble-underline' : 'underline-sketch'}`}
              initial={shouldReduceMotion ? false : { y: 30, opacity: 0 }}
              animate={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
            >
              {t('hero.name')}
            </motion.span>
          </h1>
        </motion.div>

        {/* Avatar - larger and more prominent */}
        <motion.div
          className="my-8 flex justify-center relative"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.5 }}
          animate={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
        >
          {/* Background circle decoration */}
          {!isSerious && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 30, repeat: Infinity, ease: "linear" }
              }
            >
              <div className="w-96 h-96 rounded-full border-4 border-dashed border-white/30" />
            </motion.div>
          )}
          <HeroAvatarTransition
            width={400}
            height={540}
            className="w-[240px] sm:w-[300px] md:w-[360px] lg:w-[400px]"
            sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, (max-width: 1024px) 360px, 400px"
          />
        </motion.div>

        {/* Subtitle with enhanced styling */}
        <motion.div
          className={`relative inline-block ${!isSerious ? "wobbly-border bg-paper/90 px-6 py-3" : ""}`}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
        >
          <p 
            className={`diary-subtitle ${isSerious ? '' : 'shaky-pencil'} max-w-md mx-auto handwritten`}
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {t('hero.subtitle')}
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="mt-16"
          animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 1.5, repeat: Infinity }}
        >
          <div
            className={`handwritten ${!isSerious ? 'text-ink' : 'text-ink/60'}`}
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            {t('hero.scroll')}
          </div>
        </motion.div>
      </motion.div>

      {/* Blob Wave Divider at bottom */}
      {!isSerious && (
        <BlobDivider position="bottom" fillColor="var(--paper)" variant={1} />
      )}
    </section>
  );
}

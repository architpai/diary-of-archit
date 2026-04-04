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
      className={`min-h-[70vh] md:min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-hidden ${!isSerious ? "section-yellow" : ""}`}
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
        {/* Title with CSS handwriting animation */}
        <div className="mb-8">
          <h1
            className={`diary-title ${!isSerious ? 'text-ink drop-shadow-lg' : 'text-ink'}`}
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          >
            <span className={`block${shouldReduceMotion ? '' : ' handwrite-reveal'}`}>
              {t('hero.diary')}
            </span>
            <span
              className={`block ${!isSerious ? 'text-white text-shadow-outline' : 'text-margin-blue'}${shouldReduceMotion ? '' : ' handwrite-reveal-delay-1'}`}
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
            </span>
            <span
              className={`block ${!isSerious ? 'scribble-underline-animated relative' : 'underline-sketch'}${shouldReduceMotion ? '' : ' handwrite-reveal-delay-2'}`}
            >
              {t('hero.name')}
            </span>
          </h1>
        </div>

        {/* Avatar - slightly reduced sizes for better above-fold fit */}
        <motion.div
          className="my-4 md:my-6 flex justify-center relative"
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
              <div className="w-72 md:w-96 h-72 md:h-96 rounded-full border-4 border-dashed border-white/30" />
            </motion.div>
          )}
          <HeroAvatarTransition
            width={800}
            height={1080}
            className="w-[180px] sm:w-[220px] md:w-[300px] lg:w-[360px]"
          />
        </motion.div>

        {/* Tagline and professional subtitle wrapped together */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
        >
          {/* Tagline box */}
          <div
            className={`relative inline-block ${!isSerious ? "wobbly-border bg-paper/90 px-6 py-3" : ""}`}
          >
            <p
              className={`diary-subtitle ${isSerious ? '' : 'shaky-pencil'} max-w-md mx-auto handwritten`}
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Professional subtitle */}
          {!isSerious && (
            <motion.p
              className="mt-3 text-ink/60 handwritten text-base md:text-lg tracking-wide"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 1.6 }}
            >
              {t('hero.subtitle_role')}
            </motion.p>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="mt-8 md:mt-12"
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

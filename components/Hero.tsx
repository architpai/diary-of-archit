"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroAvatarTransition from "./HeroAvatarTransition";
import BlobDivider from "./BlobDivider";
import TerrainHero from "./hero3d/TerrainHero";
import { useSeriousMode } from "@/contexts/SeriousModeContext";
import { useTranslation } from "@/hooks/useTranslation";

function HeroTitle({ compact }: { compact?: boolean }) {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <h1
      className={`diary-title text-ink ${!isSerious && compact ? "!text-5xl md:!text-7xl drop-shadow-lg" : ""}`}
      style={isJapanese ? { fontFamily: "var(--font-jp-handwritten)" } : {}}
    >
      <span className={`block${shouldReduceMotion ? "" : " handwrite-reveal"}`}>
        {t("hero.diary")}
      </span>
      <span
        className={`block ${!isSerious ? "text-white" : "text-margin-blue"}${shouldReduceMotion ? "" : " handwrite-reveal-delay-1"}`}
        style={
          !isSerious
            ? {
                textShadow:
                  "2px 2px 0 #2D2D2D, -2px -2px 0 #2D2D2D, 2px -2px 0 #2D2D2D, -2px 2px 0 #2D2D2D",
              }
            : {}
        }
      >
        {t("hero.of")}
      </span>
      <span
        className={`block ${!isSerious ? "scribble-underline-animated relative" : "underline-sketch"}${shouldReduceMotion ? "" : " handwrite-reveal-delay-2"}`}
      >
        {t("hero.name")}
      </span>
    </h1>
  );
}

/** Playful hero: the page itself is a hand-drawn map of Kanto. */
function FieldNotebookHero() {
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const jpFont = isJapanese ? { fontFamily: "var(--font-jp-handwritten)" } : {};

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* The map: real Kanto elevation data, ink-and-pencil shader */}
      <TerrainHero />
      <div className="terrain-hero-vignette absolute inset-0 pointer-events-none" />

      {/* Overlay content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pointer-events-none px-4 pt-14 md:pt-16 pb-10">
        {/* Field-notes annotation */}
        <motion.p
          className="hidden md:block absolute top-24 left-8 max-w-[230px] handwritten text-ink/60 text-sm leading-snug -rotate-2"
          style={jpFont}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          ↖ {t("hero.map_note")}
        </motion.p>

        <motion.div
          className="text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
        >
          <HeroTitle compact />

          <motion.div
            className="mt-4 inline-block wobbly-border bg-paper/90 px-5 py-2.5 backdrop-blur-[2px]"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
          >
            <p className="diary-subtitle handwritten max-w-md mx-auto" style={jpFont}>
              {t("hero.subtitle")}
            </p>
            <p className="mt-1 text-ink/60 handwritten text-sm md:text-base tracking-wide" style={jpFont}>
              {t("hero.subtitle_role")}
            </p>
          </motion.div>
        </motion.div>

        {/* Taped polaroid of the cartographer */}
        <motion.div
          className="absolute bottom-20 left-4 md:bottom-16 md:left-10 pointer-events-auto"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -5 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 1.4 }}
          whileHover={shouldReduceMotion ? undefined : { rotate: -2, scale: 1.04 }}
        >
          <div className="relative bg-white p-2 pb-1 shadow-[3px_5px_12px_rgba(45,45,45,0.25)]">
            {/* tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#f5e9b8]/80 rotate-[-4deg] shadow-sm" />
            <HeroAvatarTransition
              width={800}
              height={1080}
              className="w-[96px] md:w-[140px]"
            />
            <p className="handwritten text-ink/70 text-xs md:text-sm text-center pt-1" style={jpFont}>
              {t("hero.cartographer")}
            </p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 1.5, repeat: Infinity }}
        >
          <div className="handwritten text-ink" style={jpFont}>
            {t("hero.scroll")}
          </div>
        </motion.div>
      </div>

      <BlobDivider position="bottom" fillColor="var(--paper)" variant={1} />
    </section>
  );
}

/** Serious mode keeps the clean, centered layout. */
function SeriousHero() {
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const jpFont = isJapanese ? { fontFamily: "var(--font-jp-handwritten)" } : {};

  return (
    <section className="min-h-[70vh] md:min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-hidden">
      <motion.div
        className="text-center z-10 relative"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
      >
        <div className="mb-8">
          <HeroTitle />
        </div>

        <motion.div
          className="my-4 md:my-6 flex justify-center relative"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
        >
          <HeroAvatarTransition
            width={800}
            height={1080}
            className="w-[180px] sm:w-[220px] md:w-[300px] lg:w-[360px]"
          />
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
        >
          <p className="diary-subtitle max-w-md mx-auto handwritten" style={jpFont}>
            {t("hero.subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="mt-8 md:mt-12"
          animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 1.5, repeat: Infinity }}
        >
          <div className="handwritten text-ink/60" style={jpFont}>
            {t("hero.scroll")}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function Hero() {
  const { isSerious } = useSeriousMode();
  return isSerious ? <SeriousHero /> : <FieldNotebookHero />;
}

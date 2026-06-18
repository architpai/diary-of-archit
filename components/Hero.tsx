"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import HeroAvatarTransition from "./HeroAvatarTransition";
import { useSeriousMode } from "@/contexts/SeriousModeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { InkCompassRose, InkScaleBar, InkWind } from "./icons/InkIcons";

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
        className={`block ${!isSerious ? "" : "underline-sketch"}${shouldReduceMotion ? "" : " handwrite-reveal-delay-2"}`}
      >
        {t("hero.name")}
      </span>
    </h1>
  );
}

/** Playful hero: the page itself is a hand-drawn map of Kanto. */
// Three drifting clouds in the sky over the map. Positions match the marked
// spots; the real cloud01 doodle, scrolling with the hero section.
const HERO_CLOUDS = [
  { cls: "top-[13%] left-[20%] w-28 md:w-32", scrollDrift: -55, delay: 1.0 },
  { cls: "top-[4%] left-[56%] w-20 md:w-24", scrollDrift: 42, delay: 1.3 },
  { cls: "top-[22%] right-[11%] w-24 md:w-28", scrollDrift: -72, delay: 1.6 },
] as const;

function FieldNotebookHero() {
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const jpFont = isJapanese ? { fontFamily: "var(--font-jp-handwritten)" } : {};

  // Clouds drift sideways as the page scrolls (and ride the hero up and out).
  const { scrollY } = useScroll();
  const cloudX0 = useTransform(scrollY, [0, 700], [0, HERO_CLOUDS[0].scrollDrift]);
  const cloudX1 = useTransform(scrollY, [0, 700], [0, HERO_CLOUDS[1].scrollDrift]);
  const cloudX2 = useTransform(scrollY, [0, 700], [0, HERO_CLOUDS[2].scrollDrift]);
  const cloudX = [cloudX0, cloudX1, cloudX2];

  return (
    <section className="relative min-h-screen overflow-hidden pointer-events-none">
      {/* Overlay content — the map itself is the page-level MapBackdrop */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pointer-events-none px-4 pt-14 md:pt-16 pb-10">
        {/* Drifting clouds in the sky over the map — they scroll with the
            hero (riding up and out) and drift sideways as you scroll. */}
        {HERO_CLOUDS.map((cloud, i) => (
          <motion.div
            key={i}
            className={`hidden md:block absolute z-0 pointer-events-none ${cloud.cls}`}
            style={{ x: shouldReduceMotion ? undefined : cloudX[i] }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 0.92, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.0, delay: cloud.delay }}
          >
            <Image
              src="/basecamp/cloud01.svg"
              alt=""
              aria-hidden="true"
              width={90}
              height={60}
              style={{ width: "100%", height: "auto" }}
            />
          </motion.div>
        ))}

        {/* Charted weather mark — frames the clouds as a survey annotation
            rather than cartoon decoration */}
        <motion.div
          className="hidden md:flex absolute top-[19%] left-[31%] z-0 flex-col items-start gap-0.5 text-ink/55 pointer-events-none -rotate-3"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.9, delay: 1.9 }}
        >
          <InkWind className="w-20" />
          <span className="handwritten text-[0.7rem] uppercase tracking-[0.18em] pl-3" style={jpFont}>
            {t("hero.wind_note")}
          </span>
        </motion.div>

        {/* Field-notes annotation — tucked just above the map's top edge */}
        <motion.p
          className="hidden md:block absolute top-[32%] left-8 max-w-[230px] handwritten text-ink/60 text-sm leading-snug -rotate-2 z-20"
          style={jpFont}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          {t("hero.map_note")} ↘
        </motion.p>

        <motion.div
          className="text-center relative z-20"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
        >
          <HeroTitle compact />

          {/* Cartouche imprint — every proper chart credits its surveyor */}
          <motion.p
            className="mt-2 handwritten text-ink/55 text-xs md:text-sm uppercase tracking-[0.18em]"
            style={jpFont}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 1.6 }}
          >
            {t("hero.credit")}
          </motion.p>
        </motion.div>

        {/* Taped polaroid of the cartographer. Portrait: tucked into the
            top-left below the title — a field photo taped to the chart.
            Desktop keeps it down in the open water, bottom-left. */}
        <motion.div
          className="absolute top-56 left-3 md:top-auto md:bottom-16 md:left-10 pointer-events-auto"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -5 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 1.4 }}
          whileHover={shouldReduceMotion ? undefined : { rotate: -2, scale: 1.04 }}
        >
          <div className="relative bg-white p-2 pb-1 shadow-[3px_5px_12px_rgba(45,45,45,0.25)] flex flex-col items-center">
            {/* tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#f5e9b8]/80 rotate-[-4deg] shadow-sm" />
            <HeroAvatarTransition
              width={800}
              height={1080}
              className="w-[84px] md:w-[140px]"
            />
            <p className="handwritten text-ink/70 text-xs md:text-sm text-center pt-1" style={jpFont}>
              {t("hero.cartographer")}
            </p>
          </div>
        </motion.div>

        {/* Compass rose + scale bar — the chart's working ornaments,
            anchored in the open water bottom-right */}
        <motion.div
          className="hidden md:flex absolute bottom-28 right-24 flex-col items-center gap-2 text-ink/70"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.9, delay: 2.0 }}
        >
          <InkCompassRose className="w-20 h-20" />
          <InkScaleBar className="w-44" />
          <p className="scale-bar-caption -mt-1" style={jpFont}>
            ({t("hero.scale_note")})
          </p>
        </motion.div>

        {/* Subtitle — inked across the bottom of the chart, not stacked under
            the title block */}
        <motion.div
          className="absolute bottom-[14.5rem] md:bottom-[5.5rem] left-1/2 -translate-x-1/2 w-[min(92%,30rem)] hero-map-annotation text-center z-20"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 1.0 }}
        >
          <p className="diary-subtitle handwritten" style={jpFont}>
            {t("hero.subtitle")}
          </p>
          <p className="mt-1 text-ink/65 handwritten text-sm md:text-base tracking-wide" style={jpFont}>
            {t("hero.subtitle_role")}
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 1.5, repeat: Infinity }}
        >
          <div className="handwritten text-ink" style={jpFont}>
            {t("hero.scroll")}
          </div>
        </motion.div>
      </div>
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

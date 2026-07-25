"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import HeroAvatarTransition from "./HeroAvatarTransition";
import { useTranslation } from "@/hooks/useTranslation";
import { useMapReady } from "./hero3d/mapReady";
import { InkCompassRose, InkScaleBar, InkWind } from "./icons/InkIcons";

function HeroTitle() {
  const { t, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <h1
      className="diary-title text-ink !text-5xl md:!text-7xl drop-shadow-lg"
      style={isJapanese ? { fontFamily: "var(--font-jp-handwritten)" } : {}}
    >
      <span className={`block${shouldReduceMotion ? "" : " handwrite-reveal"}`}>
        {t("hero.diary")}
      </span>
      <span
        className={`block text-ink/70 italic${shouldReduceMotion ? "" : " handwrite-reveal-delay-1"}`}
        style={{ fontSize: "0.5em" }}
      >
        {t("hero.of")}
      </span>
      <span
        className={`block${shouldReduceMotion ? "" : " handwrite-reveal-delay-2"}`}
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

  // Everything in the annotation layer is commentary ON the chart, so it waits
  // for the chart. Before this flips, the hero is just the title block and the
  // one thing to click; afterwards the ink arrives around the terrain.
  const mapReady = useMapReady();
  /** Fade an annotation in once the map exists (and honour reduced motion). */
  const ink = (delay: number) =>
    shouldReduceMotion
      ? { initial: false as const, animate: { opacity: mapReady ? 1 : 0 } }
      : {
          initial: { opacity: 0 },
          animate: { opacity: mapReady ? 1 : 0 },
          transition: { duration: 0.7, delay: mapReady ? delay : 0 },
        };

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
            animate={{ opacity: mapReady ? 0.92 : 0, y: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 1.0, delay: mapReady ? cloud.delay : 0 }
            }
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
          className="hidden md:flex absolute top-[19%] left-[31%] z-0 flex-col items-start gap-0.5 text-sepia pointer-events-none -rotate-3"
          {...ink(0.5)}
        >
          <InkWind className="w-20" />
          <span className="handwritten text-[0.7rem] uppercase tracking-[0.18em] pl-3" style={jpFont}>
            {t("hero.wind_note")}
          </span>
        </motion.div>

        {/* Field-notes annotation — tucked just above the map's top edge */}
        <motion.p
          className="hidden md:block absolute top-[32%] left-8 max-w-[230px] handwritten text-sepia text-sm leading-snug -rotate-2 z-20"
          style={jpFont}
          {...ink(0.8)}
        >
          {t("hero.map_note")} ↘
        </motion.p>

        <motion.div
          className="text-center relative z-20"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
        >
          <HeroTitle />

          {/* What he does. This is the one sentence the whole hero exists to
              deliver, so it gets a paper backing: it used to be set straight
              onto the terrain, where the contour hatching ate it. */}
          <motion.p
            className="hero-lede handwritten"
            style={jpFont}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.9 }}
          >
            {t("hero.subtitle_role")}
          </motion.p>

          {/* The one thing to click above the fold. The résumé is the strongest
              evidence on the site and used to be 6,400px away. */}
          <motion.div
            className="mt-5 flex justify-center pointer-events-auto"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 1.15 }}
          >
            <Link href="/resume" className="hero-cta group" style={{ textDecoration: "none" }}>
              <span className="hero-cta-tape" aria-hidden="true" />
              <span className="hero-cta-label handwritten" style={jpFont}>
                {t("hero.cta_resume")} →
              </span>
              <span className="hero-cta-sub handwritten" style={jpFont}>
                {t("hero.cta_resume_sub")}
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Taped polaroid of the cartographer. Narrow screens keep it IN FLOW
            under the title block, inside the quiet paper band, because absolute
            placement there landed it on top of the map's own labels. Desktop
            keeps it down in the open water, bottom-left. */}
        <motion.div
          className="relative mt-4 self-center pointer-events-auto md:absolute md:mt-0 md:self-auto md:bottom-16 md:left-10"
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
          {...ink(1.0)}
        >
          <InkCompassRose className="w-20 h-20" />
          <InkScaleBar className="w-44" />
          {/* One margin line, not three: the scale joke and the surveyor's
              credit used to stack into their own little paragraph. */}
          <p
            className="handwritten text-sepia text-[0.7rem] uppercase tracking-[0.14em] mt-3 max-w-[15rem] text-center leading-relaxed"
            style={jpFont}
          >
            {t("hero.margin_credit")}
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

export default function Hero() {
  return <FieldNotebookHero />;
}

'use client';

import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";
import SneakPeek from "@/components/SneakPeek";
import Contact from "@/components/Contact";
import SeriousModeToggle from "@/components/SeriousModeToggle";
import MapScrollNav from "@/components/MapScrollNav";
import LanguageToggle from "@/components/LanguageToggle";
import DiaryFooter from "@/components/DiaryFooter";
import MapBackdrop from "@/components/hero3d/MapBackdrop";

export default function Home() {
  return (
    <main className="notebook-paper min-h-screen">
      {/* The persistent hand-drawn map the whole diary is drawn on */}
      <MapBackdrop />

      {/* Map Scroll Navigation */}
      <MapScrollNav />

      {/* Language Toggle */}
      <LanguageToggle />

      {/* Serious Mode Toggle */}
      <SeriousModeToggle />

      {/* Main Content Sections — float above the map. The wrapper is
          pointer-transparent so map pins stay clickable in the gaps;
          each panel re-enables pointer events on itself. */}
      <div className="relative z-10 pointer-events-none">
        <div id="hero">
          <Hero />
        </div>

        <div id="timeline">
          <Timeline />
        </div>

        <div id="skills">
          <Skills />
        </div>

        <div id="sneakpeek">
          <SneakPeek />
        </div>

        <Contact />

        {/* Footer */}
        <DiaryFooter />
      </div>
    </main>
  );
}

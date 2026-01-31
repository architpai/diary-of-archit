'use client';

import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";
import SneakPeek from "@/components/SneakPeek";
import Contact from "@/components/Contact";
import PostItNav from "@/components/PostItNav";
import SeriousModeToggle from "@/components/SeriousModeToggle";
import MapScrollNav from "@/components/MapScrollNav";
import LanguageToggle from "@/components/LanguageToggle";
import { useSeriousMode } from "@/contexts/SeriousModeContext";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const { isSerious } = useSeriousMode();
  const { t, isJapanese } = useTranslation();

  return (
    <main className={`notebook-paper min-h-screen ${isSerious ? 'pt-16' : ''}`}>
      {/* Navigation */}
      <PostItNav />
      
      {/* Map Scroll Navigation */}
      <MapScrollNav />
      
      {/* Language Toggle */}
      <LanguageToggle />
      
      {/* Serious Mode Toggle */}
      <SeriousModeToggle />
      
      {/* Main Content Sections */}
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
      <footer 
        className={`py-8 text-center ${isSerious ? 'font-sans text-sm text-gray-500' : 'handwritten text-ink/50'}`}
        style={isJapanese && !isSerious ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
      >
        <p>
          {isSerious 
            ? t('footer.copyright')
            : t('footer.scribbled')
          }
        </p>
      </footer>
    </main>
  );
}

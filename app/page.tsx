'use client';

import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";
import SneakPeek from "@/components/SneakPeek";
import Contact from "@/components/Contact";
import PostItNav from "@/components/PostItNav";
import SeriousModeToggle from "@/components/SeriousModeToggle";
import { useSeriousMode } from "@/contexts/SeriousModeContext";

export default function Home() {
  const { isSerious } = useSeriousMode();

  return (
    <main className={`notebook-paper min-h-screen ${isSerious ? 'pt-16' : ''}`}>
      {/* Navigation */}
      <PostItNav />
      
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
      <footer className={`py-8 text-center ${isSerious ? 'font-sans text-sm text-gray-500' : 'handwritten text-ink/50'}`}>
        <p>
          {isSerious 
            ? '© 2024 Archit Pai. All rights reserved.'
            : '✏️ Scribbled with ❤️ in 2024'
          }
        </p>
      </footer>
    </main>
  );
}

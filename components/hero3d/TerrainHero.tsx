"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const TerrainScene = dynamic(() => import("./TerrainScene"), { ssr: false });

/**
 * Full-bleed hand-drawn terrain backdrop for the hero. Pauses the render
 * loop once scrolled out of view so the map costs nothing below the fold.
 */
export default function TerrainHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <TerrainScene reduceMotion={!!shouldReduceMotion} active={active} />
    </div>
  );
}

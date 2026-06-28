"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const TerrainScene = dynamic(() => import("./TerrainScene"), { ssr: false });

/**
 * The persistent hand-drawn map behind the whole page. Sections float over
 * it as paper panels; scrolling the timeline flies the camera between the
 * job pins (see CameraRig's [data-map-waypoint] blending).
 */
export default function MapBackdrop() {
  const shouldReduceMotion = useReducedMotion();
  // Pause the render loop while the tab is hidden — no point burning the GPU
  // (and the phone's battery) repainting a backdrop nobody can see.
  const [docVisible, setDocVisible] = useState(true);
  useEffect(() => {
    const onVis = () => setDocVisible(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0">
        <TerrainScene reduceMotion={!!shouldReduceMotion} active={docVisible} />
        <div
          className="terrain-hero-vignette absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {/* Neatline — the double rule that bounds every proper chart.
          Nav tabs and toggles live "outside the neatline" (higher z). */}
      <div className="map-neatline" aria-hidden="true" />
    </>
  );
}

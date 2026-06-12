"use client";

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

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <TerrainScene reduceMotion={!!shouldReduceMotion} active />
        <div className="terrain-hero-vignette absolute inset-0 pointer-events-none" />
      </div>
      {/* Neatline — the double rule that bounds every proper chart.
          Nav tabs and toggles live "outside the neatline" (higher z). */}
      <div className="map-neatline" aria-hidden="true" />
    </>
  );
}

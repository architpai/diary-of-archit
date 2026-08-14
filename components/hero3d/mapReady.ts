"use client";

import { useSyncExternalStore } from "react";

/**
 * "The chart is on the page" signal.
 *
 * The hero's annotation layer (wind arrow, survey note, compass rose, scale bar,
 * pin pills) is all commentary ON the map. Painting it before the terrain arrives
 * leaves captions pointing at blank paper, which is how the page used to load. So
 * the ink waits for this flag.
 *
 * Deliberately a module-level store rather than context: the terrain lives inside
 * a dynamically-imported R3F canvas, and the annotations are plain DOM siblings
 * of it, so there is no shared provider to hang state on.
 */
let ready = false;
const subscribers = new Set<() => void>();

/** Longest the ink will wait. If WebGL is blocked or the fetch stalls, the hero
 *  still needs to be a finished page, just without its backdrop. */
const FALLBACK_MS = 2500;

export function markMapReady() {
  if (ready) return;
  ready = true;
  for (const notify of subscribers) notify();
}

if (typeof window !== "undefined") {
  window.setTimeout(markMapReady, FALLBACK_MS);
}

function subscribe(onChange: () => void) {
  subscribers.add(onChange);
  return () => subscribers.delete(onChange);
}

export function useMapReady() {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}

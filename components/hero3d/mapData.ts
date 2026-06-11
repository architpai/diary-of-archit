import bounds from "@/public/terrain/tokaido-heightmap.json";

// World-space size of the terrain plane (three.js units).
export const WORLD_WIDTH = 10;
export const WORLD_DEPTH = WORLD_WIDTH * (bounds.height / bounds.width);

// Ground meters represented by the plane width, derived from the heightmap
// bounds, with vertical exaggeration so the relief reads at a glance.
const GROUND_METERS =
  (bounds.east - bounds.west) *
  111320 *
  Math.cos((((bounds.north + bounds.south) / 2) * Math.PI) / 180);
export const VERTICAL_EXAGGERATION = 3.2;
export const HEIGHT_SCALE =
  (WORLD_WIDTH / GROUND_METERS) * VERTICAL_EXAGGERATION;

export const MAP_BOUNDS = bounds;

function mercatorY(latDeg: number) {
  const rad = (latDeg * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

/**
 * Project lon/lat to the terrain mesh's world position.
 * The plane lies in XZ (rotated -90° about X), so u → +x, v → -z.
 */
export function lonLatToWorld(
  lon: number,
  lat: number,
  elevationMeters = 0
): [number, number, number] {
  const u = (lon - bounds.west) / (bounds.east - bounds.west);
  const v =
    (mercatorY(lat) - mercatorY(bounds.south)) /
    (mercatorY(bounds.north) - mercatorY(bounds.south));
  return [
    (u - 0.5) * WORLD_WIDTH,
    elevationMeters * HEIGHT_SCALE,
    -(v - 0.5) * WORLD_DEPTH,
  ];
}

export interface MapPin {
  id: string;
  /** Matches an experience id in content.*.json when applicable */
  experienceId?: string;
  lon: number;
  lat: number;
  elevation: number;
  /** Fallback label when not tied to an experience */
  labelKey?: string;
  kind: "job" | "landmark" | "offmap";
  /** Pixel offset for the label so neighbouring labels don't collide */
  labelOffset?: [number, number];
}

export const MAP_PINS: MapPin[] = [
  {
    id: "pin-stealth",
    experienceId: "exp-1",
    lon: 135.502,
    lat: 34.694,
    elevation: 15,
    kind: "job",
    labelKey: "hero.pin_stealth",
    labelOffset: [95, -45],
  },
  {
    id: "pin-softbank",
    experienceId: "exp-2",
    lon: 139.7595,
    lat: 35.6554,
    elevation: 10,
    kind: "job",
    labelKey: "hero.pin_softbank",
    labelOffset: [-95, -30],
  },
  {
    id: "pin-khi",
    experienceId: "exp-3",
    lon: 135.175,
    lat: 34.665,
    elevation: 5,
    kind: "job",
    labelKey: "hero.pin_khi",
    labelOffset: [-15, 62],
  },
  {
    id: "pin-fuji",
    lon: 138.7274,
    lat: 35.3606,
    elevation: 3776,
    labelKey: "hero.pin_fuji",
    kind: "landmark",
    labelOffset: [0, -62],
  },
  {
    id: "pin-mumbai",
    lon: 136.15,
    lat: 34.05,
    elevation: 0,
    labelKey: "hero.pin_mumbai",
    kind: "offmap",
  },
];

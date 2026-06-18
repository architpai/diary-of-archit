import tokaidoBounds from "@/public/terrain/tokaido-heightmap.json";
import mumbaiBounds from "@/public/terrain/mumbai-heightmap.json";

// World-space size of the main terrain plane (three.js units).
export const WORLD_WIDTH = 10;
export const WORLD_DEPTH = WORLD_WIDTH * (tokaidoBounds.height / tokaidoBounds.width);

export const VERTICAL_EXAGGERATION = 3.2;

export interface HeightmapBounds {
  zoom: number;
  width: number;
  height: number;
  west: number;
  east: number;
  north: number;
  south: number;
}

/** A terrain plane drawn on the page: the main Tokaido map plus insets. */
export interface TerrainMap {
  id: "tokaido" | "mumbai";
  bounds: HeightmapBounds;
  texture: string;
  /** World-space plane size */
  width: number;
  depth: number;
  /** World units per meter of elevation */
  heightScale: number;
  /** World-space centre of the plane (x, z) */
  center: [number, number];
  /** Boosts the fragment shader's slope hatching for finer-texel maps */
  slopeScale: number;
}

/** Ground meters represented by a heightmap's longitudinal span. */
function groundMeters(b: HeightmapBounds) {
  return (
    (b.east - b.west) *
    111320 *
    Math.cos((((b.north + b.south) / 2) * Math.PI) / 180)
  );
}

export const HEIGHT_SCALE =
  (WORLD_WIDTH / groundMeters(tokaidoBounds)) * VERTICAL_EXAGGERATION;

// The Mumbai inset: a small side-map floating on the page off the southwest
// edge of the main map — the camera flies "off the chart" to reach it.
const MUMBAI_WIDTH = 3.4;

export const TERRAIN_MAPS: Record<TerrainMap["id"], TerrainMap> = {
  tokaido: {
    id: "tokaido",
    bounds: tokaidoBounds,
    texture: "/terrain/tokaido-heightmap.png",
    width: WORLD_WIDTH,
    depth: WORLD_DEPTH,
    heightScale: HEIGHT_SCALE,
    center: [0, 0],
    slopeScale: 1,
  },
  mumbai: {
    id: "mumbai",
    bounds: mumbaiBounds,
    texture: "/terrain/mumbai-heightmap.png",
    width: MUMBAI_WIDTH,
    depth: MUMBAI_WIDTH * (mumbaiBounds.height / mumbaiBounds.width),
    // Slightly stronger exaggeration: the Sanjay Gandhi hills are gentle and
    // need the help to read at inset scale.
    heightScale: (MUMBAI_WIDTH / groundMeters(mumbaiBounds)) * 4.5,
    center: [-8.3, 1.5],
    slopeScale: 3.5,
  },
};

export const MAP_BOUNDS = tokaidoBounds;

function mercatorY(latDeg: number) {
  const rad = (latDeg * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

/**
 * Project lon/lat onto one of the terrain planes' world positions.
 * Planes lie in XZ (rotated -90° about X), so u → +x, v → -z.
 */
export function lonLatToWorldOn(
  map: TerrainMap,
  lon: number,
  lat: number,
  elevationMeters = 0
): [number, number, number] {
  const b = map.bounds;
  const u = (lon - b.west) / (b.east - b.west);
  const v =
    (mercatorY(lat) - mercatorY(b.south)) /
    (mercatorY(b.north) - mercatorY(b.south));
  return [
    map.center[0] + (u - 0.5) * map.width,
    elevationMeters * map.heightScale,
    map.center[1] - (v - 0.5) * map.depth,
  ];
}

/** Project lon/lat onto the main (Tokaido) map. */
export function lonLatToWorld(
  lon: number,
  lat: number,
  elevationMeters = 0
): [number, number, number] {
  return lonLatToWorldOn(TERRAIN_MAPS.tokaido, lon, lat, elevationMeters);
}

export interface MapPin {
  id: string;
  /** Matches an experience id in content.*.json when applicable */
  experienceId?: string;
  lon: number;
  lat: number;
  elevation: number;
  /** Which terrain plane the pin sits on (defaults to the main map) */
  map?: TerrainMap["id"];
  /** Fallback label when not tied to an experience */
  labelKey?: string;
  kind: "job" | "landmark" | "offmap";
  /** Pixel offset for the label so neighbouring labels don't collide */
  labelOffset?: [number, number];
  /** Portrait/phone label offset — the close hero framing on a narrow column
   *  pushes the east/west cities toward (or past) the screen edges, so their
   *  floating name-pills are pulled further inward here than on desktop. The
   *  3D teardrop marker stays on the city; only the pill tag moves. */
  labelOffsetMobile?: [number, number];
  /** Marker colour — also used for the company name on the timeline card */
  color: string;
}

/** World position of a pin on whichever map it belongs to. */
export function pinToWorld(pin: MapPin): [number, number, number] {
  return lonLatToWorldOn(
    TERRAIN_MAPS[pin.map ?? "tokaido"],
    pin.lon,
    pin.lat,
    pin.elevation
  );
}

/** Legend/category colours — shared by the Skills legend panel and the
 *  skills constellation so the stars match their legend entries. */
export const CATEGORY_COLORS: Record<string, string> = {
  cloud: "#5A6B8D", // Desaturated Blue
  database: "#5C7C5C", // Desaturated Green
  mapping: "#A65D57", // Desaturated Red
  frontend: "#7D6B8D", // Desaturated Purple
  backend: "#B88B4A", // Desaturated Orange
  domain: "#4A6B6B", // Desaturated Teal
  graphics: "#A67C52", // Desaturated Brown
  architecture: "#6B6B6B", // Desaturated Gray
  devops: "#578D82", // Desaturated Mint
};

/** Marker colour for a timeline experience (falls back to margin blue). */
export function experienceColor(expId: string): string {
  const pinId = EXPERIENCE_PIN[expId];
  return MAP_PINS.find((p) => p.id === pinId)?.color ?? "#3B5998";
}

/** Which map pin the camera flies to for each timeline experience. */
export const EXPERIENCE_PIN: Record<string, string> = {
  "exp-1": "pin-stealth",
  "exp-2": "pin-softbank",
  "exp-3": "pin-khi",
  "exp-4": "pin-mumbai",
};

export const MAP_PINS: MapPin[] = [
  {
    id: "pin-stealth",
    color: "#E63946",
    experienceId: "exp-1",
    lon: 135.502,
    lat: 34.694,
    elevation: 15,
    kind: "job",
    labelKey: "hero.pin_stealth",
    labelOffset: [95, -45],
    // Portrait: Osaka & Kobe are co-located (Kansai) and sit centre-bottom in
    // the corridor-aligned view; fan both pills to the right of the pins and
    // stack them (Stealth above Kobe) so they read as two tags clear of the
    // polaroid (left) and the scroll hint (centre).
    labelOffsetMobile: [90, -48],
  },
  {
    id: "pin-softbank",
    color: "#B8860B",
    experienceId: "exp-2",
    lon: 139.7595,
    lat: 35.6554,
    elevation: 10,
    kind: "job",
    labelKey: "hero.pin_softbank",
    labelOffset: [-95, -30],
    // Portrait: the cartographer photo is taped top-left, where the desktop
    // left-pushed label would sit. Flip the pill to the right of the Tokyo pin
    // so it stays clear of the photo (the teardrop itself is already clear).
    labelOffsetMobile: [38, -26],
  },
  {
    id: "pin-khi",
    color: "#3B5998",
    experienceId: "exp-3",
    lon: 135.175,
    lat: 34.665,
    elevation: 5,
    kind: "job",
    labelKey: "hero.pin_khi",
    // Desktop (broadside): Kobe/KHI sits just west of Osaka/Stealth, so the two
    // pins nearly stack. Stealth's pill goes up-right; KHI's hangs straight
    // below its own teardrop — the pill's dot is offset ~91px left of centre,
    // so +90 here lands that dot directly under the blue pin (not drifting
    // right toward the red Stealth pin as the old [120,58] did). The label
    // extends right past the Stealth column but sits well below it, clear.
    labelOffset: [90, 44],
    // Portrait: Kobe sits just below Stealth/Osaka (co-located Kansai); stack
    // its pill to the right of the pin, below Stealth's, clear of the scroll
    // hint at the bottom.
    labelOffsetMobile: [95, -10],
  },
  {
    id: "pin-fuji",
    color: "#5A6B8D",
    lon: 138.7274,
    lat: 35.3606,
    elevation: 3776,
    labelKey: "hero.pin_fuji",
    kind: "landmark",
    // Below the summit so it can't collide with the hero subtitle pill.
    labelOffset: [40, 85],
    // Portrait: the close corridor framing leaves the desktop 85px drop reading
    // as a big gap between the floating teardrop and its pill. Tuck the pill
    // just under the pin tip instead — still clear of the body copy below.
    labelOffsetMobile: [20, 26],
  },
  {
    // A real pin on the Mumbai inset map — the camera flies off the main
    // chart and across the page to reach it.
    id: "pin-mumbai",
    color: "#2E8B74",
    experienceId: "exp-4",
    map: "mumbai",
    lon: 72.8777,
    lat: 19.076,
    elevation: 10,
    kind: "job",
    labelKey: "hero.pin_mumbai",
    labelOffset: [0, -60],
  },
];

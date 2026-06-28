/**
 * The skill-relationship graph behind the night-sky section.
 *
 * Edges mean "I genuinely use these together" — hovering a star pulls its
 * companions into orbit, so the graph IS the content (it replaces the old
 * tier list). Strength 3 = inseparable (inner orbit), 2 = frequent
 * (middle), 1 = occasional (outer).
 *
 * Also home to the per-category star-glyph geometry, shared between the
 * canvas sprite textures (3D) and the DOM legend chips (SVG) so "same
 * category = same star style" holds everywhere.
 */

// ── Relationships ──────────────────────────────────────────────────────

export type SkillEdge = [a: string, b: string, strength: 1 | 2 | 3];

export const SKILL_EDGES: SkillEdge[] = [
  // The geospatial core — the day job
  ['geo', 'mvt', 3],
  ['geo', 'postgis', 3],
  ['geo', 'maplibre', 2],
  ['geo', 'wayfinding', 2],
  ['geo', 'threejs', 2],
  ['geo', 'python', 1],
  ['mvt', 'postgis', 3],
  ['mvt', 'redis', 3],
  ['mvt', 'maplibre', 3],
  ['mvt', 'node', 2],
  ['mvt', 'sysdesign', 2],
  ['wayfinding', 'maplibre', 2],
  ['wayfinding', 'react', 1],
  ['maplibre', 'react', 2],
  ['postgis', 'redis', 2],
  ['postgis', 'node', 2],
  ['postgis', 'azure', 1],
  ['redis', 'node', 2],
  ['redis', 'sysdesign', 2],
  // The web stack
  ['react', 'ts', 3],
  ['react', 'redux', 3],
  ['react', 'threejs', 2],
  ['ts', 'node', 3],
  ['ts', 'threejs', 2],
  ['ts', 'redux', 2],
  ['ts', 'agents', 1],
  // Cloud & ops
  ['azure', 'docker', 3],
  ['azure', 'cicd', 3],
  ['azure', 'node', 2],
  ['azure', 'sysdesign', 2],
  ['docker', 'cicd', 3],
  ['docker', 'node', 2],
  ['docker', 'llm', 1],
  ['sysdesign', 'node', 1],
  // The uncharted stars
  ['python', 'llm', 2],
  ['python', 'agents', 1],
  ['llm', 'agents', 3],
];

/** Neighbours of a star, strongest first. */
export function neighborsOf(id: string): { id: string; strength: number }[] {
  const out: { id: string; strength: number }[] = [];
  for (const [a, b, s] of SKILL_EDGES) {
    if (a === id) out.push({ id: b, strength: s });
    else if (b === id) out.push({ id: a, strength: s });
  }
  return out.sort((x, y) => y.strength - x.strength);
}

// ── Star sizing: the tier data drives star size, not list rows ─────────

export const TIER_SIZE: Record<string, number> = {
  daily: 1.0,
  weekly: 0.78,
  shipped: 0.6,
  charting: 0.68,
};

// ── Star glyph geometry per category ───────────────────────────────────

export interface GlyphSpec {
  /** Polylines in unit space (coords in [-1, 1]); closed if last == first */
  strokes: [number, number][][];
  /** Optional circles */
  circles?: { x: number; y: number; r: number; dashed?: boolean; filled?: boolean }[];
}

function starPolygon(points: number, rOuter: number, rInner: number, rot = -Math.PI / 2): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = rot + (i / (points * 2)) * Math.PI * 2;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

function spokes(count: number, rInner: number, rOuter: number, rot = -Math.PI / 2): [number, number][][] {
  const out: [number, number][][] = [];
  for (let i = 0; i < count; i++) {
    const a = rot + (i / count) * Math.PI * 2;
    out.push([
      [Math.cos(a) * rInner, Math.sin(a) * rInner],
      [Math.cos(a) * rOuter, Math.sin(a) * rOuter],
    ]);
  }
  return out;
}

export const CATEGORY_GLYPHS: Record<string, GlyphSpec> = {
  // classic 5-point star
  mapping: { strokes: [starPolygon(5, 1, 0.42)] },
  // 6-point asterisk
  database: { strokes: spokes(6, 0.12, 1) },
  // 4-point twinkle (long thin diamond star)
  frontend: { strokes: [starPolygon(4, 1, 0.26)] },
  // 8-point burst
  backend: { strokes: spokes(8, 0.18, 1) },
  // little planet with a ring
  cloud: {
    circles: [{ x: 0, y: 0, r: 0.55 }],
    strokes: [
      [
        [-1, 0.38],
        [-0.5, 0.52],
        [0.5, 0.52],
        [1, 0.38],
      ],
    ],
  },
  // compass star: long cardinals, short diagonals
  domain: {
    strokes: [
      ...spokes(4, 0.1, 1),
      ...spokes(4, 0.1, 0.5, -Math.PI / 4),
    ],
  },
  // square diamond
  graphics: {
    strokes: [
      [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ],
    ],
  },
  // crossed sparkle
  devops: {
    strokes: [
      [
        [-0.8, -0.8],
        [0.8, 0.8],
      ],
      [
        [0.8, -0.8],
        [-0.8, 0.8],
      ],
      [
        [-0.45, 0],
        [0.45, 0],
      ],
    ],
  },
  // surveyor's mark: ringed dot
  architecture: {
    strokes: [],
    circles: [
      { x: 0, y: 0, r: 0.85 },
      { x: 0, y: 0, r: 0.18, filled: true },
    ],
  },
  // uncharted: a dashed, unfinished circle
  uncharted: {
    circles: [{ x: 0, y: 0, r: 0.8, dashed: true }],
    strokes: [
      [
        [-0.25, 0.1],
        [0.05, -0.25],
        [0.3, 0.12],
      ],
    ],
  },
};

export function glyphFor(category: string): GlyphSpec {
  return CATEGORY_GLYPHS[category] ?? CATEGORY_GLYPHS.mapping;
}

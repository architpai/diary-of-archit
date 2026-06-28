// Hand-drawn cartography shader: real elevation data rendered like ink and
// pencil on the diary's notebook paper. The ocean is the ruled page itself;
// land rises out of it with wobbly contour lines and pencil-hatched slopes.

export const TERRAIN_VERTEX = /* glsl */ `
uniform sampler2D uHeightmap;
uniform float uHeightScale;
uniform float uReveal;

varying vec2 vUv;
varying float vHeight;

float decodeHeight(vec2 uv) {
  vec3 rgb = texture2D(uHeightmap, uv).rgb;
  // R/G hold (meters + 32768) as a 16-bit value; B was zeroed at build time.
  return rgb.r * 65280.0 + rgb.g * 255.0 - 32768.0;
}

void main() {
  vUv = uv;
  float h = max(decodeHeight(uv), 0.0);
  vHeight = h;

  vec3 pos = position;
  // Terrain rises out of the page during the intro.
  pos.z += h * uHeightScale * uReveal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const TERRAIN_FRAGMENT = /* glsl */ `
uniform sampler2D uHeightmap;
uniform float uReveal;
uniform float uTime;
uniform vec2 uTexel;        // 1 / heightmap resolution
uniform vec2 uUvScale;      // plane size relative to the main map — keeps
                            // grain/ruled-line/stroke frequency constant in
                            // world units across inset maps
uniform float uSlopeScale;  // boosts slope response on finer-texel maps
uniform vec3 uPaper;        // page cream
uniform vec3 uPaperLine;    // ruled-line blue
uniform vec3 uInk;          // handwriting ink
uniform vec3 uMarginRed;

varying vec2 vUv;
varying float vHeight;

float decodeHeight(vec2 uv) {
  vec3 rgb = texture2D(uHeightmap, uv).rgb;
  return rgb.r * 65280.0 + rgb.g * 255.0 - 32768.0;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  float h = vHeight;
  // UVs in "main map" units so all hand-drawn frequencies match across maps.
  vec2 suv = vUv * uUvScale;

  // --- Paper base + the ocean as water (not the page's ruled lines) ---
  // Straight ruled lines drawn on this tilted plane project as diagonals and
  // fight the real page rules behind the map, breaking immersion. So the sea
  // reads as a soft blue-grey watercolour wash with gentle, noise-wobbled
  // ripples — water, not notebook paper — which sidesteps the alignment clash.
  float grain = noise(suv * 700.0);
  vec3 paper = uPaper * (0.972 + 0.028 * grain);

  vec3 water = mix(paper, uPaperLine, 0.42);
  // Hand-drawn ripples: a slow meander (low-freq noise drifts the whole band)
  // plus per-stroke wobble, so the crests wander like brushed water and never
  // line up into straight rules. Stronger contrast than a flat wash for visible
  // surface texture, while the base tint stays soft.
  float meander = noise(suv * vec2(2.0, 6.0)) * 2.4;
  float wavePhase = suv.y * 58.0 + noise(suv * vec2(4.0, 22.0)) * 13.0 + meander;
  float ripple = smoothstep(0.5, 0.9, sin(wavePhase) * 0.5 + 0.5);
  vec3 page = mix(water, uPaperLine, ripple * 0.36);

  // --- Land tint: soft crayon wash by elevation, snow above ~2800m ---
  vec3 lowland = vec3(0.879, 0.911, 0.795);   // washed green
  vec3 upland  = vec3(0.886, 0.823, 0.706);   // tan
  vec3 ridge   = vec3(0.808, 0.738, 0.658);   // warm brown
  vec3 land = mix(lowland, upland, smoothstep(60.0, 900.0, h));
  land = mix(land, ridge, smoothstep(900.0, 2200.0, h));
  land = mix(land, vec3(0.985, 0.985, 0.97), smoothstep(2700.0, 3100.0, h));
  // Let paper grain show through the crayon.
  land = mix(paper, land, 0.72);

  float isLand = smoothstep(0.5, 3.5, h);
  vec3 color = mix(page, land, isLand);

  // --- Coastline: confident pen stroke where land meets page ---
  float hw = fwidth(h) + 1e-4;
  float coast = 1.0 - smoothstep(hw * 1.2, hw * 2.6, abs(h - 2.0));
  // Wobble the ink weight so it feels hand-drawn.
  coast *= 0.75 + 0.25 * noise(suv * 240.0);
  color = mix(color, uInk, coast * 0.85);

  // Lines draw in from the coast upward as the terrain rises.
  float lineReveal = (1.0 - smoothstep(uReveal * 4000.0 - 350.0, uReveal * 4000.0, h))
    * smoothstep(0.02, 0.12, uReveal);

  // --- Contour lines: wobbly pen, heavier every 5th line ---
  float wobble = (noise(suv * 130.0) - 0.5) * 0.45;
  float e = h / 180.0 + wobble;
  float ew = fwidth(e) + 1e-4;
  float minor = 1.0 - smoothstep(ew * 0.9, ew * 2.0, abs(fract(e + 0.5) - 0.5));
  float eMaj = e / 5.0;
  float ewMaj = fwidth(eMaj) + 1e-4;
  float major = 1.0 - smoothstep(ewMaj * 1.1, ewMaj * 2.6, abs(fract(eMaj + 0.5) - 0.5));
  float contour = max(minor * 0.22, major * 0.42) * isLand * lineReveal;
  // Skip contours right at the coast band so the pen lines don't pile up.
  contour *= smoothstep(40.0, 120.0, h);
  color = mix(color, uInk, contour);

  // --- Pencil hatching on steep slopes ---
  float hx = decodeHeight(vUv + vec2(uTexel.x, 0.0)) - decodeHeight(vUv - vec2(uTexel.x, 0.0));
  float hy = decodeHeight(vUv + vec2(0.0, uTexel.y)) - decodeHeight(vUv - vec2(0.0, uTexel.y));
  float slope = length(vec2(hx, hy)) * uSlopeScale;
  float strokes = sin((suv.x - suv.y) * 1400.0 + noise(suv * 90.0) * 9.0);
  float hatch = smoothstep(0.55, 0.95, strokes)
    * smoothstep(200.0, 560.0, slope)
    * isLand * lineReveal;
  color = mix(color, uInk, hatch * 0.12);

  // Faint shading so the relief reads even between contour lines.
  float lambert = clamp(0.5 + (hx + hy) * uSlopeScale * -0.0012, 0.0, 1.0);
  color *= mix(1.0, 0.96 + 0.07 * lambert, isLand);

  // The drawing fades out toward the page edges like an unfinished sketch.
  vec2 edge = min(vUv, 1.0 - vUv);
  float rim = min(edge.x, edge.y);
  float sketchEdge = smoothstep(0.012, 0.055 + noise(suv * 42.0) * 0.03, rim);

  gl_FragColor = vec4(color, sketchEdge);
  #include <colorspace_fragment>
}
`;

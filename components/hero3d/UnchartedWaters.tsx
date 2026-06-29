"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sceneState } from "./sceneState";

// ── Off the chart: open water ───────────────────────────────────────────
// South of the terrain plane the map runs out, so this is where the page
// becomes sea. One big surface quad carries it in a single fragment shader,
// evaluated in WORLD space so it reads as one continuous body of water with
// the terrain's own ocean:
//   • the slate-blue sea wash (the exact #FFF9E5↔#a8c5e2 mix the terrain uses),
//   • slow hand-drawn ripples, in the terrain's UV basis so the coast seam is
//     invisible.
// It's a still surface (the same calm sea as beside the map), so once it has
// faded in it costs nothing per frame — no animation clock, no creature.

// The water surface: a generous quad, centred on the open water and oversized
// so its edges sit well off-screen through the whole scroll transition. It
// underlaps the terrain to the north (the opaque land hides it there) so the
// only visible seam is the coastline, where the wash colour matches exactly.
const WATER = { cx: 0.4, cz: 4.0, width: 44, depth: 22, y: -0.02 };

const WATER_VERTEX = /* glsl */ `
  varying vec2 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// All effects live in WORLD space (vWorld = world x,z) so the sea lines up
// seamlessly with the terrain's own ocean wash.
const WATER_FRAGMENT = /* glsl */ `
  varying vec2 vWorld;
  varying vec2 vUv;
  uniform float uOpacity;
  uniform vec3  uPaper;
  uniform vec3  uPaperLine;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 W = vWorld;       // (worldX, worldZ)
    float Wx = W.x, Wz = W.y;

    // — base sea wash + ripples: the terrain's ocean recipe ported VERBATIM,
    //   evaluated in the terrain's own UV basis (tokaido footprint:
    //   x∈[-5,5], z∈[±WORLD_DEPTH/2]). So the open water is literally the same
    //   water as the sea beside the map — calm, pale, and static. —
    vec2 suv = vec2((Wx + 5.0) / 10.0, (3.46154 - Wz) / 6.92308);
    float grain = vnoise(suv * 700.0);
    vec3 paper = uPaper * (0.972 + 0.028 * grain);
    vec3 water = mix(paper, uPaperLine, 0.42);
    float meander = vnoise(suv * vec2(2.0, 6.0)) * 2.4;
    float wavePhase = suv.y * 58.0 + vnoise(suv * vec2(4.0, 22.0)) * 13.0 + meander;
    float ripple = smoothstep(0.5, 0.9, sin(wavePhase) * 0.5 + 0.5);
    vec3 col = mix(water, uPaperLine, ripple * 0.36);

    // — dissolve the plane's own edges into paper (kept off-screen normally,
    //   but graceful if a corner ever peeks during a transition) —
    float edge = smoothstep(0.0, 0.10, vUv.x) * (1.0 - smoothstep(0.90, 1.0, vUv.x))
               * smoothstep(0.0, 0.06, vUv.y) * (1.0 - smoothstep(0.94, 1.0, vUv.y));

    float a = uOpacity * edge;
    a += (hash(gl_FragCoord.xy) - 0.5) * 0.01; // dither — no banding on the wash
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
    // Same linear->sRGB output conversion the terrain shader applies; without
    // it the wash renders darker/more saturated than the sea beside the map.
    #include <colorspace_fragment>
  }
`;

export default function UnchartedWaters() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uPaper: { value: new THREE.Color("#FFF9E5") },
      uPaperLine: { value: new THREE.Color("#a8c5e2") },
    }),
    []
  );

  // The sea is a still image; the only per-frame work is fading it in/out with
  // the scroll-driven `uncharted` weight (and hiding the mesh when off screen).
  useFrame(() => {
    const w = sceneState.uncharted;
    const mat = matRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;
    const visible = w > 0.02;
    mesh.visible = visible;
    if (visible) mat.uniforms.uOpacity.value = w;
  });

  return (
    <mesh
      ref={meshRef}
      position={[WATER.cx, WATER.y, WATER.cz]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={-1}
      visible={false}
    >
      <planeGeometry args={[WATER.width, WATER.depth]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={WATER_VERTEX}
        fragmentShader={WATER_FRAGMENT}
      />
    </mesh>
  );
}

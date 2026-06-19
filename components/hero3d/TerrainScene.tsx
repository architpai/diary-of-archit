"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { TERRAIN_VERTEX, TERRAIN_FRAGMENT } from "./terrainShaders";
import {
  MAP_PINS,
  TERRAIN_MAPS,
  WORLD_DEPTH,
  WORLD_WIDTH,
  pinToWorld,
  type MapPin,
  type TerrainMap,
} from "./mapData";
import { sceneState } from "./sceneState";
import UnchartedWaters from "./UnchartedWaters";
import { useTranslation } from "@/hooks/useTranslation";

const INTRO_SECONDS = 2.8;

// Dev-only live-tuning handle for the portrait hero pose. In the browser
// console: `__heroTune.py = 4.2` etc. mutates the same object the camera loop
// reads, so the framing can be dialled in without edit/reload cycles. Empty
// (no overrides) in production — the baked defaults in CameraRig win.
const HERO_TUNE: Record<string, number> =
  typeof window !== "undefined" && process.env.NODE_ENV !== "production"
    ? (((window as unknown as Record<string, unknown>).__heroTune ??=
        {}) as Record<string, number>)
    : {};

function Terrain({
  map,
  reduceMotion,
}: {
  map: TerrainMap;
  reduceMotion: boolean;
}) {
  const heightmap = useTexture(map.texture);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    heightmap.colorSpace = THREE.NoColorSpace;
    heightmap.minFilter = THREE.LinearFilter;
    heightmap.magFilter = THREE.LinearFilter;
    heightmap.wrapS = heightmap.wrapT = THREE.ClampToEdgeWrapping;
    return {
      uHeightmap: { value: heightmap },
      uHeightScale: { value: map.heightScale },
      uReveal: { value: reduceMotion ? 1 : 0 },
      uTime: { value: 0 },
      uTexel: {
        value: new THREE.Vector2(1 / map.bounds.width, 1 / map.bounds.height),
      },
      // Keep grain/ruled-line/stroke frequencies constant in world units so
      // inset maps read as part of the same drawing.
      uUvScale: {
        value: new THREE.Vector2(map.width / WORLD_WIDTH, map.depth / WORLD_DEPTH),
      },
      uSlopeScale: { value: map.slopeScale },
      uPaper: { value: new THREE.Color("#FFF9E5") },
      uPaperLine: { value: new THREE.Color("#a8c5e2") },
      uInk: { value: new THREE.Color("#2D2D2D") },
      uMarginRed: { value: new THREE.Color("#E63946") },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightmap]);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    if (!reduceMotion && mat.uniforms.uReveal.value < 1) {
      const t = Math.min(state.clock.elapsedTime / INTRO_SECONDS, 1);
      // easeOutCubic — the land settles softly out of the page.
      mat.uniforms.uReveal.value = 1 - Math.pow(1 - t, 3);
    }
  });

  const segments = useMemo(() => {
    const base =
      typeof window !== "undefined" && window.innerWidth < 768 ? 256 : 480;
    // Smaller planes need proportionally fewer segments for the same density.
    return Math.max(96, Math.round(base * (map.width / WORLD_WIDTH)));
  }, [map.width]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[map.center[0], 0, map.center[1]]}
    >
      <planeGeometry args={[map.width, map.depth, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={TERRAIN_VERTEX}
        fragmentShader={TERRAIN_FRAGMENT}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// Camera framing when a pin's timeline card is centred in the viewport:
// low and close so the flight between cities really pans across the map.
const PIN_VIEW_OFFSET = new THREE.Vector3(0, 1.35, 1.75);
// Slight look-at shift away from the card's side — the card is docked to
// the screen edge, so the marker only needs a nudge to sit clear of it.
const SIDE_SHIFT = 0.3;

function CameraRig({ reduceMotion }: { reduceMotion: boolean }) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const targetPointer = useRef({ x: 0, y: 0 });
  const waypointEls = useRef<HTMLElement[]>([]);
  const frame = useRef(0);

  const views = useMemo(() => {
    const v: Record<string, { pos: THREE.Vector3; tgt: THREE.Vector3 }> = {};
    for (const pin of MAP_PINS) {
      const tgt = new THREE.Vector3(...pinToWorld(pin));
      v[pin.id] = { tgt, pos: tgt.clone().add(PIN_VIEW_OFFSET) };
    }
    // Skills section: tilt up into the night sky — the constellation IS
    // the section now (no panel), so the stars fill the frame.
    v["view-network"] = {
      tgt: new THREE.Vector3(0, 1.75, -0.6),
      pos: new THREE.Vector3(0.2, 2.15, 7.5),
    };
    // Sneak peek: sail south past the chart's edge into uncharted waters —
    // the serpent and compass rose live on the blank page down there.
    v["view-uncharted"] = {
      tgt: new THREE.Vector3(1.4, 0.3, 4.1),
      pos: new THREE.Vector3(1.6, 2.0, 7.6),
    };
    return v;
  }, []);

  // Scratch vectors reused every frame to avoid GC churn.
  const scratchRef = useRef({
    pos: new THREE.Vector3(),
    tgt: new THREE.Vector3(),
    overviewPos: new THREE.Vector3(),
    overviewTgt: new THREE.Vector3(0, 0, -0.45),
    curPos: new THREE.Vector3(),
    curTgt: new THREE.Vector3(),
    initialized: false,
  });

  // Track the pointer on window so parallax works even when DOM overlays
  // (title, avatar, post-its) sit above the canvas.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      targetPointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetPointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const scratch = scratchRef.current;
    // Clamp tab-switch spikes; convert smoothing to per-second rates so the
    // flight feels identical at 60 and 120 Hz.
    const dt = Math.min(delta, 0.1);
    const t = reduceMotion
      ? 1
      : Math.min(state.clock.elapsedTime / INTRO_SECONDS, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    const pk = reduceMotion ? 0 : 1 - Math.exp(-dt * 2.5);
    pointer.current.x += (targetPointer.current.x - pointer.current.x) * pk;
    pointer.current.y += (targetPointer.current.y - pointer.current.y) * pk;

    const drift = reduceMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
    // Portrait screens see a narrower slice, so back the camera off until
    // the whole map fits.
    const aspect = state.size.width / state.size.height;
    const fit = Math.max(1, Math.min(2.5, 1.45 / aspect));
    const portrait = aspect < 1;

    // Overview pose (the hero framing) — intro drops from high to oblique.
    if (portrait) {
      // Portrait flips the hero 90°. The landscape pose views the Kobe→Tokyo
      // corridor broadside, which crams its long axis into the narrow column
      // and clips the end cities off the sides. Instead the camera sits off
      // the *southwest* end behind Kobe/Osaka and looks down the corridor
      // toward Tokyo, so the journey runs bottom→top: Kansai in the
      // foreground, Fuji mid-route, Tokyo receding near the title. The camera
      // is aligned with the corridor's heading (~15° N of E) so the diagonal
      // projects vertical and centred rather than leaning. The coast-to-coast
      // heightmap means land fills the frame and fades into sea (= blank page)
      // on every visible edge — no hard plane-edge cut as the old short strip
      // had when it sliced through the inland mountains at its north edge.
      const T = HERO_TUNE;
      // Look-at: a point on the corridor toward Fuji, lifted a touch (ty>0) so
      // the far land tucks under the title instead of sinking to the bottom.
      const tx = T.tx ?? 0.2;
      const ty = T.ty ?? 0.3;
      const tz = T.tz ?? 0.0;
      // Narrower columns see less of the corridor before it runs past the top
      // edge, so ease the camera back (scaling its offset from the look-at, so
      // the framing only shrinks, never re-aims) as the aspect narrows below
      // the tuning reference (~390×844). 1.0 keeps the hand-tuned pose there.
      const pfit = Math.min(1.4, Math.max(1, 0.462 / aspect));
      scratch.overviewPos.set(
        tx + ((T.px ?? -6.3) - tx) * pfit + pointer.current.x * 0.3 + drift,
        ty + ((T.py ?? 5.0) - ty) * pfit + (1 - ease) * 3.5 - pointer.current.y * 0.2,
        tz + ((T.pz ?? 1.78) - tz) * pfit
      );
      scratch.overviewTgt.set(tx, ty, tz);
    } else {
      // Rests a touch higher + closer than a pure horizon view so the terrain
      // fills more of the frame top-to-bottom (less blank paper above/below).
      scratch.overviewPos.set(
        0.2 + pointer.current.x * 0.45 + drift,
        (6.2 - ease * 2.0 - pointer.current.y * 0.3) * fit,
        (4.6 + ease * 0.4) * fit
      );
      scratch.overviewTgt.set(0, 0, -0.45);
    }

    // Blend toward pin views based on which [data-map-waypoint] element is
    // nearest the viewport centre — scrolling the timeline flies the camera.
    if (frame.current % 30 === 0) {
      waypointEls.current = Array.from(
        document.querySelectorAll<HTMLElement>("[data-map-waypoint]")
      );
    }
    frame.current++;

    scratch.pos.set(0, 0, 0);
    scratch.tgt.set(0, 0, 0);
    let sum = 0;
    let closeup = 0;
    let network = 0;
    let uncharted = 0;
    const weights: Record<string, number> = {};
    if (!reduceMotion) {
      const vh = window.innerHeight;
      for (const el of waypointEls.current) {
        const id = el.dataset.mapWaypoint ?? "";
        const view = views[id];
        if (!view) continue;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        // Narrow window: only the card actually near the focus line drives the
        // camera, so neighbouring cards can't drag the frame. The dead zone
        // keeps the weight pinned at 1 while the card sits near the line, so
        // small rect changes (entrance animation, typing, hover) can't jiggle
        // the camera mid-read. On portrait the card docks to the lower band, so
        // the focus line sits low and the marker frames into the map above it.
        const focus = portrait ? vh * 0.66 : vh * 0.5;
        const dist = Math.abs(center - focus);
        const dead = vh * 0.1;
        const span = vh * 0.55;
        let w = dist <= dead ? 1 : 1 - (dist - dead) / (span - dead);
        if (w <= 0) continue;
        w = w * w * (3 - 2 * w); // smoothstep

        scratch.pos.addScaledVector(view.pos, w);
        scratch.tgt.addScaledVector(view.tgt, w);
        if (id === "view-network") {
          network = Math.min(1, network + w);
        } else if (id === "view-uncharted") {
          uncharted = Math.min(1, uncharted + w);
        } else {
          // Shift the look-at point so the marker shows beside the card,
          // not underneath it (cards alternate sides on desktop).
          if (portrait) {
            scratch.tgt.z += 0.95 * w;
          } else {
            // Card on the right → look-at point east of the pin → the pin
            // lands on the left half of the screen (and vice versa).
            const side = el.dataset.waypointSide === "right" ? 1 : -1;
            scratch.tgt.x += side * SIDE_SHIFT * w;
          }
          weights[id] = (weights[id] ?? 0) + w;
          closeup = Math.max(closeup, w);
        }
        // Back off further on portrait screens, same as the overview does.
        scratch.pos.y += (fit - 1) * 1.1 * w;
        scratch.pos.z += (fit - 1) * 1.3 * w;
        sum += w;
      }
      if (sum > 1) {
        scratch.pos.divideScalar(sum);
        scratch.tgt.divideScalar(sum);
        sum = 1;
      }
    }
    sceneState.pinWeights = weights;
    sceneState.closeup = Math.min(1, closeup);
    sceneState.network = network;
    sceneState.uncharted = uncharted;

    const ow = 1 - sum;
    scratch.pos.addScaledVector(scratch.overviewPos, ow);
    scratch.tgt.addScaledVector(scratch.overviewTgt, ow);

    // Smooth toward the blended pose so flights feel like flights.
    if (!scratch.initialized || reduceMotion) {
      scratch.curPos.copy(scratch.pos);
      scratch.curTgt.copy(scratch.tgt);
      scratch.initialized = true;
    } else {
      const ck = 1 - Math.exp(-dt * 4.3);
      scratch.curPos.lerp(scratch.pos, ck);
      scratch.curTgt.lerp(scratch.tgt, ck);
    }
    camera.position.copy(scratch.curPos);
    camera.lookAt(scratch.curTgt);
  });

  return null;
}

// ── Hand-drawn pennant marker ──────────────────────────────────────────
// Plane size (world units) and where the pole sits across the texture. The
// flag is offset so the pole lands exactly on the pin's x/z — i.e. on the
// Y-billboard axis, so it stays planted while the flag faces the camera.
const FLAG_W = 0.24;
const FLAG_H = 0.32;
const FLAG_POLE_U = 0.16; // pole's horizontal position in the texture (0..1)
const FLAG_OFFSET_X = (0.5 - FLAG_POLE_U) * FLAG_W;
// Wave: amplitude grows from the hoist (pole) to the fly end so the pole is
// motionless and the tail flutters. Vertical (local-Y) displacement reads from
// any camera azimuth on an unlit billboarded plane (a Z ripple would not).
const FLAG_AMP = 0.04;
const FLAG_FREQ = 7.0;
const FLAG_SPEED = 3.2;

const PENNANT_CACHE = new Map<string, THREE.Texture>();

/** A wobbly-inked swallowtail pennant on a pole, drawn once per colour. */
function pennantTexture(color: string): THREE.Texture {
  const cached = PENNANT_CACHE.get(color);
  if (cached) return cached;

  const w = 180;
  const h = 240;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const ink = "#2D2D2D";

  const poleX = w * FLAG_POLE_U;
  const flagTop = h * 0.07;
  const flagBot = h * 0.34;
  const flyX = w * 0.94;
  const flagMid = (flagTop + flagBot) / 2;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Swallowtail pennant — slightly wavy edges so it reads hand-drawn.
  ctx.beginPath();
  ctx.moveTo(poleX, flagTop);
  ctx.quadraticCurveTo(w * 0.55, flagTop - h * 0.012, flyX, flagTop + h * 0.05);
  ctx.lineTo(flyX - w * 0.16, flagMid); // notch
  ctx.lineTo(flyX, flagBot - h * 0.05);
  ctx.quadraticCurveTo(w * 0.55, flagBot + h * 0.012, poleX, flagBot);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.stroke();

  // A soft fold line gives the cloth some body.
  ctx.strokeStyle = "rgba(45,45,45,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(poleX + w * 0.06, flagTop + h * 0.025);
  ctx.quadraticCurveTo(w * 0.5, flagMid, flyX - w * 0.22, flagBot - h * 0.03);
  ctx.stroke();

  // The pole: a wobbly ink stroke with a little finial knob on top.
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(poleX, flagTop - h * 0.02);
  ctx.quadraticCurveTo(poleX - w * 0.018, h * 0.45, poleX + w * 0.012, h * 0.72);
  ctx.quadraticCurveTo(poleX + w * 0.02, h * 0.88, poleX, h * 0.98);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(poleX, flagTop - h * 0.02, 5, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  PENNANT_CACHE.set(color, tex);
  return tex;
}

// ── Mt. Fuji landmark glyph ────────────────────────────────────────────
// A landmark, not a workplace: instead of a flag, an inked snow-capped peak.
// The terrain only renders Fuji as faint contour rings, so this icon makes it
// instantly read as the mountain. Wider than a flag, sits on the summit.
const FUJI_W = 0.34;
const FUJI_H = FUJI_W * (210 / 240);

let FUJI_TEX: THREE.Texture | null = null;

/** Hand-inked snow-capped Mt. Fuji silhouette. */
function fujiTexture(body: string): THREE.Texture {
  if (FUJI_TEX) return FUJI_TEX;
  const w = 240;
  const h = 210;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const ink = "#2D2D2D";
  const snow = "#F3F6FB";

  // Fuji's signature concave slopes + flat summit.
  const mountain = () => {
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.95);
    ctx.quadraticCurveTo(w * 0.28, h * 0.52, w * 0.43, h * 0.2);
    ctx.quadraticCurveTo(w * 0.47, h * 0.14, w * 0.5, h * 0.15);
    ctx.quadraticCurveTo(w * 0.53, h * 0.14, w * 0.57, h * 0.2);
    ctx.quadraticCurveTo(w * 0.72, h * 0.52, w * 0.95, h * 0.95);
    ctx.closePath();
  };

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // body
  mountain();
  ctx.fillStyle = body;
  ctx.fill();

  // snow cap — clipped to the mountain, with a jagged lower edge (snow streaks)
  ctx.save();
  mountain();
  ctx.clip();
  ctx.fillStyle = snow;
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.lineTo(w + 2, -2);
  ctx.lineTo(w + 2, h * 0.34);
  ctx.lineTo(w * 0.7, h * 0.4);
  ctx.lineTo(w * 0.63, h * 0.53);
  ctx.lineTo(w * 0.57, h * 0.39);
  ctx.lineTo(w * 0.5, h * 0.56);
  ctx.lineTo(w * 0.44, h * 0.39);
  ctx.lineTo(w * 0.37, h * 0.51);
  ctx.lineTo(w * 0.3, h * 0.4);
  ctx.lineTo(-2, h * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // faint slope shading
  ctx.strokeStyle = "rgba(45,45,45,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.34);
  ctx.quadraticCurveTo(w * 0.4, h * 0.62, w * 0.3, h * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.52, h * 0.34);
  ctx.quadraticCurveTo(w * 0.63, h * 0.62, w * 0.73, h * 0.9);
  ctx.stroke();

  // confident inked outline
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4.5;
  mountain();
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  FUJI_TEX = tex;
  return tex;
}

/** Hand-drawn pennant, planted at the location and fluttering in the
 *  prevailing wind. Billboards (Y-axis only) so it reads from any angle.
 *  Landmarks (Fuji) render an inked peak instead of a flag. */
function PinMarker({
  pin,
  onSelect,
  reduceMotion,
}: {
  pin: MapPin;
  onSelect: (pin: MapPin) => void;
  reduceMotion: boolean;
}) {
  const { content, t, isJapanese } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const markerRef = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLButtonElement>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  // Rest-pose vertex Y + horizontal UV, captured once for the flutter loop.
  const flagBaseRef = useRef<{ baseY: Float32Array; u: Float32Array } | null>(
    null
  );
  const isLandmark = pin.kind === "landmark";
  const pennant = useMemo(
    () => (isLandmark ? null : pennantTexture(pin.color)),
    [isLandmark, pin.color]
  );
  const fuji = useMemo(
    () => (isLandmark ? fujiTexture(pin.color) : null),
    [isLandmark, pin.color]
  );

  const experience = pin.experienceId
    ? content.experiences.find((e) => e.id === pin.experienceId)
    : undefined;
  const label = pin.labelKey
    ? t(pin.labelKey)
    : experience
      ? `${experience.company} ’${experience.date.slice(-2)}`
      : "";

  const position = pinToWorld(pin);
  const interactive = pin.kind === "job";
  // Per-pin phase so neighbouring flags don't flutter in lockstep.
  const phase = useMemo(() => position[0] * 5.1 + position[2] * 2.3, [position]);
  const worldPos = useMemo(
    () => new THREE.Vector3(...position),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    const w = sceneState.pinWeights[pin.id] ?? 0;
    // Markers grow when their card is focused. Landmark markers (Fuji)
    // shrink away during closeups — at low altitude they read as floating
    // balls rather than pins.
    if (markerRef.current) {
      // Y-axis billboard: face the camera horizontally while staying upright,
      // so the pennant reads in both the portrait and desktop camera poses.
      // The pole sits on this axis (x=z=0), so it stays planted on its pin.
      const cam = state.camera.position;
      markerRef.current.rotation.y = Math.atan2(
        cam.x - position[0],
        cam.z - position[2]
      );
      // Lift only when focused (scroll-driven) — no idle bob/pulse.
      markerRef.current.position.y = w * 0.05;
      const landmarkShrink =
        pin.kind === "landmark"
          ? 1 -
            Math.max(
              sceneState.closeup,
              sceneState.network,
              sceneState.uncharted
            ) *
              0.9
          : 1;
      // Modest growth only — the closeup camera is already near the pin, so
      // big scale multipliers read as a flat blob filling the frame.
      markerRef.current.scale.setScalar((1 + w * 0.28) * landmarkShrink);
    }
    if (ringMatRef.current) {
      // The ground shadow ring reads as a grey smudge at low altitude.
      ringMatRef.current.opacity = 0.18 * (1 - w * 0.75);
    }
    // Flag flutter — a traveling vertical wave whose amplitude grows from the
    // hoist (pole, motionless) to the fly end. Mutated through the mesh ref.
    if (flagRef.current && !reduceMotion) {
      const pos = flagRef.current.geometry.attributes
        .position as THREE.BufferAttribute;
      if (!flagBaseRef.current) {
        const uv = flagRef.current.geometry.attributes.uv as THREE.BufferAttribute;
        const baseY = new Float32Array(pos.count);
        const u = new Float32Array(pos.count);
        for (let i = 0; i < pos.count; i++) {
          baseY[i] = pos.getY(i);
          u[i] = uv.getX(i);
        }
        flagBaseRef.current = { baseY, u };
      }
      const { baseY, u } = flagBaseRef.current;
      const t = state.clock.elapsedTime;
      for (let i = 0; i < pos.count; i++) {
        const uu = u[i];
        const amp =
          uu <= FLAG_POLE_U + 0.02
            ? 0
            : FLAG_AMP * Math.pow((uu - FLAG_POLE_U - 0.02) / 0.8, 1.4);
        pos.setY(i, baseY[i] + amp * Math.sin(uu * FLAG_FREQ - t * FLAG_SPEED + phase));
      }
      pos.needsUpdate = true;
    }
    if (labelRef.current) {
      // Unfocused labels fade during closeups; the focused pin's pill stays,
      // glides to sit directly above its marker, and counter-scales against
      // the distanceFactor growth so it keeps a readable size.
      const fade = Math.max(
        sceneState.closeup,
        sceneState.network,
        sceneState.uncharted
      );
      // Non-focused labels clear out fast once the camera commits to any place,
      // so the focused pin's pill never competes with stray captions drifting
      // in behind a card (e.g. Fuji's long "…showing off" tail orphaned in open
      // water once its marker shrinks away). The focused pin (w high) is held up
      // by the `+ w` term regardless of fade.
      const ambient = Math.max(0, 1 - fade * 2.2);
      const opacity = ambient * (1 - w) + w;
      // On a phone-width canvas use the pulled-in portrait offset so the pill
      // stays on-screen; fall back to the desktop offset otherwise.
      const offset =
        (state.size.width < 640 && pin.labelOffsetMobile) || pin.labelOffset;
      const baseX = offset?.[0] ?? 0;
      const baseY = offset?.[1] ?? 0;
      const ox = baseX * (1 - w);
      const oy = baseY * (1 - w) - 95 * w;
      const dist = state.camera.position.distanceTo(worldPos);
      const counter = Math.min(1, Math.max(0.22, dist / 8));
      const s = (1 - w + counter * w) * (hoveredRef.current ? 1.08 : 1);
      labelRef.current.style.opacity = String(opacity);
      labelRef.current.style.transform = `translate(${ox}px, ${oy}px) scale(${s})`;
    }
  });

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={5}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <button
          ref={labelRef}
          type="button"
          onClick={interactive ? () => onSelect(pin) : undefined}
          onMouseEnter={() => {
            setHovered(true);
            hoveredRef.current = true;
          }}
          onMouseLeave={() => {
            setHovered(false);
            hoveredRef.current = false;
          }}
          aria-label={label}
          className="terrain-pin"
          data-kind={pin.kind}
          data-hovered={hovered}
          style={{
            pointerEvents: interactive ? "auto" : "none",
            cursor: interactive ? "pointer" : "default",
            transition: "none",
            transform: pin.labelOffset
              ? `translate(${pin.labelOffset[0]}px, ${pin.labelOffset[1]}px)`
              : undefined,
            fontFamily: isJapanese
              ? "var(--font-jp-handwritten)"
              : "var(--font-handwritten)",
          }}
        >
          <span className="terrain-pin-dot" style={{ background: pin.color }} />
          <span className="terrain-pin-label">{label}</span>
        </button>
      </Html>

      {pin.kind !== "offmap" && (
        <group ref={markerRef}>
          {isLandmark ? (
            /* Mt. Fuji — an inked snow-capped peak instead of a flag. */
            <mesh position={[0, FUJI_H * 0.34, 0]}>
              <planeGeometry args={[FUJI_W, FUJI_H]} />
              <meshBasicMaterial
                map={fuji ?? undefined}
                transparent
                alphaTest={0.4}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          ) : (
            <>
              {/* Pennant on a pole — pole edge sits on the billboard axis so
                  it stays planted; the fly end flutters (see useFrame). */}
              <mesh ref={flagRef} position={[FLAG_OFFSET_X, FLAG_H / 2, 0]}>
                <planeGeometry args={[FLAG_W, FLAG_H, 24, 4]} />
                <meshBasicMaterial
                  map={pennant ?? undefined}
                  transparent
                  alphaTest={0.4}
                  side={THREE.DoubleSide}
                  toneMapped={false}
                />
              </mesh>
              {/* faint ink ground-mark so the flag reads as planted */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
                <ringGeometry args={[0.018, 0.04, 18]} />
                <meshBasicMaterial
                  ref={ringMatRef}
                  color="#2D2D2D"
                  transparent
                  opacity={0.18}
                />
              </mesh>
            </>
          )}
        </group>
      )}
    </group>
  );
}

/** Dotted route (classic "journey" map style) that arcs off the west edge
 *  of the main map, across the open page, and lands on the Mumbai inset
 *  while the internship card is in view. Dots appear one by one from Kobe
 *  outward, like a pen tapping out the route. */
function MumbaiTrail() {
  const { t, isJapanese } = useTranslation();
  const groupRef = useRef<THREE.Group>(null);
  const dotMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const captionRef = useRef<HTMLDivElement>(null);

  const { dots, captionPos } = useMemo(() => {
    const kobe = MAP_PINS.find((p) => p.id === "pin-khi")!;
    const mumbai = MAP_PINS.find((p) => p.id === "pin-mumbai")!;
    const [kx, , kz] = pinToWorld(kobe);
    const [mx, , mz] = pinToWorld(mumbai);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(kx, 0.08, kz),
      // Arc high over the "sea" of open paper between the two maps.
      new THREE.Vector3((kx + mx) / 2 + 0.3, 1.6, (kz + mz) / 2 - 1.1),
      new THREE.Vector3(mx, 0.14, mz)
    );
    const inset = TERRAIN_MAPS.mumbai;
    return {
      dots: curve.getPoints(40),
      // North of the inset: the closeup camera looks from the south, so the
      // caption reads like a map title floating just beyond the island.
      captionPos: new THREE.Vector3(
        inset.center[0],
        0.05,
        inset.center[1] - inset.depth / 2 - 0.35
      ),
    };
  }, []);

  useFrame(() => {
    const w = sceneState.pinWeights["pin-mumbai"] ?? 0;
    const group = groupRef.current;
    if (!group) return;
    group.visible = w > 0.02;
    if (captionRef.current) {
      captionRef.current.style.opacity = String(Math.max(0, w * 1.2 - 0.2));
    }
    if (!group.visible) return;
    dotMatsRef.current.forEach((m, i) => {
      if (!m) return;
      // Reveal dots progressively from Kobe outward as the card centres.
      const reveal = THREE.MathUtils.clamp(w * 1.35 - i / dots.length, 0, 1);
      m.opacity = reveal * 0.9;
    });
  });

  return (
    <>
      <group ref={groupRef} visible={false}>
        {dots.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.034, 8, 8]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) dotMatsRef.current[i] = m;
              }}
              color="#2E8B74"
              transparent
              opacity={0}
            />
          </mesh>
        ))}
      </group>
      {/* Hand-lettered caption under the inset, fading in with the flight */}
      <group position={captionPos}>
        <Html center distanceFactor={5} zIndexRange={[19, 0]} style={{ pointerEvents: "none" }}>
          <div
            ref={captionRef}
            className="map-inset-caption"
            style={{
              opacity: 0,
              fontFamily: isJapanese
                ? "var(--font-jp-handwritten)"
                : "var(--font-handwritten)",
            }}
          >
            {t("hero.mumbai_inset")}
          </div>
        </Html>
      </group>
    </>
  );
}

function Pins({ reduceMotion }: { reduceMotion: boolean }) {
  const handleSelect = (pin: MapPin) => {
    const el =
      (pin.experienceId && document.getElementById(pin.experienceId)) ||
      document.getElementById("timeline");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <>
      {MAP_PINS.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          onSelect={handleSelect}
          reduceMotion={reduceMotion}
        />
      ))}
    </>
  );
}

export default function TerrainScene({
  reduceMotion,
  active,
}: {
  reduceMotion: boolean;
  active: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0.5, 6.6, 5.4] }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      onPointerMissed={() => {
        // Tap/click on empty sky releases the orbiting stars.
        sceneState.skyHover = null;
      }}
    >
      <Terrain map={TERRAIN_MAPS.tokaido} reduceMotion={reduceMotion} />
      <Terrain map={TERRAIN_MAPS.mumbai} reduceMotion={reduceMotion} />
      <CameraRig reduceMotion={reduceMotion} />
      <Pins reduceMotion={reduceMotion} />
      <MumbaiTrail />
      <UnchartedWaters />
    </Canvas>
  );
}

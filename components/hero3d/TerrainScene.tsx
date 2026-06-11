"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { TERRAIN_VERTEX, TERRAIN_FRAGMENT } from "./terrainShaders";
import {
  HEIGHT_SCALE,
  MAP_BOUNDS,
  MAP_PINS,
  WORLD_DEPTH,
  WORLD_WIDTH,
  lonLatToWorld,
  type MapPin,
} from "./mapData";
import { sceneState } from "./sceneState";
import { useTranslation } from "@/hooks/useTranslation";

const INTRO_SECONDS = 2.8;

function Terrain({ reduceMotion }: { reduceMotion: boolean }) {
  const heightmap = useTexture("/terrain/tokaido-heightmap.png");
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    heightmap.colorSpace = THREE.NoColorSpace;
    heightmap.minFilter = THREE.LinearFilter;
    heightmap.magFilter = THREE.LinearFilter;
    heightmap.wrapS = heightmap.wrapT = THREE.ClampToEdgeWrapping;
    return {
      uHeightmap: { value: heightmap },
      uHeightScale: { value: HEIGHT_SCALE },
      uReveal: { value: reduceMotion ? 1 : 0 },
      uTime: { value: 0 },
      uTexel: {
        value: new THREE.Vector2(1 / MAP_BOUNDS.width, 1 / MAP_BOUNDS.height),
      },
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

  const segments = useMemo(
    () => (typeof window !== "undefined" && window.innerWidth < 768 ? 256 : 480),
    []
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[WORLD_WIDTH, WORLD_DEPTH, segments, segments]} />
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
      const [x, y, z] = lonLatToWorld(pin.lon, pin.lat, pin.elevation);
      const tgt = new THREE.Vector3(x, y, z);
      v[pin.id] = { tgt, pos: tgt.clone().add(PIN_VIEW_OFFSET) };
    }
    // Skills/AI section: lift off the map and look across the constellation
    // floating above it.
    v["view-network"] = {
      tgt: new THREE.Vector3(0, 1.35, -0.6),
      pos: new THREE.Vector3(0.2, 1.7, 4.9),
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

  useFrame((state) => {
    const scratch = scratchRef.current;
    const t = reduceMotion
      ? 1
      : Math.min(state.clock.elapsedTime / INTRO_SECONDS, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    pointer.current.x +=
      (targetPointer.current.x - pointer.current.x) * (reduceMotion ? 0 : 0.04);
    pointer.current.y +=
      (targetPointer.current.y - pointer.current.y) * (reduceMotion ? 0 : 0.04);

    const drift = reduceMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
    // Portrait screens see a narrower slice, so back the camera off until
    // the whole map fits.
    const aspect = state.size.width / state.size.height;
    const fit = Math.max(1, Math.min(2.5, 1.45 / aspect));
    const portrait = aspect < 1;

    // Overview pose (the hero framing) — intro drops from high to oblique.
    scratch.overviewPos.set(
      0.2 + pointer.current.x * 0.45 + drift,
      (6.2 - ease * 2.6 - pointer.current.y * 0.3) * fit,
      (4.6 + ease * 0.7) * fit
    );

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
    const weights: Record<string, number> = {};
    if (!reduceMotion) {
      const vh = window.innerHeight;
      for (const el of waypointEls.current) {
        const id = el.dataset.mapWaypoint ?? "";
        const view = views[id];
        if (!view) continue;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        // Narrow window: only the card actually near the viewport centre
        // drives the camera, so neighbouring cards can't drag the frame.
        let w = 1 - Math.abs(center - vh * 0.5) / (vh * 0.55);
        if (w <= 0) continue;
        w = w * w * (3 - 2 * w); // smoothstep

        scratch.pos.addScaledVector(view.pos, w);
        scratch.tgt.addScaledVector(view.tgt, w);
        if (id !== "view-network") {
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
        } else {
          network = Math.min(1, network + w);
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

    const ow = 1 - sum;
    scratch.pos.addScaledVector(scratch.overviewPos, ow);
    scratch.tgt.addScaledVector(scratch.overviewTgt, ow);

    // Smooth toward the blended pose so flights feel like flights.
    if (!scratch.initialized || reduceMotion) {
      scratch.curPos.copy(scratch.pos);
      scratch.curTgt.copy(scratch.tgt);
      scratch.initialized = true;
    } else {
      scratch.curPos.lerp(scratch.pos, 0.07);
      scratch.curTgt.lerp(scratch.tgt, 0.07);
    }
    camera.position.copy(scratch.curPos);
    camera.lookAt(scratch.curTgt);
  });

  return null;
}

/** Classic pushpin: teardrop head on a needle, bobbing gently. */
function PinMarker({
  pin,
  onSelect,
}: {
  pin: MapPin;
  onSelect: (pin: MapPin) => void;
}) {
  const { content, t, isJapanese } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const markerRef = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLButtonElement>(null);

  const experience = pin.experienceId
    ? content.experiences.find((e) => e.id === pin.experienceId)
    : undefined;
  const label = pin.labelKey
    ? t(pin.labelKey)
    : experience
      ? `${experience.company} ’${experience.date.slice(-2)}`
      : "";

  const position = lonLatToWorld(pin.lon, pin.lat, pin.elevation);
  const interactive = pin.kind === "job";
  const phase = useMemo(() => position[0] * 7.3 + position[2] * 3.1, [position]);
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
      const bob =
        Math.sin(state.clock.elapsedTime * 1.6 + phase) * 0.018 * (1 + w);
      markerRef.current.position.y = bob + w * 0.05;
      const landmarkShrink =
        pin.kind === "landmark"
          ? 1 - Math.max(sceneState.closeup, sceneState.network) * 0.9
          : 1;
      markerRef.current.scale.setScalar((1 + w * 0.9) * landmarkShrink);
    }
    if (labelRef.current) {
      // Unfocused labels fade during closeups; the focused pin's pill stays,
      // glides to sit directly above its marker, and counter-scales against
      // the distanceFactor growth so it keeps a readable size.
      const fade = Math.max(sceneState.closeup, sceneState.network);
      const opacity = (1 - fade * 0.92) * (1 - w) + w;
      const baseX = pin.labelOffset?.[0] ?? 0;
      const baseY = pin.labelOffset?.[1] ?? 0;
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
          {/* needle */}
          <mesh position={[0, 0.075, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.02, 0.15, 10]} />
            <meshBasicMaterial color="#2D2D2D" />
          </mesh>
          {/* teardrop head */}
          <mesh position={[0, 0.175, 0]}>
            <sphereGeometry args={[0.055, 18, 18]} />
            <meshBasicMaterial color={pin.color} />
          </mesh>
          {/* paper-white glint so the head reads hand-drawn, not flat */}
          <mesh position={[-0.018, 0.192, 0.038]}>
            <sphereGeometry args={[0.016, 10, 10]} />
            <meshBasicMaterial color="#FFF9E5" />
          </mesh>
          {/* ink shadow ring on the ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <ringGeometry args={[0.02, 0.05, 20]} />
            <meshBasicMaterial color="#2D2D2D" transparent opacity={0.18} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Dotted route (classic "journey" map style) that arcs off the west edge
 *  of the map toward Mumbai while the internship card is in view. Dots
 *  appear one by one from Kobe outward, like a pen tapping out the route. */
function MumbaiTrail() {
  const groupRef = useRef<THREE.Group>(null);
  const dotMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  const dots = useMemo(() => {
    const kobe = MAP_PINS.find((p) => p.id === "pin-khi")!;
    const note = MAP_PINS.find((p) => p.id === "pin-mumbai")!;
    const [kx, , kz] = lonLatToWorld(kobe.lon, kobe.lat, 0);
    const [nx, , nz] = lonLatToWorld(note.lon, note.lat, 0);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(kx, 0.08, kz),
      new THREE.Vector3((kx + nx) / 2 - 1.2, 0.8, (kz + nz) / 2 + 0.4),
      new THREE.Vector3(-6.2, 0.3, nz + 1.1)
    );
    return curve.getPoints(26);
  }, []);

  useFrame(() => {
    const w = sceneState.pinWeights["pin-mumbai"] ?? 0;
    const group = groupRef.current;
    if (!group) return;
    group.visible = w > 0.02;
    if (!group.visible) return;
    dotMatsRef.current.forEach((m, i) => {
      if (!m) return;
      // Reveal dots progressively from Kobe outward as the card centres.
      const reveal = THREE.MathUtils.clamp(w * 1.35 - i / dots.length, 0, 1);
      m.opacity = reveal * 0.9;
    });
  });

  return (
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
  );
}

/** Seeded PRNG so SSR/client and every visit agree on the constellation. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NETWORK_ACCENTS = ["#E63946", "#3B5998", "#B8860B", "#2E8B74"];

/** The AI constellation: an inked node graph floating above the terrain,
 *  with packets travelling its edges. Appears for the skills section. */
function NetworkLayer() {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const nodeMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  const graphRef = useRef<{
    nodes: THREE.Vector3[];
    edges: [number, number][];
    lineObj: THREE.LineSegments;
  } | null>(null);
  if (graphRef.current === null) {
    const rng = mulberry32(1337);
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < 36; i++) {
      nodes.push(
        new THREE.Vector3(
          (rng() - 0.5) * 8.5,
          1.0 + rng() * 1.3,
          (rng() - 0.5) * 3.4 - 0.4
        )
      );
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      const near = nodes
        .map((n, j) => ({ j, d: n.distanceTo(nodes[i]) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      for (const { j } of near) {
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        if (!edges.some((e) => e[0] === a && e[1] === b)) edges.push([a, b]);
      }
    }
    const pts: THREE.Vector3[] = [];
    for (const [a, b] of edges) pts.push(nodes[a], nodes[b]);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: "#2D2D2D",
      dashSize: 0.06,
      gapSize: 0.045,
      transparent: true,
      opacity: 0,
    });
    const lineObj = new THREE.LineSegments(geo, mat);
    lineObj.computeLineDistances();
    graphRef.current = { nodes, edges, lineObj };
  }
  const { nodes, edges, lineObj } = graphRef.current;

  const pulses = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        edge: (i * 5) % edges.length,
        offset: i / 7,
        speed: 0.22 + (i % 3) * 0.09,
      })),
    [edges.length]
  );

  useFrame((state) => {
    const w = sceneState.network;
    const group = groupRef.current;
    if (!group) return;
    group.visible = w > 0.02;
    if (!group.visible) return;

    group.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    (lineObj.material as THREE.LineDashedMaterial).opacity = w * 0.65;
    for (const m of nodeMatsRef.current) if (m) m.opacity = w;

    pulses.forEach((p, i) => {
      const mesh = pulseRefs.current[i];
      if (!mesh) return;
      const [a, b] = edges[p.edge];
      const t = (state.clock.elapsedTime * p.speed + p.offset) % 1;
      mesh.position.lerpVectors(nodes[a], nodes[b], t);
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = w * (0.4 + 0.6 * Math.sin(t * Math.PI));
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={lineObj} />
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[i % 6 === 0 ? 0.045 : 0.028, 10, 10]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) nodeMatsRef.current[i] = m;
            }}
            color={i % 6 === 0 ? NETWORK_ACCENTS[i % 4] : "#2D2D2D"}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
      {pulses.map((_, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={(m) => {
            pulseRefs.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#E63946" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function Pins() {
  const handleSelect = (pin: MapPin) => {
    const el =
      (pin.experienceId && document.getElementById(pin.experienceId)) ||
      document.getElementById("timeline");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <>
      {MAP_PINS.map((pin) => (
        <PinMarker key={pin.id} pin={pin} onSelect={handleSelect} />
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
    >
      <Terrain reduceMotion={reduceMotion} />
      <CameraRig reduceMotion={reduceMotion} />
      <Pins />
      <MumbaiTrail />
      <NetworkLayer />
    </Canvas>
  );
}

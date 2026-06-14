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
        // Narrow window: only the card actually near the viewport centre
        // drives the camera, so neighbouring cards can't drag the frame.
        // The dead zone keeps the weight pinned at 1 while the card is near
        // the centre, so small rect changes (entrance animation, typing,
        // hover) can't jiggle the camera mid-read.
        const dist = Math.abs(center - vh * 0.5);
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
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);

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
    if (labelRef.current) {
      // Unfocused labels fade during closeups; the focused pin's pill stays,
      // glides to sit directly above its marker, and counter-scales against
      // the distanceFactor growth so it keeps a readable size.
      const fade = Math.max(
        sceneState.closeup,
        sceneState.network,
        sceneState.uncharted
      );
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
            <meshBasicMaterial
              ref={ringMatRef}
              color="#2D2D2D"
              transparent
              opacity={0.18}
            />
          </mesh>
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
      onPointerMissed={() => {
        // Tap/click on empty sky releases the orbiting stars.
        sceneState.skyHover = null;
      }}
    >
      <Terrain map={TERRAIN_MAPS.tokaido} reduceMotion={reduceMotion} />
      <Terrain map={TERRAIN_MAPS.mumbai} reduceMotion={reduceMotion} />
      <CameraRig reduceMotion={reduceMotion} />
      <Pins />
      <MumbaiTrail />
      <UnchartedWaters />
    </Canvas>
  );
}

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
import { useTranslation } from "@/hooks/useTranslation";

const INTRO_SECONDS = 2.8;

const PIN_COLORS: Record<MapPin["kind"], string> = {
  job: "#E63946",
  landmark: "#3B5998",
  offmap: "#E63946",
};

function Terrain({ reduceMotion }: { reduceMotion: boolean }) {
  const heightmap = useTexture("/terrain/kanto-heightmap.png");
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

function CameraRig({ reduceMotion }: { reduceMotion: boolean }) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const targetPointer = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(0.3, 0, -1.1), []);

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
    const t = reduceMotion
      ? 1
      : Math.min(state.clock.elapsedTime / INTRO_SECONDS, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    pointer.current.x +=
      (targetPointer.current.x - pointer.current.x) * (reduceMotion ? 0 : 0.04);
    pointer.current.y +=
      (targetPointer.current.y - pointer.current.y) * (reduceMotion ? 0 : 0.04);

    // Drift from a high "page flat on the desk" view down to a low oblique.
    const drift = reduceMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
    // Portrait screens see a narrower slice, so back the camera off until
    // the whole map fits.
    const aspect = state.size.width / state.size.height;
    const fit = Math.max(1, Math.min(1.9, 1.45 / aspect));
    camera.position.set(
      0.3 + pointer.current.x * 0.45 + drift,
      (5.6 - ease * 2.3 - pointer.current.y * 0.3) * fit,
      (3.4 + ease * 0.5) * fit
    );
    camera.lookAt(target);
  });

  return null;
}

function PinMarker({
  pin,
  onSelect,
}: {
  pin: MapPin;
  onSelect: (pin: MapPin) => void;
}) {
  const { content, t, isJapanese } = useTranslation();
  const [hovered, setHovered] = useState(false);

  const experience = pin.experienceId
    ? content.experiences.find((e) => e.id === pin.experienceId)
    : undefined;
  const label = pin.labelKey
    ? t(pin.labelKey)
    : experience
      ? `${experience.company} ’${experience.date.slice(-2)}`
      : "";

  const position = lonLatToWorld(pin.lon, pin.lat, pin.elevation);
  const color = PIN_COLORS[pin.kind];
  const interactive = pin.kind === "job";

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={5}
        zIndexRange={[20, 0]}
        style={{
          pointerEvents: "none",
          transform: pin.labelOffset
            ? `translate(${pin.labelOffset[0]}px, ${pin.labelOffset[1]}px)`
            : undefined,
        }}
      >
        <button
          type="button"
          onClick={interactive ? () => onSelect(pin) : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={label}
          className="terrain-pin"
          data-kind={pin.kind}
          style={{
            pointerEvents: interactive ? "auto" : "none",
            cursor: interactive ? "pointer" : "default",
            transform: hovered ? "scale(1.08) rotate(-1deg)" : undefined,
            fontFamily: isJapanese
              ? "var(--font-jp-handwritten)"
              : "var(--font-handwritten)",
          }}
        >
          <span className="terrain-pin-dot" style={{ background: color }} />
          <span className="terrain-pin-label">{label}</span>
        </button>
      </Html>
      {/* Hand-drawn map pin: a small cone "tack" planted in the terrain */}
      {pin.kind !== "offmap" && (
        <mesh position={[0, 0.07, 0]}>
          <coneGeometry args={[0.035, 0.14, 6]} />
          <meshBasicMaterial color={pin.kind === "job" ? "#E63946" : "#3B5998"} />
        </mesh>
      )}
    </group>
  );
}

function Pins() {
  const handleSelect = () => {
    document
      .getElementById("timeline")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    </Canvas>
  );
}

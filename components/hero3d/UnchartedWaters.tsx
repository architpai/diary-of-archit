"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { sceneState } from "./sceneState";
import { mulberry32 } from "./prng";
import { useTranslation } from "@/hooks/useTranslation";

const INK = "#2D2D2D";
const SEA_GREEN = "#3E6B5E";

// Every transparent material carries its full ("base") opacity in userData;
// the frame loop traverses the group and fades them all with the section
// weight. No shared mutable lists — lint- and R3F-friendly.
function fadingLineMaterial(color: string, base: number) {
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
  });
  mat.userData.baseOpacity = base;
  return mat;
}

function makeArcLine(
  radiusX: number,
  radiusY: number,
  color: string,
  opacity: number
) {
  const pts = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, Math.PI)
    .getPoints(24)
    .map((p) => new THREE.Vector3(p.x, p.y, 0));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(geo, fadingLineMaterial(color, opacity));
}

function makeCircleLine(radius: number, color: string, opacity: number) {
  const pts = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2)
    .getPoints(48)
    .map((p) => new THREE.Vector3(p.x, p.y, 0));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.LineLoop(geo, fadingLineMaterial(color, opacity));
}

/** The uncharted waters south of the chart: a hand-inked sea serpent, a
 *  compass rose, and scattered wave glyphs on the blank page — the sneak
 *  peek section literally sails off the mapped world. */
export default function UnchartedWaters() {
  const { t, isJapanese } = useTranslation();
  const groupRef = useRef<THREE.Group>(null);
  const serpentRef = useRef<THREE.Group>(null);
  const humpRefs = useRef<(THREE.Mesh | null)[]>([]);
  const captionRef = useRef<HTMLDivElement>(null);

  const { compass, waves } = useMemo(() => {
    // — Compass rose: two rings + 8 spokes, flat on the paper —
    const compass = new THREE.Group();
    compass.add(makeCircleLine(0.42, INK, 0.65));
    compass.add(makeCircleLine(0.5, INK, 0.5));
    const spokePts: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const inner = i % 2 === 0 ? 0.12 : 0.3;
      spokePts.push(
        new THREE.Vector3(Math.cos(a) * inner, Math.sin(a) * inner, 0),
        new THREE.Vector3(Math.cos(a) * 0.66, Math.sin(a) * 0.66, 0)
      );
    }
    const spokeGeo = new THREE.BufferGeometry().setFromPoints(spokePts);
    compass.add(
      new THREE.LineSegments(spokeGeo, fadingLineMaterial(INK, 0.55))
    );
    // Bottom-right patch of open water, clear of the hobby cards that
    // cover the screen centre (and inside the frustum's ground footprint —
    // the closeup camera can't see paper much past z ≈ 5.6).
    compass.position.set(3.3, 0.02, 4.6);
    compass.scale.setScalar(0.85);
    compass.rotation.x = -Math.PI / 2;

    // — Wave glyphs: little seeded ink arcs, the classic "water" mark —
    const rng = mulberry32(777);
    const waves = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const r = 0.09 + rng() * 0.1;
      const arc = makeArcLine(r, r * 0.55, SEA_GREEN, 0.5);
      arc.position.set(-2.8 + rng() * 7.4, 0.015, 2.8 + rng() * 3.1);
      arc.rotation.x = -Math.PI / 2;
      waves.add(arc);
      // Most marks are doubled, like a quick pen flourish.
      if (rng() > 0.35) {
        const arc2 = makeArcLine(r * 0.55, r * 0.3, SEA_GREEN, 0.4);
        arc2.position.set(
          arc.position.x + r * 0.5,
          0.015,
          arc.position.z + 0.05
        );
        arc2.rotation.x = -Math.PI / 2;
        waves.add(arc2);
      }
    }

    return { compass, waves };
  }, []);

  useFrame((state) => {
    const w = sceneState.uncharted;
    const group = groupRef.current;
    if (!group) return;
    group.visible = w > 0.02;
    if (captionRef.current) {
      captionRef.current.style.opacity = String(Math.max(0, w * 1.2 - 0.2));
    }
    if (!group.visible) return;

    // Fade every registered material with the section weight.
    group.traverse((obj) => {
      const mat = (obj as THREE.Mesh).material as THREE.Material | undefined;
      if (mat && mat.userData.baseOpacity !== undefined) {
        mat.opacity = mat.userData.baseOpacity * w;
      }
    });

    // The serpent swims in place: a slow bob plus undulating humps.
    const t = state.clock.elapsedTime;
    if (serpentRef.current) {
      serpentRef.current.position.y = Math.sin(t * 0.7) * 0.035;
    }
    humpRefs.current.forEach((m, i) => {
      if (m) m.scale.y = 1 + Math.sin(t * 1.1 + i * 1.9) * 0.07;
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={compass} />
      <primitive object={waves} />

      {/* — The sea serpent, inked in silhouette — swims in the bottom
          band of open water beneath the hobby cards. Two clear humps and
          a tall neck so the figure reads as a creature, not loose marks. */}
      <group ref={serpentRef} position={[0.0, 0, 5.1]} rotation={[0, -0.18, 0]}>
        {/* Humps: two half-tori sinking as the body trails away */}
        {[
          { x: 0.1, r: 0.38, tube: 0.07 },
          { x: 0.98, r: 0.27, tube: 0.055 },
        ].map((h, i) => (
          <mesh
            key={i}
            position={[h.x, 0, 0]}
            ref={(m) => {
              humpRefs.current[i] = m;
            }}
          >
            <torusGeometry args={[h.r, h.tube, 10, 24, Math.PI]} />
            <meshBasicMaterial
              color={SEA_GREEN}
              transparent
              opacity={0}
              userData={{ baseOpacity: 0.9 }}
            />
          </mesh>
        ))}

        {/* Neck: a taller arc rising well clear of the waterline */}
        <mesh position={[-0.82, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.44, 0.062, 10, 18, Math.PI * 0.62]} />
          <meshBasicMaterial
            color={SEA_GREEN}
            transparent
            opacity={0}
            userData={{ baseOpacity: 0.9 }}
          />
        </mesh>
        {/* Head: a larger cone leaning forward off the top of the neck */}
        <mesh position={[-1.0, 0.58, 0]} rotation={[0, 0, Math.PI * 0.6]}>
          <coneGeometry args={[0.105, 0.4, 10]} />
          <meshBasicMaterial
            color={SEA_GREEN}
            transparent
            opacity={0}
            userData={{ baseOpacity: 0.9 }}
          />
        </mesh>
        {/* Eye: paper-cream dot so the silhouette reads hand-drawn */}
        <mesh position={[-1.03, 0.63, 0.09]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial
            color="#FFF9E5"
            transparent
            opacity={0}
            userData={{ baseOpacity: 1 }}
          />
        </mesh>
        {/* Tail fin flicking up at the back */}
        <mesh position={[1.78, 0.12, 0]} rotation={[0, 0, -Math.PI * 0.3]}>
          <coneGeometry args={[0.075, 0.24, 8]} />
          <meshBasicMaterial
            color={SEA_GREEN}
            transparent
            opacity={0}
            userData={{ baseOpacity: 0.9 }}
          />
        </mesh>
      </group>

      {/* Hand-lettered warning, fading in as you sail south */}
      <group position={[0.65, 0.05, 5.5]}>
        <Html
          center
          distanceFactor={5}
          zIndexRange={[18, 0]}
          style={{ pointerEvents: "none" }}
        >
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
            {t("sneakpeek.uncharted")}
          </div>
        </Html>
      </group>
    </group>
  );
}

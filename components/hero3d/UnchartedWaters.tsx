"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { sceneState } from "./sceneState";
import { mulberry32 } from "./prng";

// Slate-blue, the same water family as the terrain map (was a clashing teal
// #3E6B5E) — one inkwell for every body of water across the diary.
const SEA_GREEN = "#6E8BA8";

// ── The thing below ─────────────────────────────────────────────────────
// Never shown, only implied: a soft analytic-SDF shadow (Inigo Quilez's
// 2D distance-field technique, evaluated per-pixel in one fragment
// shader) that STALKS THE CURSOR. It steers like a real animal — capped
// turn rate, slow approach, and when it reaches you it doesn't stop: it
// circles beneath your pointer until you move again. Wake rings and a
// bubble trail mark its surface line. With no cursor (touch, or an idle
// mouse) it falls back to a slow patrol of the open water.

/** The shadow plane: one quad spanning the water band, oversized so the
 *  tail never crosses a visible edge. */
const SHADOW_PLANE = { cx: 0.4, cz: 4.55, width: 12, depth: 5 };

/** Hunting ground (world coords): the open water south of the hobby
 *  cards. Cursor targets are clamped here, so when you hover the cards
 *  the shadow paces the bank of visible water just beneath them. */
const HUNT = { minX: -3.4, maxX: 4.0, minZ: 4.5, maxZ: 5.4 };

/** Steering: whale-like, never twitchy. The heading is driven through a
 *  smoothed angular velocity (not a hard slew clamp), so every turn
 *  eases in and out instead of pivoting at a constant mechanical rate. */
const TURN_RATE = 0.85; // rad/s ceiling on angular velocity
const TURN_EASE = 2.8; // 1/s — how quickly the turn itself builds/decays
const SPEED_MAX = 0.7; // world units/s
const SPEED_EASE = 2.2; // 1/s — acceleration smoothing
/** Within this range it stops chasing and starts circling you. */
const CIRCLE_DIST = 0.55;
/** Idle fallback patrol (no cursor for a while / touch devices). */
const WANDER_SPEED = 0.11;
const ROUTE = { cx: 0.4, cz: 4.95, rx: 1.9, rz: 0.45 };

/** Wake rings trailing the body. */
const RING_COUNT = 4;
const RING_DUR = 2.8;
/** Bubble trail rising off its head. */
const BUBBLE_COUNT = 10;
const BUBBLE_DUR = 1.4;

function wanderPoint(th: number, out: THREE.Vector3): THREE.Vector3 {
  return out.set(
    ROUTE.cx + Math.sin(th) * ROUTE.rx,
    0,
    ROUTE.cz + Math.sin(th) * Math.cos(th) * ROUTE.rz
  );
}

function wrapAngle(a: number): number {
  return ((((a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
}

const SHADOW_VERTEX = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The plane lies flat via rotation.x = -PI/2, so plane-local (x, y) maps
// to world (x, -z); all CPU-side positions/headings are converted into
// that local frame before being written to the uniforms.
const SHADOW_FRAGMENT = /* glsl */ `
  varying vec2 vPos;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec4 uLurker; // x, y (plane-local), heading, presence 0..1

  vec2 rot(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  }

  // iq: capsule between two points, with a lerped radius
  float sdCapVar(vec2 p, vec2 a, vec2 b, float ra, float rb) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - mix(ra, rb, h);
  }

  // iq: polynomial smooth minimum — organic blends between primitives
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // ── The stalker: an undulating capsule-chain spine, thick at the
  // shoulder, whipping to nothing at the tail. p is creature-local,
  // +x forward. ──
  float lurkerSDF(vec2 p, float t) {
    float d = 1e5;
    vec2 prev = vec2(0.62, 0.0);
    float prevR = 0.17;
    for (int i = 1; i <= 9; i++) {
      float s = float(i) / 9.0;
      float x = 0.62 - s * 2.5;
      // the swim: a travelling wave, pinned at the head, free at the tail
      float sway = 0.30 * sin(6.0 * s - t * 2.2) * (0.15 + 0.85 * s);
      vec2 pt = vec2(x, sway);
      float bulk = 0.75 + 0.5 * exp(-pow((s - 0.22) / 0.25, 2.0));
      float r = 0.30 * (1.0 - 0.78 * s) * bulk;
      d = smin(d, sdCapVar(p, prev, pt, prevR, r), 0.18);
      prevR = r;
      prev = pt;
    }
    // head bulb
    d = smin(d, length(p - vec2(0.62, 0.0)) - 0.17, 0.15);
    return d;
  }

  void main() {
    vec2 p = vPos;

    // Chart scale: keep the creature small against the Japan map behind.
    const float SCALE = 0.45;
    vec2 lp = rot(p - uLurker.xy, -uLurker.z) / SCALE;
    float d = lurkerSDF(lp, uTime) * SCALE;
    float presence = uLurker.w;
    float blur = mix(0.3, 0.12, presence);
    float core = 1.0 - smoothstep(-0.08, blur, d);
    float halo = 1.0 - smoothstep(0.0, blur * 2.4, d);
    float a = (core * 0.62 + halo * 0.38) * (0.56 * presence) * uOpacity;

    // ordered-noise dither so the long soft gradients never band
    a += (hash(gl_FragCoord.xy) - 0.5) * 0.012;
    if (a < 0.003) discard;
    gl_FragColor = vec4(0.1, 0.15, 0.14, a);
  }
`;

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

interface SurfaceMark {
  line: THREE.LineLoop;
  mat: THREE.LineBasicMaterial;
}

interface MarkState {
  x: number;
  z: number;
  prevAge: number;
  spawns: number;
}

/** The uncharted waters south of the chart: scattered wave glyphs and a
 *  shadow that hunts your cursor. No labels — the "HERE BE DRAGONS"
 *  cartouche stamp does the naming; the water itself stays mute. */
export default function UnchartedWaters() {
  const reduceMotion = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const shadowMatRef = useRef<THREE.ShaderMaterial>(null);
  const scratchA = useRef(new THREE.Vector3());
  /** Seconds since the water scrolled into view. */
  const seqT = useRef(0);
  /** Swim-cycle phase — advances faster when it moves faster. */
  const swimPhase = useRef(0);
  /** The stalker, in plane-local coords (y = -world z). `turn` and
   *  `speed` are its smoothed angular/linear velocities. */
  const stalker = useRef({
    x: 0,
    y: 0,
    heading: 0,
    turn: 0,
    speed: 0,
    init: false,
  });
  const wanderTh = useRef(1.6);
  /** Last pointer position (NDC) + when it last moved. */
  const pointer = useRef({ x: 0, y: 0, movedAt: -1e9 });
  const ringStates = useRef<MarkState[]>(
    Array.from({ length: RING_COUNT }, () => ({ x: 0, z: 0, prevAge: 1e9, spawns: 0 }))
  );
  const bubbleStates = useRef<MarkState[]>(
    Array.from({ length: BUBBLE_COUNT }, () => ({ x: 0, z: 0, prevAge: 1e9, spawns: 0 }))
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.movedAt = performance.now();
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const shadowUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uLurker: { value: new THREE.Vector4(0, 0, 0, 0) },
    }),
    []
  );

  const waves = useMemo(() => {
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
    return waves;
  }, []);

  // — Wake rings + bubble rings: a shared squashed-circle geometry, one
  //   manually-managed material each (no baseOpacity — the frame loop
  //   owns their fades entirely). —
  const surface = useMemo(() => {
    const pts = new THREE.EllipseCurve(0, 0, 1, 0.62, 0, Math.PI * 2)
      .getPoints(36)
      .map((p) => new THREE.Vector3(p.x, p.y, 0));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const make = (): SurfaceMark => {
      const mat = new THREE.LineBasicMaterial({
        color: SEA_GREEN,
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.LineLoop(geo, mat);
      line.rotation.x = -Math.PI / 2;
      return { line, mat };
    };
    return {
      rings: Array.from({ length: RING_COUNT }, make),
      bubbles: Array.from({ length: BUBBLE_COUNT }, make),
    };
  }, []);

  useFrame((state, delta) => {
    const w = sceneState.uncharted;
    const group = groupRef.current;
    if (!group) return;
    group.visible = w > 0.02;
    if (!group.visible) {
      // Scrolled away — the hunt restarts from the bank next visit.
      seqT.current = 0;
      stalker.current.init = false;
      return;
    }

    // Fade every registered material with the section weight.
    group.traverse((obj) => {
      const mat = (obj as THREE.Mesh).material as THREE.Material | undefined;
      if (mat && mat.userData.baseOpacity !== undefined) {
        mat.opacity = mat.userData.baseOpacity * w;
      }
    });

    const dt = Math.min(delta, 0.1);
    const sm = shadowMatRef.current;
    const st = stalker.current;

    // Reduced motion: a still shadow resting in the open water, no hunt.
    if (reduceMotion) {
      if (sm) {
        sm.uniforms.uTime.value = 0;
        sm.uniforms.uOpacity.value = w;
        sm.uniforms.uLurker.value.set(1.0, -0.35, 2.7, 1);
      }
      surface.rings.forEach((m) => (m.mat.opacity = 0));
      surface.bubbles.forEach((m) => (m.mat.opacity = 0));
      return;
    }

    if (w > 0.25) seqT.current += dt;
    const seq = seqT.current;
    // Rises out of the deep over the first beats, then breathes slightly.
    const presence =
      THREE.MathUtils.smoothstep(seq, 0.5, 4) *
      (0.88 + 0.12 * Math.sin(seq * 0.3));

    if (!st.init) {
      // Each visit it slips in from the south-west bank (local = world - centre).
      st.x = -1.8 - SHADOW_PLANE.cx;
      st.y = -(5.2 - SHADOW_PLANE.cz);
      st.heading = 0;
      st.turn = 0;
      st.speed = 0;
      st.init = true;
      wanderTh.current = 1.6;
      swimPhase.current = 0;
    }

    // ── Pick the prey: the cursor's landing point on the page, clamped
    // to the visible water; or a slow patrol when there's no cursor. ──
    const V = scratchA.current;
    let targetX = 0;
    let targetY = 0;
    const hasCursor = performance.now() - pointer.current.movedAt < 6000;
    let hit = false;
    if (hasCursor) {
      const cam = state.camera;
      V.set(pointer.current.x, pointer.current.y, 0.5).unproject(cam);
      V.sub(cam.position).normalize();
      if (V.y < -1e-4) {
        const hitT = -cam.position.y / V.y;
        const hx = THREE.MathUtils.clamp(
          cam.position.x + V.x * hitT,
          HUNT.minX,
          HUNT.maxX
        );
        const hz = THREE.MathUtils.clamp(
          cam.position.z + V.z * hitT,
          HUNT.minZ,
          HUNT.maxZ
        );
        targetX = hx - SHADOW_PLANE.cx;
        targetY = -(hz - SHADOW_PLANE.cz);
        hit = true;
      }
    }
    if (!hit) {
      wanderTh.current += dt * WANDER_SPEED;
      wanderPoint(wanderTh.current, V);
      targetX = V.x - SHADOW_PLANE.cx;
      targetY = -(V.z - SHADOW_PLANE.cz);
    }

    // ── Steer like an animal: bounded turn toward the prey; inside
    // CIRCLE_DIST the desired course bends sideways, so instead of
    // parking under the cursor it slowly circles it. ──
    const toX = targetX - st.x;
    const toY = targetY - st.y;
    const dist = Math.hypot(toX, toY);
    let desired = Math.atan2(toY, toX);
    if (dist < CIRCLE_DIST) {
      desired += (1 - dist / CIRCLE_DIST) * 1.35;
    }
    const dh = wrapAngle(desired - st.heading);
    // Proportional steering through eased velocities: small errors get
    // gentle corrections, and even hard turns build and release smoothly.
    const wantTurn = THREE.MathUtils.clamp(dh * 1.6, -TURN_RATE, TURN_RATE);
    st.turn += (wantTurn - st.turn) * (1 - Math.exp(-dt * TURN_EASE));
    st.heading += st.turn * dt;
    const wantSpeed =
      THREE.MathUtils.clamp(dist * 0.4, 0.08, SPEED_MAX) * presence;
    st.speed += (wantSpeed - st.speed) * (1 - Math.exp(-dt * SPEED_EASE));
    st.x += Math.cos(st.heading) * st.speed * dt;
    st.y += Math.sin(st.heading) * st.speed * dt;
    // Keep the body inside the hunting ground.
    st.x = THREE.MathUtils.clamp(
      st.x,
      HUNT.minX - SHADOW_PLANE.cx,
      HUNT.maxX - SHADOW_PLANE.cx
    );
    st.y = THREE.MathUtils.clamp(
      st.y,
      -(HUNT.maxZ - SHADOW_PLANE.cz),
      -(HUNT.minZ - SHADOW_PLANE.cz)
    );
    // The tail beats harder when it travels faster.
    swimPhase.current += dt * (1.0 + st.speed * 2.8);

    // Looms a little darker the closer it gets to you.
    const loom = presence * (0.8 + 0.2 * (1 - Math.min(dist / 3, 1)));

    if (sm) {
      sm.uniforms.uTime.value = swimPhase.current;
      sm.uniforms.uOpacity.value = w;
      sm.uniforms.uLurker.value.set(
        st.x,
        st.y,
        st.heading + 0.05 * Math.sin(seq * 0.7),
        loom
      );
    }

    // ── Surface marks: each ring/bubble respawns at the body's current
    // position when its cycle wraps, then stays put while it expands. ──
    const worldX = st.x + SHADOW_PLANE.cx;
    const worldZ = SHADOW_PLANE.cz - st.y;
    const headX = worldX + Math.cos(st.heading) * 0.33;
    const headZ = worldZ - Math.sin(st.heading) * 0.33;

    surface.rings.forEach((ring, j) => {
      const rs = ringStates.current[j];
      const age = (seq + (j * RING_DUR) / RING_COUNT) % RING_DUR;
      if (age < rs.prevAge) {
        rs.x = worldX;
        rs.z = worldZ;
      }
      rs.prevAge = age;
      const ageN = age / RING_DUR;
      ring.line.position.set(rs.x, 0.02, rs.z);
      ring.line.scale.setScalar(0.04 + ageN * 0.24);
      ring.mat.opacity = w * presence * (1 - ageN) * 0.4;
    });

    surface.bubbles.forEach((bubble, i) => {
      const bs = bubbleStates.current[i];
      const age = (seq + (i * BUBBLE_DUR) / BUBBLE_COUNT) % BUBBLE_DUR;
      if (age < bs.prevAge) {
        bs.spawns++;
        const rng = mulberry32(bs.spawns * 977 + i * 131);
        const jr = 0.04 + rng() * 0.17;
        const ja = rng() * Math.PI * 2;
        bs.x = headX + Math.cos(ja) * jr;
        bs.z = headZ + Math.sin(ja) * jr * 0.6;
      }
      bs.prevAge = age;
      const ageN = age / BUBBLE_DUR;
      bubble.line.position.set(bs.x, 0.02, bs.z);
      bubble.line.scale.setScalar(0.014 + ageN * 0.038);
      bubble.mat.opacity = w * presence * (1 - ageN) * 0.5;
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={waves} />

      {/* The shadow, evaluated analytically on one oversized quad */}
      <mesh
        position={[SHADOW_PLANE.cx, 0.005, SHADOW_PLANE.cz]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[SHADOW_PLANE.width, SHADOW_PLANE.depth]} />
        <shaderMaterial
          ref={shadowMatRef}
          transparent
          depthWrite={false}
          uniforms={shadowUniforms}
          vertexShader={SHADOW_VERTEX}
          fragmentShader={SHADOW_FRAGMENT}
        />
      </mesh>

      {/* Wake + bubbles breaking the surface */}
      {surface.rings.map((r, i) => (
        <primitive key={`ring-${i}`} object={r.line} />
      ))}
      {surface.bubbles.map((b, i) => (
        <primitive key={`bubble-${i}`} object={b.line} />
      ))}
    </group>
  );
}

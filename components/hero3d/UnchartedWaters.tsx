"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { sceneState } from "./sceneState";

// ── Off the chart: open water ───────────────────────────────────────────
// South of the terrain plane the map runs out, so this is where the page
// becomes sea. One big surface quad carries everything in a single fragment
// shader, all evaluated in WORLD space so it reads as one continuous body of
// water with the terrain's own ocean:
//   • the slate-blue sea wash (the exact #FFF9E5↔#a8c5e2 mix the terrain uses),
//   • slow hand-drawn ambient ripples,
//   • a leviathan that STALKS THE CURSOR — an undulating analytic-SDF shadow
//     (Inigo Quilez's 2D distance fields) steering like a real animal,
//   • the wake it leaves: continuous radiating ripples + a V behind the head,
//     folded straight into the surface (no popping ring sprites).
// With no cursor (touch / idle mouse) the creature falls back to a slow patrol.

// The water surface: a generous quad, centred on the open water and oversized
// so its edges sit well off-screen through the whole scroll transition. It
// underlaps the terrain to the north (the opaque land hides it there) so the
// only visible seam is the coastline, where the wash colour matches exactly.
const WATER = { cx: 0.4, cz: 4.0, width: 44, depth: 22, y: -0.02 };

// The creature's working frame (world − centre, with z flipped) — kept
// identical on the CPU and in the shader so the SDF maths needs no re-der.
const FRAME = { cx: 0.4, cz: 4.55 };

/** Hunting ground (world coords): the open water just south of the chart,
 *  now the whole visible band rather than a thin strip — room to roam reads
 *  as more alive. Cursor targets are clamped here. */
const HUNT = { minX: -3.6, maxX: 4.2, minZ: 3.9, maxZ: 6.6 };

/** Steering: whale-like, never twitchy. Heading runs through a smoothed
 *  angular velocity (not a hard slew clamp) so every turn eases in and out. */
const TURN_RATE = 0.85; // rad/s ceiling on angular velocity
const TURN_EASE = 2.8; // 1/s — how quickly the turn builds/decays
const SPEED_MAX = 0.72; // world units/s
const SPEED_EASE = 2.2; // 1/s — acceleration smoothing
/** Within this range it stops chasing and starts circling you. */
const CIRCLE_DIST = 0.7;
/** Idle patrol (no cursor / touch): a wandering loop, de-regularised by noise
 *  so it never traces the same figure-8 twice. */
const WANDER_SPEED = 0.12;
const ROUTE = { cx: 0.4, cz: 4.95, rx: 2.5, rz: 0.7 };

function wanderPoint(th: number, out: THREE.Vector3): THREE.Vector3 {
  // A loose loop plus two incommensurate wobbles, so the patrol drifts and
  // never repeats exactly — a real animal mooching about, not a clockwork orbit.
  return out.set(
    ROUTE.cx + Math.sin(th) * ROUTE.rx + Math.sin(th * 0.37 + 1.3) * 0.6,
    0,
    ROUTE.cz + Math.sin(th) * Math.cos(th) * ROUTE.rz + Math.sin(th * 0.91 + 0.4) * 0.35
  );
}

function wrapAngle(a: number): number {
  return ((((a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
}

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

// All effects live in WORLD space (vWorld = world x,z). The creature is drawn
// in the same (world − centre, z-flipped) frame the CPU steers it in, so the
// proven SDF code is reused verbatim.
const WATER_FRAGMENT = /* glsl */ `
  varying vec2 vWorld;
  varying vec2 vUv;
  uniform float uOpacity;
  uniform vec3  uPaper;
  uniform vec3  uPaperLine;
  uniform vec3  uInk;
  uniform vec4  uLurker;   // local x, local y, local heading, presence 0..1
  uniform float uSwim;     // tail-beat phase
  uniform float uWaterTime;// ambient + wake clock
  uniform float uSpeed;    // creature speed → wake intensity

  const float FCX = ${FRAME.cx.toFixed(3)};
  const float FCZ = ${FRAME.cz.toFixed(3)};
  const float SCALE = 0.5; // a shadow under the surface, not a billboard

  vec2 rot(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  }
  // iq: capsule between two points, lerped radius
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
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  // The stalker: an undulating capsule-chain spine, thick at the shoulder,
  // whipping to nothing at the tail. p is creature-local, +x forward.
  float lurkerSDF(vec2 p, float t) {
    float d = 1e5;
    vec2 prev = vec2(0.62, 0.0);
    float prevR = 0.17;
    for (int i = 1; i <= 9; i++) {
      float s = float(i) / 9.0;
      float x = 0.62 - s * 2.5;
      float sway = 0.30 * sin(6.0 * s - t * 2.2) * (0.15 + 0.85 * s);
      vec2 pt = vec2(x, sway);
      float bulk = 0.75 + 0.5 * exp(-pow((s - 0.22) / 0.25, 2.0));
      float r = 0.30 * (1.0 - 0.78 * s) * bulk;
      d = smin(d, sdCapVar(p, prev, pt, prevR, r), 0.18);
      prevR = r;
      prev = pt;
    }
    d = smin(d, length(p - vec2(0.62, 0.0)) - 0.17, 0.15);
    return d;
  }

  void main() {
    vec2 W = vWorld;       // (worldX, worldZ)
    float Wx = W.x, Wz = W.y;

    // — base sea wash + ambient ripples: the terrain's ocean recipe ported
    //   VERBATIM, evaluated in the terrain's own UV basis (tokaido footprint:
    //   x∈[-5,5], z∈[±WORLD_DEPTH/2]). So the open water is literally the same
    //   water as the sea beside the map — calm, pale, and static (no drift). —
    vec2 suv = vec2((Wx + 5.0) / 10.0, (3.46154 - Wz) / 6.92308);
    float grain = vnoise(suv * 700.0);
    vec3 paper = uPaper * (0.972 + 0.028 * grain);
    vec3 water = mix(paper, uPaperLine, 0.42);
    float meander = vnoise(suv * vec2(2.0, 6.0)) * 2.4;
    float wavePhase = suv.y * 58.0 + vnoise(suv * vec2(4.0, 22.0)) * 13.0 + meander;
    float ripple = smoothstep(0.5, 0.9, sin(wavePhase) * 0.5 + 0.5);
    vec3 col = mix(water, uPaperLine, ripple * 0.36);

    // — the creature's working frame —
    vec2 vp = vec2(Wx - FCX, FCZ - Wz);
    vec2 toC = vp - uLurker.xy;
    float dC = length(toC);
    float pres = uLurker.w;
    vec2 fwd = vec2(cos(uLurker.z), sin(uLurker.z));
    vec2 sideV = vec2(-fwd.y, fwd.x);
    float along = dot(toC, -fwd);   // distance behind the body
    float crossv = dot(toC, sideV); // signed offset across the wake

    // — the wake it leaves: a SOFT, noise-broken disturbance kept in key with
    //   the pale wash. Disturbed/aerated water reads slightly LIGHTER (foam),
    //   not as bright blue lines — the old crisp V + perfect rings looked
    //   synthetic. A turbulent trail widening behind, plus warped bow ripples. —
    float wedge = exp(-(crossv * crossv) / (0.12 + along * 0.18));
    float trailMask = wedge * smoothstep(0.0, 0.35, along) * smoothstep(5.5, 0.0, along) * pres;
    float trailTex = vnoise(vec2(along * 2.6 - uWaterTime * 1.5, crossv * 5.0 + uWaterTime * 0.6));
    float trail = trailMask * (0.35 + 0.65 * trailTex) * (0.55 + 0.9 * uSpeed);

    float warp = (vnoise(vp * 3.0 + uWaterTime * 0.25) - 0.5) * 0.5;
    float bow = sin((dC + warp) * 6.0 - uWaterTime * 1.8) * 0.5 + 0.5;
    float bowAmt = smoothstep(0.6, 1.0, bow) * smoothstep(1.5, 0.12, dC) * pres;

    float foam = clamp(trail * 0.55 + bowAmt * 0.3, 0.0, 1.0);
    col = mix(col, mix(uPaper, uPaperLine, 0.22), foam * 0.4);

    // — the leviathan shadow, drawn into the same surface —
    vec2 lp = rot(toC, -uLurker.z) / SCALE;
    float d = lurkerSDF(lp, uSwim) * SCALE;
    float blur = mix(0.32, 0.12, pres);
    float core = 1.0 - smoothstep(-0.08, blur, d);
    float halo = 1.0 - smoothstep(0.0, blur * 2.4, d);
    float shadow = (core * 0.64 + halo * 0.36) * (0.52 * pres);
    col = mix(col, vec3(0.10, 0.15, 0.16), shadow);

    // — dissolve the plane's own edges into paper (kept off-screen normally,
    //   but graceful if a corner ever peeks during a transition) —
    float edge = smoothstep(0.0, 0.10, vUv.x) * smoothstep(1.0, 0.90, vUv.x)
               * smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);

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
  const reduceMotion = useReducedMotion();
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const scratchA = useRef(new THREE.Vector3());
  /** Seconds since the water scrolled into view. */
  const seqT = useRef(0);
  /** Ambient + wake clock — advances whenever the water is on screen. */
  const waterT = useRef(0);
  /** Tail-beat phase — advances faster when the creature moves faster. */
  const swimPhase = useRef(0);
  /** The stalker, in the working frame. `turn`/`speed` are smoothed velocities. */
  const stalker = useRef({ x: 0, y: 0, heading: 0, turn: 0, speed: 0, init: false });
  const wanderTh = useRef(1.6);
  /** Last pointer position (NDC) + when it last moved. */
  const pointer = useRef({ x: 0, y: 0, movedAt: -1e9 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.movedAt = performance.now();
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uPaper: { value: new THREE.Color("#FFF9E5") },
      uPaperLine: { value: new THREE.Color("#a8c5e2") },
      uInk: { value: new THREE.Color("#2D2D2D") },
      uLurker: { value: new THREE.Vector4(0, 0, 0, 0) },
      uSwim: { value: 0 },
      uWaterTime: { value: 0 },
      uSpeed: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    const w = sceneState.uncharted;
    const mat = matRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;
    const visible = w > 0.02;
    mesh.visible = visible;
    if (!visible) {
      // Scrolled away — the hunt restarts from the bank next visit.
      seqT.current = 0;
      stalker.current.init = false;
      return;
    }

    const dt = Math.min(delta, 0.1);
    const st = stalker.current;

    // Reduced motion: a still shadow resting in the open water, no hunt.
    // (In practice the camera never flies here under reduced motion, so w≈0
    // and this branch rarely shows — but keep it cheap and static.)
    if (reduceMotion) {
      mat.uniforms.uOpacity.value = w;
      mat.uniforms.uWaterTime.value = 0;
      mat.uniforms.uSwim.value = 0;
      mat.uniforms.uSpeed.value = 0;
      mat.uniforms.uLurker.value.set(1.0, -0.35, 2.7, 1);
      return;
    }

    waterT.current += dt;
    if (w > 0.25) seqT.current += dt;
    const seq = seqT.current;
    // Rises out of the deep over the first beats, then breathes slightly.
    const presence =
      THREE.MathUtils.smoothstep(seq, 0.5, 4) * (0.88 + 0.12 * Math.sin(seq * 0.3));

    if (!st.init) {
      // Each visit it slips in from the south-west bank (local = world − centre).
      st.x = -1.8 - FRAME.cx;
      st.y = -(5.2 - FRAME.cz);
      st.heading = 0;
      st.turn = 0;
      st.speed = 0;
      st.init = true;
      wanderTh.current = 1.6;
      swimPhase.current = 0;
    }

    // ── Pick the prey: the cursor's landing point on the page, clamped to the
    // visible water; or a slow patrol when there's no cursor. ──
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
        const hx = THREE.MathUtils.clamp(cam.position.x + V.x * hitT, HUNT.minX, HUNT.maxX);
        const hz = THREE.MathUtils.clamp(cam.position.z + V.z * hitT, HUNT.minZ, HUNT.maxZ);
        targetX = hx - FRAME.cx;
        targetY = -(hz - FRAME.cz);
        hit = true;
      }
    }
    if (!hit) {
      wanderTh.current += dt * WANDER_SPEED;
      wanderPoint(wanderTh.current, V);
      targetX = V.x - FRAME.cx;
      targetY = -(V.z - FRAME.cz);
    }

    // ── Steer like an animal: bounded turn toward the prey; inside CIRCLE_DIST
    // the desired course bends sideways so it circles instead of parking. ──
    const toX = targetX - st.x;
    const toY = targetY - st.y;
    const dist = Math.hypot(toX, toY);
    let desired = Math.atan2(toY, toX);
    if (dist < CIRCLE_DIST) {
      desired += (1 - dist / CIRCLE_DIST) * 1.35;
    }

    // Soft turn-away from the edges of the hunting ground: instead of sliding
    // along an invisible wall (a hard positional clamp), it banks back toward
    // open water as it nears a boundary — far more lifelike.
    const lbx0 = HUNT.minX - FRAME.cx;
    const lbx1 = HUNT.maxX - FRAME.cx;
    const lby0 = FRAME.cz - HUNT.maxZ;
    const lby1 = FRAME.cz - HUNT.minZ;
    const margin = 0.7;
    const avoidX =
      Math.max(0, lbx0 + margin - st.x) - Math.max(0, st.x - (lbx1 - margin));
    const avoidY =
      Math.max(0, lby0 + margin - st.y) - Math.max(0, st.y - (lby1 - margin));
    if (avoidX !== 0 || avoidY !== 0) {
      const avoidAng = Math.atan2(avoidY, avoidX);
      const strength = Math.min(1, Math.hypot(avoidX, avoidY) / margin);
      desired += wrapAngle(avoidAng - desired) * strength * 0.85;
    }

    const dh = wrapAngle(desired - st.heading);
    // Proportional steering through eased velocities: small errors get gentle
    // corrections, and even hard turns build and release smoothly.
    const wantTurn = THREE.MathUtils.clamp(dh * 1.6, -TURN_RATE, TURN_RATE);
    st.turn += (wantTurn - st.turn) * (1 - Math.exp(-dt * TURN_EASE));
    st.heading += st.turn * dt;
    const wantSpeed = THREE.MathUtils.clamp(dist * 0.4, 0.08, SPEED_MAX) * presence;
    st.speed += (wantSpeed - st.speed) * (1 - Math.exp(-dt * SPEED_EASE));
    st.x += Math.cos(st.heading) * st.speed * dt;
    st.y += Math.sin(st.heading) * st.speed * dt;
    // Final safety net well outside the soft-turn margin, so it can never
    // wander out of frame even if the steering is overwhelmed.
    st.x = THREE.MathUtils.clamp(st.x, lbx0 - 0.4, lbx1 + 0.4);
    st.y = THREE.MathUtils.clamp(st.y, lby0 - 0.4, lby1 + 0.4);
    // The tail beats harder when it travels faster.
    swimPhase.current += dt * (1.0 + st.speed * 2.8);

    mat.uniforms.uOpacity.value = w;
    mat.uniforms.uWaterTime.value = waterT.current;
    mat.uniforms.uSwim.value = swimPhase.current;
    mat.uniforms.uSpeed.value = st.speed;
    mat.uniforms.uLurker.value.set(
      st.x,
      st.y,
      st.heading + 0.05 * Math.sin(seq * 0.7),
      presence
    );
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

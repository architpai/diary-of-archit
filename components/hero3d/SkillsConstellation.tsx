"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { CATEGORY_COLORS } from "./mapData";
import { sceneState } from "./sceneState";
import { mulberry32 } from "./prng";
import { glyphFor, neighborsOf, TIER_SIZE } from "./skillGraph";
import { useTranslation } from "@/hooks/useTranslation";

interface Skill {
  id?: string;
  name: string;
  level: number;
  category: string;
  tier?: string;
}

/** Sprite world scale for a daily-driver star. */
const BASE_SCALE = 0.4;
/** Orbit ring radius per relationship strength (3 = inseparable = closest). */
const ORBIT_RADII: Record<number, number> = { 3: 0.55, 2: 0.84, 1: 1.12 };
/** Orbit ellipse squash (y) and depth wobble (z) — a tilted orrery plane. */
const ORBIT_SQUASH = 0.45;
const ORBIT_DEPTH = 0.24;

const UNCHARTED_COLOR = "#3E6B5E";

interface SkyStar {
  id: string;
  name: string;
  category: string;
  color: string;
  home: THREE.Vector3;
  cur: THREE.Vector3;
  size: number;
  /** Per-star stagger (0..1) for the pop-in when night falls */
  stagger: number;
  twPhase: number;
}

interface NeighborSlot {
  id: string;
  strength: number;
  slot: number;
  ringCount: number;
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = (v: number) => Math.round(v + (255 - v) * amount);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

function tint(hex: string, lift: number, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = (v: number) => Math.round(v + (255 - v) * lift);
  return `rgba(${f(r)},${f(g)},${f(b)},${alpha})`;
}

/** Hand-drawn star glyph rendered to a canvas texture (cached per category). */
function makeGlyphTexture(category: string, color: string): THREE.Texture {
  const size = 160;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const spec = glyphFor(category);
  const rng = mulberry32(
    Array.from(category).reduce((a, c) => a + c.charCodeAt(0), 7)
  );
  const c = size / 2;
  const s = size * 0.3;
  const jit = () => (rng() - 0.5) * 3;
  const px = (v: number) => c + v * s + jit();
  const py = (v: number) => c + v * s + jit();

  // a soft coloured aura filling the sprite quad — each star glows like a
  // lantern against the night wash instead of floating as a bare line
  const glow = ctx.createRadialGradient(c, c, size * 0.02, c, c, size * 0.5);
  glow.addColorStop(0, tint(color, 0.8, 0.5));
  glow.addColorStop(0.28, tint(color, 0.55, 0.2));
  glow.addColorStop(0.65, tint(color, 0.45, 0.06));
  glow.addColorStop(1, tint(color, 0.4, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // two passes: soft halo, then bright core — must punch through the
  // night-wash multiply layer, so the core is near-white starlight
  const passes = [
    { width: 13, color: lighten(color, 0.35), alpha: 0.55, blur: 18 },
    { width: 5, color: lighten(color, 0.82), alpha: 1, blur: 0 },
  ];
  for (const pass of passes) {
    ctx.save();
    ctx.strokeStyle = pass.color;
    ctx.fillStyle = pass.color;
    ctx.globalAlpha = pass.alpha;
    ctx.lineWidth = pass.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (pass.blur) {
      ctx.shadowColor = pass.color;
      ctx.shadowBlur = pass.blur;
    }
    for (const circle of spec.circles ?? []) {
      ctx.beginPath();
      if (circle.dashed) ctx.setLineDash([8, 7]);
      ctx.arc(c + circle.x * s, c + circle.y * s, circle.r * s, 0, Math.PI * 2);
      if (circle.filled) ctx.fill();
      else ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const line of spec.strokes) {
      ctx.beginPath();
      line.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(px(x), py(y));
        else ctx.lineTo(px(x), py(y));
      });
      ctx.stroke();
    }
    ctx.restore();
  }
  // tiny bright heart so even spoke glyphs have a core
  ctx.fillStyle = "rgba(255,252,240,0.95)";
  ctx.beginPath();
  ctx.arc(c, c, 4.2, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const STARFIELD_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uPx;
  varying float vPhase;
  void main() {
    vPhase = aPhase;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPx * (18.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const STARFIELD_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying float vPhase;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d) * 2.0;
    if (r > 1.0) discard;
    float core = smoothstep(1.0, 0.15, r);
    float tw = 0.55 + 0.45 * sin(uTime * 1.3 + vPhase);
    gl_FragColor = vec4(1.0, 0.96, 0.85, core * tw * uOpacity);
  }
`;

/** Shooting-star cadence: one streak every PERIOD s, lasting DUR s. */
const METEOR_PERIOD = 8.5;
const METEOR_DUR = 1.0;

/**
 * The night sky of skills. Every star IS a skill: glyph + colour = category,
 * size = how often it's reached for. Hovering (or tapping) a star pulls its
 * companions — the tools genuinely used alongside it — into orbit around
 * it on dashed orrery rings; everything else dims. Mouse out and the sky
 * springs back into its constellations.
 */
export default function SkillsConstellation() {
  const { content, t, isJapanese } = useTranslation();
  const reduceMotion = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const starGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const starMats = useRef<(THREE.SpriteMaterial | null)[]>([]);
  const starScale = useRef<number[]>([]);
  const starAlpha = useRef<number[]>([]);
  const tipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRefs = useRef<(THREE.Line | null)[]>([]);
  const ringAlpha = useRef<number[]>([0, 0, 0]);
  const lineAlpha = useRef<Record<string, number>>({});
  const starfieldRef = useRef<THREE.Points | null>(null);
  const meteorRef = useRef<THREE.Mesh | null>(null);
  // Seconds since night fell — drives the pop-in / draw-on choreography so
  // the constellations visibly FORM each time you arrive at the sky.
  const revealT = useRef(0);

  // ── Build the sky: stars, clusters, chain lines ──────────────────────
  const { stars, starIndex, clusters, neighborMap } = useMemo(() => {
    const skills = content.skills as Skill[];
    const rng = mulberry32(4242);

    const all: { id: string; name: string; category: string; tier: string }[] =
      skills.map((s, i) => ({
        id: s.id ?? `s${i}`,
        name: s.name,
        category: s.category,
        tier: s.tier ?? "shipped",
      }));
    // The uncharted stars — hobbies surveyed in the sneak-peek waters
    all.push(
      { id: "llm", name: t("skills.chart_1"), category: "uncharted", tier: "charting" },
      { id: "agents", name: t("skills.chart_2"), category: "uncharted", tier: "charting" }
    );

    const byCategory = new Map<string, typeof all>();
    for (const s of all) {
      if (!byCategory.has(s.category)) byCategory.set(s.category, []);
      byCategory.get(s.category)!.push(s);
    }

    const cats = Array.from(byCategory.keys());
    const stars: SkyStar[] = [];
    const clusters: {
      category: string;
      color: string;
      center: THREE.Vector3;
      lineObj: THREE.LineSegments | null;
      lineMat: THREE.LineDashedMaterial | null;
      lineLen: number;
      reveal: { value: number };
    }[] = [];

    cats.forEach((category, i) => {
      const isUncharted = category === "uncharted";
      const color = isUncharted
        ? UNCHARTED_COLOR
        : CATEGORY_COLORS[category] ?? "#64513B";

      // Clusters sweep across the open sky in two loose arcs; the
      // uncharted pair hangs toward the southern waters — high enough to
      // clear the legend panel docked at the bottom of the viewport.
      let center: THREE.Vector3;
      if (isUncharted) {
        center = new THREE.Vector3(2.8, 2.1, 0.3);
      } else {
        const n = cats.filter((c) => c !== "uncharted").length;
        const fx = n === 1 ? 0.5 : i / (n - 1);
        center = new THREE.Vector3(
          -3.0 + fx * 6.0 + (rng() - 0.5) * 0.5,
          (i % 2 === 0 ? 3.35 : 2.25) + (rng() - 0.5) * 0.35,
          -0.9 + rng() * 1.1
        );
      }

      const catStars = byCategory.get(category)!;
      const placed: SkyStar[] = catStars.map((skill, j) => {
        const n = catStars.length;
        const a = (j / Math.max(1, n)) * Math.PI * 2 + rng() * 0.9;
        const r = n === 1 ? 0 : 0.34 + rng() * 0.22;
        const home = new THREE.Vector3(
          center.x + Math.cos(a) * r,
          center.y + (rng() - 0.5) * 0.38,
          center.z + Math.sin(a) * r * 0.5
        );
        return {
          id: skill.id,
          name: skill.name,
          category,
          color,
          home,
          cur: home.clone(),
          size: BASE_SCALE * (TIER_SIZE[skill.tier] ?? 0.6),
          stagger: rng(),
          twPhase: rng() * Math.PI * 2,
        };
      });
      stars.push(...placed);

      // Constellation figure: chain the category's stars in angle order.
      let lineObj: THREE.LineSegments | null = null;
      let lineMat: THREE.LineDashedMaterial | null = null;
      let lineLen = 0;
      const reveal = { value: 0 };
      if (placed.length >= 2) {
        const ordered = [...placed].sort(
          (a, b) =>
            Math.atan2(a.home.z - center.z, a.home.x - center.x) -
            Math.atan2(b.home.z - center.z, b.home.x - center.x)
        );
        const pts: THREE.Vector3[] = [];
        for (let k = 0; k < ordered.length - 1; k++) {
          pts.push(ordered[k].home, ordered[k + 1].home);
          lineLen += ordered[k].home.distanceTo(ordered[k + 1].home);
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        lineMat = new THREE.LineDashedMaterial({
          color: lighten(color, 0.3),
          dashSize: 0.05,
          gapSize: 0.04,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
        });
        // Draw-on reveal: discard fragments past uRevealDist along the
        // chain's cumulative line distance, so each figure inks itself in
        // stroke order as the night settles.
        lineMat.onBeforeCompile = (shader) => {
          shader.uniforms.uRevealDist = reveal;
          shader.fragmentShader = shader.fragmentShader
            .replace(
              "varying float vLineDistance;",
              "varying float vLineDistance;\nuniform float uRevealDist;"
            )
            .replace(
              "if ( mod( vLineDistance, totalSize ) > dashSize ) {",
              "if ( vLineDistance > uRevealDist ) discard;\n\tif ( mod( vLineDistance, totalSize ) > dashSize ) {"
            );
        };
        lineObj = new THREE.LineSegments(geo, lineMat);
        lineObj.computeLineDistances();
        lineObj.renderOrder = 2; // above the night veil
      }
      clusters.push({ category, color, center, lineObj, lineMat, lineLen, reveal });
    });

    const starIndex = new Map(stars.map((s, i) => [s.id, i]));

    // Pre-slot every star's orbit assignments: per hovered id, its
    // neighbours grouped by ring with evenly spread phase slots.
    const neighborMap: Record<string, NeighborSlot[]> = {};
    for (const s of stars) {
      const nbs = neighborsOf(s.id).filter((n) => starIndex.has(n.id));
      const byRing = new Map<number, number>();
      const slots: NeighborSlot[] = nbs.map((n) => {
        const slot = byRing.get(n.strength) ?? 0;
        byRing.set(n.strength, slot + 1);
        return { id: n.id, strength: n.strength, slot, ringCount: 0 };
      });
      for (const slot of slots) slot.ringCount = byRing.get(slot.strength)!;
      neighborMap[s.id] = slots;
    }

    return { stars, starIndex, clusters, neighborMap };
  }, [content.skills, t]);

  // ── Canvas glyph textures, one per category ──────────────────────────
  const textures = useMemo(() => {
    if (typeof document === "undefined") return new Map<string, THREE.Texture>();
    const map = new Map<string, THREE.Texture>();
    for (const c of clusters) {
      map.set(c.category, makeGlyphTexture(c.category, c.color));
    }
    return map;
  }, [clusters]);
  useEffect(() => {
    return () => {
      textures.forEach((t) => t.dispose());
    };
  }, [textures]);

  // ── Deep-sky backdrop: hundreds of faint twinkling background stars ──
  const starfield = useMemo(() => {
    const rng = mulberry32(20251231);
    const count = 380;
    const pos = new Float32Array(count * 3);
    const aSize = new Float32Array(count);
    const aPhase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -9 + rng() * 18;
      // Denser toward the zenith, thinning at the horizon
      pos[i * 3 + 1] = 0.2 + Math.pow(rng(), 0.7) * 5.6;
      pos[i * 3 + 2] = -4.4 + rng() * 3.6;
      aSize[i] = 1 + rng() * rng() * 2.8;
      aPhase[i] = rng() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(aPhase, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uPx: { value: 1 },
      },
      vertexShader: STARFIELD_VERTEX,
      fragmentShader: STARFIELD_FRAGMENT,
    });
    const points = new THREE.Points(geo, mat);
    points.renderOrder = 2;
    points.frustumCulled = false;
    // Lives for the page's lifetime (like the orrery rings) — no dispose.
    return points;
  }, []);

  // ── A lone shooting star every few seconds ───────────────────────────
  const meteor = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 16;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0, "rgba(255,250,230,0)");
    grad.addColorStop(0.75, "rgba(255,250,230,0.55)");
    grad.addColorStop(1, "rgba(255,253,244,1)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255,250,230,0.9)";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(4, 8);
    ctx.lineTo(122, 8);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.2), mat);
    mesh.renderOrder = 2;
    mesh.visible = false;
    return mesh;
  }, []);

  // ── Orrery rings (one per strength), repositioned at the hovered star ─
  const rings = useMemo(() => {
    return [3, 2, 1].map((strength) => {
      const r = ORBIT_RADII[strength];
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            Math.sin(a) * r * ORBIT_SQUASH,
            Math.sin(a) * ORBIT_DEPTH
          )
        );
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineDashedMaterial({
        color: "#C9BC9C",
        dashSize: 0.06,
        gapSize: 0.05,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
      });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      line.renderOrder = 2; // above the night veil
      return { strength, line, mat };
    });
  }, []);

  // ── Per-frame choreography ───────────────────────────────────────────
  const scratch = useRef(new THREE.Vector3());
  const scratchTipA = useRef(new THREE.Vector3());
  const scratchTipB = useRef(new THREE.Vector3());
  useFrame((state, delta) => {
    const w = sceneState.network;
    const group = groupRef.current;
    if (!group) return;
    group.visible = w > 0.02;
    if (!group.visible) {
      revealT.current = 0;
      if (sceneState.skyHover) sceneState.skyHover = null;
      tipRefs.current.forEach((el) => el && (el.style.opacity = "0"));
      labelRefs.current.forEach((el) => el && (el.style.opacity = "0"));
      return;
    }

    const dt = Math.min(delta, 0.1);
    const tNow = state.clock.elapsedTime;
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 4.5);
    const hov = sceneState.skyHover;
    const hovIdx = hov != null ? starIndex.get(hov) : undefined;
    const hovStar = hovIdx != null ? stars[hovIdx] : undefined;
    const hovSlots = hov && neighborMap[hov] ? neighborMap[hov] : null;
    const hovCat = sceneState.hoverCategory;
    const usedRings = new Set<number>();
    if (hovSlots) for (const s of hovSlots) usedRings.add(s.strength);

    // Night-fall clock: starts once the sky carries real weight, resets
    // when you scroll away, so the forming moment replays on each visit.
    if (w > 0.3) revealT.current = Math.min(revealT.current + dt, 30);
    const rT = reduceMotion ? 99 : revealT.current;

    group.position.y = reduceMotion ? 0 : Math.sin(tNow * 0.4) * 0.05;

    // Background sky: twinkle + fade with the section weight.
    const sf = starfieldRef.current;
    if (sf) {
      const sfMat = sf.material as THREE.ShaderMaterial;
      sfMat.uniforms.uTime.value = reduceMotion ? 0 : tNow;
      sfMat.uniforms.uOpacity.value =
        w * THREE.MathUtils.clamp(rT * 1.4, 0, 1);
      sfMat.uniforms.uPx.value = state.gl.getPixelRatio();
    }

    // Shooting star on a fixed cadence while the sky is up.
    const met = meteorRef.current;
    if (met) {
      const metMat = met.material as THREE.MeshBasicMaterial;
      const cyc = Math.floor(tNow / METEOR_PERIOD);
      const pt = tNow - cyc * METEOR_PERIOD;
      const flying = !reduceMotion && w > 0.35 && pt < METEOR_DUR && rT > 2;
      met.visible = flying;
      if (flying) {
        const mrng = mulberry32(cyc * 7919 + 31);
        const p = pt / METEOR_DUR;
        const x0 = -4.5 + mrng() * 8;
        const y0 = 4.2 + mrng() * 1.2;
        const ang = -0.35 - mrng() * 0.35;
        const dist = 3.2;
        met.position.set(
          x0 + Math.cos(ang) * p * dist,
          y0 + Math.sin(ang) * p * dist,
          -2.6
        );
        met.rotation.z = ang;
        metMat.opacity = Math.sin(p * Math.PI) * 0.85 * w;
      } else {
        metMat.opacity = 0;
      }
    }

    stars.forEach((star, i) => {
      const holder = starGroupRefs.current[i];
      const mat = starMats.current[i];
      if (!holder || !mat) return;

      // Where does this star want to be?
      let targetAlpha = 0.95;
      let targetScale = 1;
      let isOrbiting = false;
      const target = scratch.current.copy(star.home);

      if (hovStar) {
        if (star.id === hovStar.id) {
          targetScale = 1.5;
          targetAlpha = 1;
        } else {
          const slotInfo = hovSlots?.find((n) => n.id === star.id);
          if (slotInfo) {
            isOrbiting = true;
            targetScale = 1.12;
            targetAlpha = 1;
            if (!reduceMotion) {
              const r = ORBIT_RADII[slotInfo.strength];
              const speed = 0.5 - (3 - slotInfo.strength) * 0.09;
              const dir = slotInfo.strength === 2 ? -1 : 1;
              // Evenly spaced slots per ring (deterministic ring offset —
              // a random per-star phase here would clump the spacing and
              // collide the name pills).
              const a =
                (slotInfo.slot / slotInfo.ringCount) * Math.PI * 2 +
                slotInfo.strength * 1.7 +
                tNow * speed * dir;
              target.set(
                hovStar.home.x + Math.cos(a) * r,
                hovStar.home.y + Math.sin(a) * r * ORBIT_SQUASH,
                hovStar.home.z + Math.sin(a) * ORBIT_DEPTH
              );
            }
          } else {
            targetAlpha = 0.13;
            targetScale = 0.88;
          }
        }
      } else if (hovCat) {
        const lit = star.category === hovCat;
        targetAlpha = lit ? 1 : 0.25;
        targetScale = lit ? 1.28 : 0.95;
      }

      star.cur.lerp(target, k);
      holder.position.copy(star.cur);

      // Pop-in: each star sparks to life on its own beat as night falls,
      // with a small overshoot so the sky visibly assembles.
      const ap = THREE.MathUtils.clamp(rT * 2.4 - star.stagger * 1.4, 0, 1);
      const back =
        ap >= 1 ? 1 : 1 + 2.7 * Math.pow(ap - 1, 3) + 1.7 * Math.pow(ap - 1, 2);

      const twinkle = reduceMotion
        ? 1
        : 1 + Math.sin(tNow * 1.7 + star.twPhase) * 0.08;
      const prevScale = starScale.current[i] ?? 1;
      const scale = prevScale + (targetScale - prevScale) * k;
      starScale.current[i] = scale;
      const spr = holder.children[0] as THREE.Sprite | undefined;
      if (spr) {
        spr.scale.setScalar(
          star.size * scale * twinkle * Math.max(0.001, back)
        );
      }

      const prevAlpha = starAlpha.current[i] ?? 0;
      const alpha = prevAlpha + (targetAlpha * w - prevAlpha) * k;
      starAlpha.current[i] = alpha;
      mat.opacity = alpha * ap;

      // Name pills: the hovered star's sits below it; each orbiter's pill
      // sits radially OUTWARD from the hovered star in screen space, so
      // pills fan apart instead of stacking on one another.
      const tip = tipRefs.current[i];
      if (tip) {
        const isHovered = hovStar && star.id === hovStar.id;
        const show = isHovered || (hovStar && isOrbiting);
        tip.style.opacity = show ? String(w) : "0";
        if (isHovered) {
          tip.style.transform = "translateY(46px) scale(1.15)";
        } else if (show && hovStar) {
          const sp = scratchTipA.current.copy(star.cur).project(state.camera);
          const cp = scratchTipB.current
            .copy(hovStar.home)
            .project(state.camera);
          let dx = (sp.x - cp.x) * state.size.width;
          let dy = (cp.y - sp.y) * state.size.height;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;
          tip.style.transform = `translate(${(dx * 40).toFixed(1)}px, ${(dy * 40).toFixed(1)}px)`;
        }
      }
    });

    // Constellation chain lines: ink themselves in once their stars are
    // up, fade away while an orbit is active.
    clusters.forEach((cluster, ci) => {
      const rv = THREE.MathUtils.clamp(rT * 0.8 - 0.35 - ci * 0.15, 0, 1);
      const eased = rv * rv * (3 - 2 * rv);
      cluster.reveal.value = eased * cluster.lineLen;
      if (cluster.lineMat) {
        const targetOp = hovStar
          ? 0.05
          : hovCat
            ? cluster.category === hovCat
              ? 0.9
              : 0.12
            : 0.62;
        const cur = lineAlpha.current[cluster.category] ?? 0;
        const next = cur + (targetOp * w - cur) * k;
        lineAlpha.current[cluster.category] = next;
        cluster.lineMat.opacity = next;
      }
      const label = labelRefs.current[ci];
      if (label) {
        const lit = hovStar
          ? 0.08
          : hovCat
            ? cluster.category === hovCat
              ? 1
              : 0.2
            : 0.95;
        label.style.opacity = String(w * lit * eased);
      }
    });

    // Orrery rings glide to the hovered star
    rings.forEach((ring, ri) => {
      const obj = ringRefs.current[ri];
      if (!obj) return;
      const show = hovStar && usedRings.has(ring.strength) && !reduceMotion;
      const cur = ringAlpha.current[ri];
      const next = cur + ((show ? 0.55 : 0) * w - cur) * k;
      ringAlpha.current[ri] = next;
      ring.mat.opacity = next;
      if (hovStar) obj.position.copy(hovStar.home);
      if (!reduceMotion) obj.rotation.z = Math.sin(tNow * 0.3 + ri) * 0.06;
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Deep-sky backdrop + the occasional shooting star */}
      <primitive
        object={starfield}
        ref={(p: THREE.Points | null) => {
          starfieldRef.current = p;
        }}
      />
      {meteor && (
        <primitive
          object={meteor}
          ref={(m: THREE.Mesh | null) => {
            meteorRef.current = m;
          }}
        />
      )}

      {/* Orrery rings */}
      {rings.map((ring, ri) => (
        <primitive
          key={ring.strength}
          object={ring.line}
          ref={(o: THREE.Line | null) => {
            ringRefs.current[ri] = o;
          }}
        />
      ))}

      {/* Constellation chains + category labels */}
      {clusters.map((cluster, ci) => (
        <group key={cluster.category}>
          {cluster.lineObj && <primitive object={cluster.lineObj} />}
          <group
            position={[
              cluster.center.x,
              cluster.center.y + 0.55,
              cluster.center.z,
            ]}
          >
            <Html
              center
              distanceFactor={6}
              zIndexRange={[18, 0]}
              style={{ pointerEvents: "none" }}
            >
              <div
                ref={(el) => {
                  labelRefs.current[ci] = el;
                }}
                className="constellation-label"
                style={{
                  opacity: 0,
                  // lightened to read against the night wash
                  color: lighten(cluster.color, 0.62),
                  textShadow: "0 0 6px rgba(15, 25, 48, 0.8)",
                  fontFamily: isJapanese
                    ? "var(--font-jp-handwritten)"
                    : "var(--font-handwritten)",
                }}
              >
                {cluster.category === "uncharted"
                  ? t("skills.tier_charting")
                  : cluster.category}
              </div>
            </Html>
          </group>
        </group>
      ))}

      {/* Stars */}
      {stars.map((star, i) => (
        <group
          key={star.id}
          position={star.home}
          ref={(g) => {
            starGroupRefs.current[i] = g;
          }}
        >
          <sprite scale={star.size} renderOrder={2}>
            <spriteMaterial
              ref={(m) => {
                starMats.current[i] = m;
              }}
              map={textures.get(star.category)}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
            />
          </sprite>

          {/* generous invisible hit target */}
          <mesh
            visible={false}
            onPointerOver={(e) => {
              if (e.nativeEvent.pointerType === "mouse") {
                sceneState.skyHover = star.id;
              }
            }}
            onPointerOut={(e) => {
              if (
                e.nativeEvent.pointerType === "mouse" &&
                sceneState.skyHover === star.id
              ) {
                sceneState.skyHover = null;
              }
            }}
            onClick={(e) => {
              const pointerType = (e.nativeEvent as PointerEvent).pointerType;
              if (pointerType !== "mouse") {
                sceneState.skyHover =
                  sceneState.skyHover === star.id ? null : star.id;
              }
            }}
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial />
          </mesh>

          {/* Name pill — shown for the hovered star and its orbiters */}
          <Html
            center
            distanceFactor={6}
            zIndexRange={[19, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              ref={(el) => {
                tipRefs.current[i] = el;
              }}
              className="constellation-tip"
              style={{
                opacity: 0,
                borderColor: star.color,
                fontFamily: isJapanese
                  ? "var(--font-jp-handwritten)"
                  : "var(--font-handwritten)",
              }}
            >
              {star.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

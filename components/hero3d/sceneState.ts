/**
 * Per-frame scene state shared between CameraRig (which measures the DOM
 * waypoints and computes blend weights) and the visual layers that react to
 * them (pin markers, the skills constellation, the off-map trail, the
 * uncharted waters). Plain mutable module state — written once per frame
 * inside useFrame (or from DOM event handlers), never via React.
 */
export const sceneState = {
  /** Blend weight per pin id (0..1) while its timeline card is centred */
  pinWeights: {} as Record<string, number>,
  /** Max pin weight — how "zoomed into a place" the camera currently is */
  closeup: 0,
  /** Weight of the skills constellation view */
  network: 0,
  /** Weight of the uncharted-waters view (sneak peek section) */
  uncharted: 0,
  /** Skill name currently hovered in the legend panel (flares its star) */
  hoverSkill: null as string | null,
  /** Skill id hovered/tapped in the night sky — its companions orbit it */
  skyHover: null as string | null,
  /** Category hovered in the "how to read this sky" legend chips */
  hoverCategory: null as string | null,
};

// Dev convenience: lets tests/tooling poke the scene from the console.
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as Record<string, unknown>).__sceneState = sceneState;
}

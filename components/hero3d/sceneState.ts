/**
 * Per-frame scene state shared between CameraRig (which measures the DOM
 * waypoints and computes blend weights) and the visual layers that react to
 * them (pin markers, the network layer, the off-map trail). Plain mutable
 * module state — written once per frame inside useFrame, never via React.
 */
export const sceneState = {
  /** Blend weight per pin id (0..1) while its timeline card is centred */
  pinWeights: {} as Record<string, number>,
  /** Max pin weight — how "zoomed into a place" the camera currently is */
  closeup: 0,
  /** Weight of the skills/AI constellation view */
  network: 0,
};

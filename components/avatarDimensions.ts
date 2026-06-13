import type { CSSProperties } from 'react';

// Source of truth for avatar aspect ratios.
//
// next/image warns when exactly one of the rendered width/height differs from
// the corresponding HTML attribute (an exact integer-string compare, no
// tolerance — see image-component.js). Tailwind's preflight forces
// `img { height: auto }`, so the rendered height is a fractional, natural-ratio
// value (e.g. 206.5px) that rounds inconsistently against the attr → the
// "width or height modified, but not the other" warning.
//
// avatarBox() solves this by (1) giving width/height props that match the
// source's true ratio and (2) pinning the rendered height to that integer attr
// via inline style, so img.height === the attr exactly. object-contain (present
// at every call site) absorbs the sub-pixel ratio rounding with no visible
// distortion, and the small width keeps the download size unchanged.
export const AVATAR_INTRINSIC: Record<string, { w: number; h: number }> = {
  '/avatar/hero_pose.webp': { w: 490, h: 1231 },
  '/avatar/coding_pose.webp': { w: 1065, h: 1321 },
  '/avatar/flexing_pose.webp': { w: 829, h: 1247 },
  '/avatar/namaste_pose.webp': { w: 497, h: 1242 },
  '/avatar/thinking_pose.webp': { w: 351, h: 996 },
  '/avatar/victory_pose.webp': { w: 842, h: 1242 },
  '/avatar/waving_pose.webp': { w: 745, h: 1242 },
  '/avatar/walking_pose.webp': { w: 1424, h: 752 },
};

/**
 * Returns spreadable next/image props (width, height, and a height-pinning
 * style) that preserve an avatar's true aspect ratio at a desired rendered
 * width. Spread onto an <Image> that already has `object-contain`. Falls back to
 * a 3:4 portrait if the src is unknown.
 *
 * Note: the returned `style` only sets `height`; merge it manually at call sites
 * that need their own style (e.g. a transform), since a later `style` prop would
 * otherwise replace it.
 */
export function avatarBox(
  src: string,
  renderWidth: number,
): { width: number; height: number; style: CSSProperties } {
  const dim = AVATAR_INTRINSIC[src] ?? { w: 3, h: 4 };
  const height = Math.round((renderWidth * dim.h) / dim.w);
  return { width: renderWidth, height, style: { height } };
}

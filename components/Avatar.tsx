'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { avatarBox } from './avatarDimensions';

// Available poses with their image paths
export const AVATAR_POSES = {
  hero: '/avatar/hero_pose.webp',
  coding: '/avatar/coding_pose.webp',
  flexing: '/avatar/flexing_pose.webp',
  namaste: '/avatar/namaste_pose.webp',
  thinking: '/avatar/thinking_pose.webp',
  victory: '/avatar/victory_pose.webp',
  waving: '/avatar/waving_pose.webp',
} as const;

export type AvatarPose = keyof typeof AVATAR_POSES;

interface AvatarProps {
  className?: string;
  pose?: AvatarPose;
  animate?: boolean;
  /** Desired rendered width in px; height is derived from the pose's true ratio. */
  width?: number;
}

export default function Avatar({
  className = '',
  pose = 'hero',
  animate = true,
  width = 300,
}: AvatarProps) {
  const shouldReduceMotion = useReducedMotion();
  const src = AVATAR_POSES[pose];
  const box = avatarBox(src, width);
  return (
    <motion.div
      className={`relative ${className}`}
      animate={
        animate && !shouldReduceMotion ? { y: [0, -10, 0] } : undefined
      }
      transition={
        animate && !shouldReduceMotion
          ? {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : undefined
      }
    >
      <Image
        src={src}
        alt={`Avatar - ${pose} pose`}
        width={box.width}
        height={box.height}
        style={box.style}
        className="object-contain"
        priority={pose === 'hero'}
      />
    </motion.div>
  );
}

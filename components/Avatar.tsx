'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

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
  width?: number;
  height?: number;
}

export default function Avatar({ 
  className = '', 
  pose = 'hero',
  animate = true,
  width = 300,
  height = 400,
}: AvatarProps) {
  const shouldReduceMotion = useReducedMotion();
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
        src={AVATAR_POSES[pose]}
        alt={`Avatar - ${pose} pose`}
        width={width}
        height={height}
        className="object-contain"
        priority={pose === 'hero'}
      />
    </motion.div>
  );
}

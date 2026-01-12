'use client';

import { motion } from 'framer-motion';
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
  return (
    <motion.div
      className={`relative ${className}`}
      animate={animate ? { y: [0, -10, 0] } : undefined}
      transition={animate ? {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      } : undefined}
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
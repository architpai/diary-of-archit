'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

// Available poses with their image paths
export const AVATAR_POSES = {
  hero: '/avatar/hero_pose.png',
  coding: '/avatar/coding_pose.png',
  flexing: '/avatar/flexing_pose.png',
  namaste: '/avatar/namaste_pose.png',
  thinking: '/avatar/thinking_pose.png',
  victory: '/avatar/victory_pose.png',
  waving: '/avatar/waving_pose.png',
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
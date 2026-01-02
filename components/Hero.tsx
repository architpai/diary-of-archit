'use client';

import { motion } from 'framer-motion';
import Avatar from './Avatar';

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Floating Doodles */}
      <motion.div
        className="absolute top-20 right-10 text-6xl floating-doodle"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-10 text-5xl floating-doodle"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        💻
      </motion.div>
      <motion.div
        className="absolute top-40 left-20 text-4xl floating-doodle"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        ⚡
      </motion.div>
      
      {/* Main Content */}
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Title with hand-drawn style */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="diary-title text-ink">
            <span className="block">DIARY</span>
            <span className="block text-margin-blue">of a</span>
            <span className="block underline-sketch">DEVELOPER</span>
          </h1>
        </motion.div>

        {/* Avatar */}
        <motion.div
          className="my-12 flex justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Avatar className="w-48 h-auto" animate={true} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="diary-subtitle text-ink max-w-md mx-auto handwritten"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {"Building cool stuff, one bug at a time 🐛"}
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          className="mt-16"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="handwritten text-ink opacity-60">
            ↓ scroll for more ↓
          </div>
        </motion.div>
      </motion.div>

      {/* Corner Doodles */}
      <motion.div
        className="absolute bottom-10 right-10 text-4xl floating-doodle hidden md:block"
        animate={{
          rotate: [0, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        ⚙️
      </motion.div>
    </section>
  );
}

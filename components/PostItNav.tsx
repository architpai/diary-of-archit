'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSeriousMode } from '@/contexts/SeriousModeContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Home', icon: '🏠', color: '#FFEB3B' },
  { id: 'timeline', label: 'Journey', icon: '📅', color: '#FF69B4' },
  { id: 'skills', label: 'Skills', icon: '💪', color: '#87CEEB' },
  { id: 'sneakpeek', label: 'About Me', icon: '👀', color: '#98FB98' },
  { id: 'contact', label: 'Contact', icon: '📧', color: '#FFB347' },
];

export default function PostItNav() {
  const { isSerious } = useSeriousMode();
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  // Minimal navigation in serious mode
  if (isSerious) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 post-it-nav">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-sans font-bold text-lg">Archit Pai</span>
          <div className="flex gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="font-sans text-sm text-gray-600 hover:text-black transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Mobile Toggle */}
      <motion.button
        className="fixed top-4 right-4 z-50 p-3 wobbly-border bg-paper md:hidden post-it-nav"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">{isOpen ? '✕' : '📌'}</span>
      </motion.button>

      {/* Post-it Navigation */}
      <motion.nav
        className={`
          fixed right-4 top-1/2 -translate-y-1/2 z-40 post-it-nav
          ${isOpen ? 'flex' : 'hidden'} md:flex
          flex-col gap-3
        `}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="relative group"
            style={{ transform: `rotate(${(index - 2) * 4}deg)` }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 0,
              zIndex: 50
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            {/* Post-it */}
            <div
              className="w-14 h-14 flex items-center justify-center shadow-lg transition-shadow group-hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}CC 100%)`,
              }}
            >
              <span className="text-2xl">{item.icon}</span>
            </div>

            {/* Label tooltip */}
            <motion.span
              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-ink text-paper px-3 py-1 rounded-lg text-sm whitespace-nowrap handwritten opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              initial={{ x: 10 }}
              whileHover={{ x: 0 }}
            >
              {item.label}
            </motion.span>
          </motion.button>
        ))}
      </motion.nav>
    </>
  );
}

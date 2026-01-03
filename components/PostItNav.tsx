'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSeriousMode } from '@/contexts/SeriousModeContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  splashColor: string;
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Home', icon: '🏠', color: '#FFEB3B', splashColor: '#FFD700' },
  { id: 'timeline', label: 'Journey', icon: '📅', color: '#FF69B4', splashColor: '#FF1493' },
  { id: 'skills', label: 'Skills', icon: '💪', color: '#87CEEB', splashColor: '#4682B4' },
  { id: 'sneakpeek', label: 'About Me', icon: '👀', color: '#98FB98', splashColor: '#32CD32' },
  { id: 'contact', label: 'Contact', icon: '📧', color: '#FFB347', splashColor: '#FF8C00' },
];

export default function PostItNav() {
  const { isSerious } = useSeriousMode();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
        className="fixed top-4 right-4 z-50 p-3 wobbly-border bg-paper shadow-lg md:hidden post-it-nav"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-2xl">{isOpen ? '✕' : '📌'}</span>
      </motion.button>

      {/* Post-it Navigation */}
      <motion.nav
        className={`
          fixed right-4 top-1/2 -translate-y-1/2 z-40 post-it-nav
          ${isOpen ? 'flex' : 'hidden'} md:flex
          flex-col gap-4
        `}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative group"
            style={{ transform: `rotate(${(index - 2) * 4}deg)` }}
            whileHover={{ 
              scale: 1.15, 
              rotate: 0,
              zIndex: 50
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            {/* Paint Splash Effect (behind the post-it) */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                background: `radial-gradient(ellipse at center, ${item.splashColor} 0%, transparent 70%)`,
                transform: 'scale(1.8)',
              }}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ 
                opacity: hoveredItem === item.id ? 0.6 : 0,
                scale: hoveredItem === item.id ? 1.8 : 1.2
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Post-it */}
            <div
              className="w-16 h-16 flex items-center justify-center shadow-lg transition-all relative z-10"
              style={{
                background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}DD 100%)`,
                boxShadow: hoveredItem === item.id 
                  ? `4px 4px 15px rgba(0,0,0,0.3), 0 0 20px ${item.splashColor}50`
                  : '3px 3px 8px rgba(0,0,0,0.2)',
              }}
            >
              <span className="text-2xl">{item.icon}</span>
            </div>

            {/* Label tooltip */}
            <motion.span
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-ink text-paper px-4 py-2 rounded-lg text-sm whitespace-nowrap handwritten font-bold shadow-lg"
              initial={{ opacity: 0, x: 10 }}
              animate={{ 
                opacity: hoveredItem === item.id ? 1 : 0,
                x: hoveredItem === item.id ? 0 : 10
              }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
              {/* Arrow */}
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-ink" />
            </motion.span>
          </motion.button>
        ))}
      </motion.nav>
    </>
  );
}


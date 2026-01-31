'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  splashColor: string;
}

const getNavItems = (t: (key: string) => string) => [
  { id: 'hero', label: t('nav.home'), icon: '🏠', color: '#FFEB3B', splashColor: '#FFD700' },
  { id: 'timeline', label: t('nav.journey'), icon: '📅', color: '#FF69B4', splashColor: '#FF1493' },
  { id: 'skills', label: t('nav.skills'), icon: '💪', color: '#87CEEB', splashColor: '#4682B4' },
  { id: 'sneakpeek', label: t('nav.about'), icon: '👀', color: '#98FB98', splashColor: '#32CD32' },
  { id: 'contact', label: t('nav.contact'), icon: '📧', color: '#FFB347', splashColor: '#FF8C00' },
];

export default function PostItNav() {
  const { isSerious } = useSeriousMode();
  const { t, content } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navItems = getNavItems(t);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  // Only show navigation in serious mode (MapScrollNav handles diary mode)
  if (!isSerious) {
    return null;
  }

  // Minimal navigation in serious mode
  return (
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 post-it-nav">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-sans font-bold text-lg">{content.personal.name}</span>
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


'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface SeriousModeContextType {
  isSerious: boolean;
  toggleSerious: () => void;
}

const SeriousModeContext = createContext<SeriousModeContextType | undefined>(undefined);

export function SeriousModeProvider({ children }: { children: ReactNode }) {
  const [isSerious, setIsSerious] = useState(false);

  const toggleSerious = useCallback(() => {
    setIsSerious(prev => !prev);
  }, []);

  // Apply class to body element
  useEffect(() => {
    if (isSerious) {
      document.body.classList.add('serious-mode');
    } else {
      document.body.classList.remove('serious-mode');
    }
  }, [isSerious]);

  return (
    <SeriousModeContext.Provider value={{ isSerious, toggleSerious }}>
      {children}
    </SeriousModeContext.Provider>
  );
}

export function useSeriousMode() {
  const context = useContext(SeriousModeContext);
  if (context === undefined) {
    throw new Error('useSeriousMode must be used within a SeriousModeProvider');
  }
  return context;
}

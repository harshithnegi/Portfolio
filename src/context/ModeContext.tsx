import React, { createContext, useContext, useState, useEffect } from 'react';

export type OffensiveMode = 'default' | 'web' | 'network';

interface ModeContextType {
  mode: OffensiveMode;
  setMode: (mode: OffensiveMode) => void;
  resetMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<OffensiveMode>(() => {
    const saved = sessionStorage.getItem('hn_portfolio_mode');
    if (saved === 'web' || saved === 'network') {
      return saved;
    }
    return 'default';
  });

  const setMode = (newMode: OffensiveMode) => {
    setModeState(newMode);
    sessionStorage.setItem('hn_portfolio_mode', newMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetMode = () => {
    setMode('default');
  };

  useEffect(() => {
    // Sync theme class to html and body elements for global background styling
    document.documentElement.classList.remove('theme-default', 'theme-web', 'theme-network');
    document.documentElement.classList.add(`theme-${mode}`);
    document.body.classList.remove('theme-default', 'theme-web', 'theme-network');
    document.body.classList.add(`theme-${mode}`);

    // Sync across any custom events or tabs if needed
    const handleModeChange = (e: CustomEvent<OffensiveMode>) => {
      if (e.detail) {
        setModeState(e.detail);
      }
    };
    window.addEventListener('hn-mode-change' as any, handleModeChange);
    return () => window.removeEventListener('hn-mode-change' as any, handleModeChange);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode, resetMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useOffensiveMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useOffensiveMode must be used within a ModeProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppTheme, FontScale } from '../types';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  theme: AppTheme;
  fontScale: FontScale;
  toggleTheme: () => void;
  setFontScale: (scale: FontScale) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();

  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('oy-theme') as AppTheme) || 'light';
  });

  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    return (localStorage.getItem('oy-font-scale') as FontScale) || 'normal';
  });

  useEffect(() => {
    // Sincronizar tema claro/oscuro
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('oy-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Sincronizar escala de fuente
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-xlarge');
    document.documentElement.classList.add(`font-${fontScale}`);
    localStorage.setItem('oy-font-scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    // Sincronizar tema de rol: azul navy para seeker, naranja para provider
    document.documentElement.classList.remove('role-seeker', 'role-provider');
    document.documentElement.classList.add(`role-${role}`);
  }, [role]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
  };

  return (
    <ThemeContext.Provider value={{ theme, fontScale, toggleTheme, setFontScale }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

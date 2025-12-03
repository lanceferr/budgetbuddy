import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
    cardHover: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('budgetbuddy-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('budgetbuddy-theme', isDark ? 'dark' : 'light');
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.background = isDark ? '#1f2937' : '#fafaf9';
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const lightTheme = {
    background: '#fafaf9',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#10b981',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    cardHover: '0 4px 12px rgba(0,0,0,0.15)',
  };

  const darkTheme = {
    background: '#1f2937',
    surface: '#374151',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#4b5563',
    primary: '#10b981',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    cardHover: '0 4px 12px rgba(0,0,0,0.5)',
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

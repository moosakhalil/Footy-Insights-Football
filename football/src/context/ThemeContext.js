import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage for theme preference or default to light
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Toggle between light and dark theme with transition handling
  const toggleTheme = () => {
    // Apply transition class to body
    document.body.classList.add('theme-transition');
    
    // Set a timeout to remove the transition class
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 800);
    
    // Change theme
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme class to document body when theme changes
  useEffect(() => {
    // Remove both classes first
    document.body.classList.remove('light', 'dark');
    // Add the current theme class
    document.body.classList.add(theme);
    
    // Store theme in local storage
    localStorage.setItem('theme', theme);
    
    // Add special styles to handle theme change flashes
    const style = document.createElement('style');
    style.innerHTML = `
      .theme-transition,
      .theme-transition *,
      .theme-transition *:before,
      .theme-transition *:after {
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
        transition-delay: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
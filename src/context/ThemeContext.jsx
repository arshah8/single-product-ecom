import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;

        // Default to system
        return 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Function to apply theme
        const applyTheme = (currentTheme) => {
            root.classList.remove('light', 'dark');

            let effectiveTheme = currentTheme;
            if (currentTheme === 'system') {
                effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            root.classList.add(effectiveTheme);
            // Also set color-scheme for scrollbars and system UI elements
            root.style.colorScheme = effectiveTheme;
        };

        applyTheme(theme);
        localStorage.setItem('theme', theme);

        // Listen for system theme changes if set to system
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const value = {
        theme,
        setTheme,
        isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

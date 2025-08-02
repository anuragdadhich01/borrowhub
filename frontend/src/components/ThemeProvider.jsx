import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create a context for theme management
const ThemeContext = createContext();

// Enhanced dark theme
const createDarkTheme = () => createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // Purple for dark mode
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#fbbf24', // Gold accent
      light: '#fcd34d',
      dark: '#f59e0b',
      contrastText: '#000000',
    },
    background: {
      default: '#0f172a', // Very dark blue
      paper: '#1e293b',   // Dark slate
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    divider: '#334155',
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    grey: {
      50: '#1e293b',
      100: '#334155',
      200: '#475569',
      300: '#64748b',
      400: '#94a3b8',
      500: '#cbd5e1',
      600: '#e2e8f0',
      700: '#f1f5f9',
      800: '#f8fafc',
      900: '#ffffff',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          color: '#f8fafc',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.8)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderColor: '#334155',
          '&:hover': {
            backgroundColor: '#334155',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            '& fieldset': {
              borderColor: '#475569',
            },
            '&:hover fieldset': {
              borderColor: '#64748b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8b5cf6',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          },
        },
      },
    },
  },
});

// Enhanced light theme (original modernTheme with improvements)
const createLightTheme = () => createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          color: '#1e293b',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f8fafc',
            '& fieldset': {
              borderColor: '#cbd5e1',
            },
            '&:hover fieldset': {
              borderColor: '#64748b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
          },
        },
      },
    },
  },
});

// Theme provider component
export const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('borrowhub-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const theme = isDarkMode ? createDarkTheme() : createLightTheme();

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('borrowhub-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('borrowhub-theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const contextValue = {
    isDarkMode,
    toggleDarkMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a CustomThemeProvider');
  }
  return context;
};

// Dark mode toggle component
export const DarkModeToggle = ({ sx = {} }) => {
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  
  return (
    <IconButton
      onClick={toggleDarkMode}
      sx={{
        color: 'text.secondary',
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          color: 'primary.main'
        },
        ...sx
      }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
};

// Import required icons
import { IconButton } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';

export default CustomThemeProvider;
// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext'; // We've added this line
import modernTheme from './theme/modernTheme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <AuthProvider> {/* This wrapper makes login state available everywhere */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
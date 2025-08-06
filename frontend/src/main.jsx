// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './components/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <CustomThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </CustomThemeProvider>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ItemProvider } from './context/ItemContext.jsx'; // Import ItemProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ItemProvider> {/* Add ItemProvider here */}
        <App />
      </ItemProvider>
    </AuthProvider>
  </React.StrictMode>
);
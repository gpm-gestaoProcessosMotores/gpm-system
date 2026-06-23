import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { initializeStorage } from './services/storageService.js';
import { applyTheme, getPreferredTheme } from './utils/theme.js';
import '@fontsource-variable/geist';
import './styles/index.css';

initializeStorage();
applyTheme(getPreferredTheme());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

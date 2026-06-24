import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { initializeStorage } from './services/storageService.js';
import '@fontsource-variable/geist';
import './styles/index.css';
import './styles/professional-theme.css';

initializeStorage();
document.documentElement.classList.remove('dark');
document.documentElement.dataset.theme = 'light';
localStorage.removeItem('gpm_theme');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

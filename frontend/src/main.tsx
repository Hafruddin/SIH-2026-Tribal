import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { JagoProvider } from './context/JagoContext';
import App from './App';
import './index.css';
import axios from 'axios';

// Configure production API base URL
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

// Guard against static host returning HTML index for missing /api routes
axios.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === 'string' &&
      response.data.trim().startsWith('<!DOCTYPE html') &&
      response.config.url?.includes('/api')
    ) {
      return Promise.reject(new Error('Backend endpoint unavailable. Please ensure the backend server is running and VITE_API_BASE_URL is configured.'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <JagoProvider>
              <App />
            </JagoProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

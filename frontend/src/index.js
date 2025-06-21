import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';
import { useTranslation } from 'react-i18next';
import { trackWebVitals } from './utils/performance';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Initialize performance tracking in development
if (process.env.NODE_ENV === 'development') {
  trackWebVitals();
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 


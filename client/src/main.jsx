import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'leaflet/dist/leaflet.css';
import './index.css';

import { AppProvider } from './context/AppContext';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);

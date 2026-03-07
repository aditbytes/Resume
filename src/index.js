import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

// Define the linkHref function with domain validation
window.linkHref = (url) => {
  try {
    const parsed = new URL(url, window.location.origin);
    const allowedProtocols = ['https:', 'http:', 'mailto:'];
    if (allowedProtocols.includes(parsed.protocol)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch {
    // Invalid URL, do nothing
  }
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
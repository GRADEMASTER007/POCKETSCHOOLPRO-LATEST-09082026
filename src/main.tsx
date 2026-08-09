import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Ignore benign HMR/WebSocket errors and unhandled rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    if (
      msg.includes('websocket') || 
      msg.includes('WebSocket') || 
      msg.includes('vite') || 
      msg.includes('opened')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('websocket') || 
      msg.includes('WebSocket') || 
      msg.includes('vite') || 
      msg.includes('opened')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

// Register the service worker for offline support
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


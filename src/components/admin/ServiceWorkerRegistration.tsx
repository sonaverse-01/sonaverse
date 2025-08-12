'use client';

import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
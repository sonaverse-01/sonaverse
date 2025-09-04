'use client';

import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    // 보안상의 이유로 서비스워커를 완전히 비활성화
    if ('serviceWorker' in navigator) {
      // 기존 서비스워커 해제
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
          console.log('Service Worker unregistered for security');
        });
      });
      
      // 캐시 정리
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
            console.log('Cache cleared:', cacheName);
          });
        });
      }
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
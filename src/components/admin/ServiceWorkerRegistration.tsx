'use client';

import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // 빌드 버전을 쿼리 파라미터로 추가하여 서비스워커 버전 관리
      const version = process.env.NEXT_PUBLIC_APP_VERSION ?? String(Date.now());
      const swUrl = `/sw.js?v=${version}`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // 서비스워커 업데이트 강제 실행
          registration.update();
          
          // 새 서비스워커가 설치되면 즉시 활성화
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker installed, refreshing page...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
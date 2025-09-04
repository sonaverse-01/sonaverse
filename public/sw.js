// 서비스워커 버전은 쿼리 파라미터에서 추출
const getCacheName = () => {
  const urlParams = new URLSearchParams(self.location.search);
  const version = urlParams.get('v') || 'default';
  return `sonaverse-admin-${version}`;
};

const CACHE_NAME = getCacheName();

// Install event - 즉시 활성화
self.addEventListener('install', event => {
  console.log('Service Worker installing with cache:', CACHE_NAME);
  self.skipWaiting(); // 새 서비스워커 즉시 활성화
});

// Activate event - 이전 캐시 정리
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim(); // 모든 클라이언트 제어
    })
  );
});

// Fetch event - 안전한 캐싱 전략
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Next.js 빌드 아티팩트는 절대 캐시하지 않음
  if (url.pathname.startsWith('/_next/')) {
    return; // 네트워크 요청 그대로 통과
  }
  
  // HTML 네비게이션 요청 - 네트워크 우선, 실패 시 캐시
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 성공 시 캐시에 저장 (백업용)
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 찾기
          return caches.match(request);
        })
    );
    return;
  }
  
  // 정적 리소스 (이미지, 폰트 등) - 캐시 우선, 실패 시 네트워크
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      request.destination === 'style') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request);
        })
    );
    return;
  }
  
  // 기타 요청은 네트워크 우선
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});
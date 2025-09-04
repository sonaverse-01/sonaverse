// 보안상의 이유로 서비스워커를 완전히 비활성화
// 이전 버전의 서비스워커가 인증 상태를 캐시하는 보안 문제가 있었음

console.log('Service Worker disabled for security reasons');

// 모든 이벤트 리스너를 제거하여 서비스워커가 아무것도 처리하지 않도록 함
self.addEventListener('install', event => {
  console.log('Service Worker installation blocked for security');
  // 설치를 차단
  event.preventDefault();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activation blocked for security');
  // 활성화를 차단
  event.preventDefault();
});

self.addEventListener('fetch', event => {
  console.log('Service Worker fetch blocked for security');
  // fetch 이벤트를 처리하지 않음
  return;
});
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO 최적화
  trailingSlash: false,
  poweredByHeader: false,
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' data: https:;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },

  // 압축 활성화
  compress: true,

  // 생성된 사이트맵과 robots.txt 제공
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // 환경변수는 기본적으로 서버사이드에서만 사용 가능
  // 클라이언트에서 필요한 경우만 NEXT_PUBLIC_ 접두사 사용
};

export default nextConfig;

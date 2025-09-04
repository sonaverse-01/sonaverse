import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '../contexts/LanguageContext';
import { ToastProvider } from '../components/Toast';
import MainLayout from '../components/MainLayout';
import ChunkErrorBoundary from '../components/ChunkErrorBoundary';
import ChunkErrorHandler from '../components/ChunkErrorHandler';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: '소나버스 - 시니어의 더 나은 일상을 위해',
    template: '%s | 소나버스'
  },
  description: '소나버스는 시니어의 더 나은 일상을 위해 하이브리드 성인용 보행기 만보와 성인용 기저귀 브랜드 보듬을 연구개발하는 시니어테크 스타트업입니다.',
  keywords: ['소나버스', 'SONAVERSE', '만보', '보행기', '성인용보행기', '보듬', '성인용기저귀', '시니어', '시니어테크', '하이브리드보행기', 'IoT센싱'],
  authors: [{ name: 'SONAVERSE' }],
  creator: 'SONAVERSE',
  publisher: 'SONAVERSE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sonaverse.kr'),
  alternates: {
    canonical: '/',
    languages: {
      ko: '/ko',
      en: '/en',
    },
  },
  openGraph: {
    title: '소나버스 - 시니어의 더 나은 일상을 위해',
    description: '소나버스는 시니어의 더 나은 일상을 위해 하이브리드 성인용 보행기 만보와 성인용 기저귀 브랜드 보듬을 연구개발하는 시니어테크 스타트업입니다.',
    url: 'https://sonaverse.kr',
    siteName: '소나버스',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/logo/symbol_logo.png',
        width: 1200,
        height: 630,
        alt: '소나버스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '소나버스 - 시니어의 더 나은 일상을 위해',
    description: '소나버스는 시니어의 더 나은 일상을 위해 하이브리드 성인용 보행기 만보와 성인용 기저귀 브랜드 보듬을 연구개발하는 시니어테크 스타트업입니다.',
    images: ['/logo/symbol_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

// themeColor 관련 viewport 객체 완전히 제거

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <head>
        <meta name="google-site-verification" content="FEYJGWcAwSiYrpz7Zh5fSCWtqKCKrrTLnyd2Xk2FwII" />
        {/* Organization JSON-LD (전역) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "소나버스",
              "url": "https://www.sonaverse.kr",
              "description": "소나버스는 social new age universe의 약자로, '시니어의 더 나은 일상을 위해' 라는 비전을 가지고 시니어 제품을 연구개발 및 서비스 하고 있는 시니어테크 스타트업입니다. 하이브리드 성인용 보행기 만보, 성인용 기저귀 브랜드 보듬이라는 아이템을 주력 아이템으로 가지고 있습니다. 소나버스의 제품 및 서비스의 특장점은 시니어의 더 나은 일상을 위해서 시니어를 부양하는 보호자가 관리하기 편안한 것을 연구한다는 것에 특징이 있습니다. 그들을 보호하는 보호자가 편리해야 결국 시니어의 일상이 달라질 것이라고 생각하고 있기 때문입니다.",
              "foundingDate": "2022-11-29",
              "founder": {
                "@type": "Person",
                "name": "이수진"
              },
              "employee": [
                { "@type": "Person", "name": "이수진", "jobTitle": "대표" },
                { "@type": "Person", "name": "이지명", "jobTitle": "이사" },
                { "@type": "Person", "name": "김영석", "jobTitle": "소장" },
                { "@type": "Person", "name": "조윤석", "jobTitle": "상무" },
                { "@type": "Person", "name": "손규동", "jobTitle": "주임" }
              ],
              "telephone": "+82-10-5703-8899",
              "email": "shop@sonaverse.kr",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "강원특별자치도 춘천시",
                "streetAddress": "후석로462번길 7, 춘천ICT벤처센터 319호",
                "addressCountry": "KR"
              },
              "sameAs": [
                "https://www.instagram.com/sonaverse.kr/"
              ],
              "knowsAbout": [
                "시니어",
                "성인용보행기",
                "하이브리드보행기",
                "성인용기저귀",
                "IoT센싱"
              ],
              "award": "2024 여성창업경진대회 입상",
              "memberOf": "강원여성경영인협회",
              "hasCredential": [
                "사업자등록번호 697-87-0255",
                "벤처인증",
                "여성기업인증",
                "ISO9001&14001",
                "연구소기업",
                "기업부설연구소"
              ],
              "subOrganization": [
                { "@type": "Organization", "name": "만보" },
                { "@type": "Organization", "name": "보듬" }
              ]
            })
          }}
        />
        {/* Critical CSS inlining for fold content to reduce render-blocking */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical styles for above-the-fold hero/header */
              body{margin:0}
              header.sticky{background-color:#f0ece9}
              #hero{min-height:100vh;position:relative}
              #hero h1{color:#fff}
              #hero .cta{display:flex;gap:.5rem;justify-content:center}
            `,
          }}
        />
        {/* Preload LCP hero image */}
        <link rel="preload" as="image" href="/hero5.png" fetchPriority="high" />
      </head>
      <body className="font-sans antialiased">
        <ChunkErrorHandler />
        <ChunkErrorBoundary>
          <LanguageProvider>
            <ToastProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </ToastProvider>
          </LanguageProvider>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}

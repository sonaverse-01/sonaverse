import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '언론보도 - 소나버스의 소식과 뉴스 | SONAVERSE',
  description: '소나버스의 최신 소식과 언론에서 다룬 주요 뉴스를 확인해보세요. 혁신적인 헬스케어 솔루션에 대한 다양한 보도 자료를 만나보실 수 있습니다.',
  keywords: ['소나버스 뉴스', '언론보도', '헬스케어 뉴스', '시니어 케어', '보도자료', '소나버스 소식'],
  openGraph: {
    title: '언론보도 - 소나버스의 소식과 뉴스 | SONAVERSE',
    description: '소나버스의 최신 소식과 언론에서 다룬 주요 뉴스를 확인해보세요.',
    url: 'https://sonaverse.kr/press',
    siteName: 'SONAVERSE',
    images: [
      {
        url: '/logo/symbol_logo.png',
        width: 1200,
        height: 630,
        alt: 'SONAVERSE 언론보도',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '언론보도 - 소나버스의 소식과 뉴스 | SONAVERSE',
    description: '소나버스의 최신 소식과 언론에서 다룬 주요 뉴스를 확인해보세요.',
    images: ['/logo/symbol_logo.png'],
  },
  alternates: {
    canonical: 'https://sonaverse.kr/press',
  },
}

export default function PressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '소나버스 언론보도',
    description: '소나버스의 최신 소식과 언론에서 다룬 주요 뉴스',
    url: 'https://sonaverse.kr/press',
    publisher: {
      '@type': 'Organization',
      name: 'SONAVERSE',
      url: 'https://sonaverse.kr',
      logo: '/logo/symbol_logo.png'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '소나버스 스토리 - 혁신 여정과 시니어 라이프 인사이트 | SONAVERSE',
  description: '소나버스의 혁신 여정과 시니어 라이프에 대한 깊이 있는 통찰을 만나보세요. 헬스케어 혁신과 시니어 케어에 대한 다양한 이야기를 소개합니다.',
  keywords: ['소나버스 스토리', '시니어 라이프', '헬스케어 인사이트', '혁신 여정', '소나버스 블로그', '시니어 케어'],
  openGraph: {
    title: '소나버스 스토리 - 혁신 여정과 시니어 라이프 인사이트 | SONAVERSE',
    description: '소나버스의 혁신 여정과 시니어 라이프에 대한 깊이 있는 통찰을 만나보세요.',
    url: 'https://sonaverse.com/sonaverse-story',
    siteName: 'SONAVERSE',
    images: [
      {
        url: 'https://sonaverse.com/logo/symbol_logo.png',
        width: 1200,
        height: 630,
        alt: 'SONAVERSE 스토리',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '소나버스 스토리 - 혁신 여정과 시니어 라이프 인사이트 | SONAVERSE',
    description: '소나버스의 혁신 여정과 시니어 라이프에 대한 깊이 있는 통찰을 만나보세요.',
    images: ['https://sonaverse.com/logo/symbol_logo.png'],
  },
  alternates: {
    canonical: 'https://sonaverse.com/sonaverse-story',
  },
}

export default function SonaverseStoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: '소나버스 스토리',
    description: '소나버스의 혁신 여정과 시니어 라이프에 대한 깊이 있는 통찰',
    url: 'https://sonaverse.com/sonaverse-story',
    publisher: {
      '@type': 'Organization',
      name: 'SONAVERSE',
      url: 'https://sonaverse.com',
      logo: 'https://sonaverse.com/logo/symbol_logo.png'
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
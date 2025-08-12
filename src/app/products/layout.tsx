import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '제품소개 - 혁신적인 헬스케어 솔루션 | SONAVERSE',
  description: '소나버스의 혁신적인 헬스케어 제품들을 만나보세요. 만보 워크메이트와 보듬 기저귀로 시니어의 더 나은 삶을 제공합니다.',
  keywords: ['소나버스 제품', '만보 워크메이트', '보듬 기저귀', '시니어 헬스케어', '보행 보조기', '성인용 기저귀'],
  openGraph: {
    title: '제품소개 - 혁신적인 헬스케어 솔루션 | SONAVERSE',
    description: '소나버스의 혁신적인 헬스케어 제품들을 만나보세요. 만보 워크메이트와 보듬 기저귀로 시니어의 더 나은 삶을 제공합니다.',
    url: 'https://sonaverse.com/products',
    siteName: 'SONAVERSE',
    images: [
      {
        url: 'https://sonaverse.com/logo/symbol_logo.png',
        width: 1200,
        height: 630,
        alt: 'SONAVERSE 제품소개',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '제품소개 - 혁신적인 헬스케어 솔루션 | SONAVERSE',
    description: '소나버스의 혁신적인 헬스케어 제품들을 만나보세요.',
    images: ['https://sonaverse.com/logo/symbol_logo.png'],
  },
  alternates: {
    canonical: 'https://sonaverse.com/products',
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SONAVERSE',
    url: 'https://sonaverse.com',
    logo: 'https://sonaverse.com/logo/symbol_logo.png',
    description: '시니어의 더 나은 내일을 위한 혁신적인 헬스케어 솔루션을 제공하는 기업',
    products: [
      {
        '@type': 'Product',
        name: '만보 워크메이트',
        description: '하이브리드형 워크메이트로 경사지 제어 기능과 실종 방지 기능을 갖춘 혁신적인 보행 보조기',
        brand: {
          '@type': 'Brand',
          name: 'SONAVERSE'
        }
      },
      {
        '@type': 'Product',
        name: '보듬 기저귀',
        description: '프리미엄 성인용 기저귀로 안심할 수 있는 코어 설계와 천연 펄프를 사용한 고품질 제품',
        brand: {
          '@type': 'Brand',
          name: 'SONAVERSE'
        }
      }
    ]
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
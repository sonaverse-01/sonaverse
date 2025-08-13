import type { Metadata } from 'next';
import { dbConnect } from '@/lib/db';
import DiaperProduct from '@/models/DiaperProduct';
import ClientProductDetail from './ClientProductDetail';

// SSR 메타데이터(제품 상세) - 썸네일/대표이미지로 og:image 자동 적용
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    await dbConnect();
    const product: any = await DiaperProduct.findOne({ slug, is_active: true })
      .select('slug name description thumbnail_image product_images created_at updated_at')
      .lean();

    if (!product) {
      return {
        title: 'Product Not Found - SONAVERSE',
        description: 'The requested product could not be found.'
      };
    }

    const titleKo: string = product.name?.ko || '보듬 기저귀';
    const descKo: string = product.description?.ko || titleKo;
    // 본문 첫 이미지 -> 썸네일 -> 제품 이미지 -> 기본 로고 순으로 선택
    const ogImage: string = (() => {
      // 본문에서 첫 이미지 추출 (description에서)
      const bodyHtml = descKo || '';
      const match = bodyHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (match?.[1]) return match[1];
      if (product.thumbnail_image) return product.thumbnail_image;
      if (product.product_images?.[0]) return product.product_images[0];
      return '/logo/symbol_logo.png';
    })();
    const pageUrl = `https://sonaverse.kr/products/bodeum-diaper/${slug}`;

    return {
      title: `${titleKo} - 제품 상세 | SONAVERSE`,
      description: descKo.slice(0, 160),
      openGraph: {
        title: `${titleKo} - 제품 상세 | SONAVERSE`,
        description: descKo.slice(0, 200),
        url: pageUrl,
        siteName: 'SONAVERSE',
        type: 'website',
        images: [{ url: ogImage, width: 1200, height: 630, alt: titleKo }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${titleKo} - 제품 상세 | SONAVERSE`,
        description: descKo.slice(0, 200),
        images: [ogImage]
      },
      alternates: { canonical: pageUrl }
    };
  } catch {
    return {
      title: 'Product - SONAVERSE',
      description: 'SONAVERSE products',
      alternates: { canonical: `https://sonaverse.kr/products/bodeum-diaper/${slug}` }
    };
  }
}

interface DiaperProduct {
  _id: string;
  slug: string;
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  thumbnail_image: string;
  product_images: string[];
  detail_images: string[];
  category: string;
  created_at?: string;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientProductDetail slug={slug} />;
}
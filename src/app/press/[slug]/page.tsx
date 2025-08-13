import type { Metadata } from 'next';
import { dbConnect } from '@/lib/db';
import PressRelease from '@/models/PressRelease';
import ClientPressDetail from './ClientPressDetail';

// SSR 메타데이터 생성 (OG/Twitter/Canonical)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    await dbConnect();
    const press: any = await PressRelease.findOne({ slug, is_active: true })
      .select('slug press_name thumbnail content created_at last_updated')
      .lean();

    if (!press) {
      return {
        title: 'Press Not Found - SONAVERSE',
        description: 'The requested press article could not be found.'
      };
    }

    const ko = press.content?.ko || {};
    const bodyHtml: string = ko.body || '';
    const titleText: string = ko.title || '언론보도';

    // 본문 첫 이미지 -> 썸네일 -> 기본 로고 순으로 이미지 선택
    const firstImg = (() => {
      const match = bodyHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (match?.[1]) return match[1];
      if (press.thumbnail) return press.thumbnail;
      return '/logo/symbol_logo.png';
    })();

    const pageUrl = `https://sonaverse.kr/press/${slug}`;
    const description = (bodyHtml.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || titleText).slice(0, 160);

    return {
      title: `${titleText} - 언론보도 | SONAVERSE`,
      description,
      openGraph: {
        title: `${titleText} - 언론보도 | SONAVERSE`,
        description,
        url: pageUrl,
        siteName: 'SONAVERSE',
        type: 'article',
        images: [{ url: firstImg, width: 1200, height: 630, alt: titleText }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${titleText} - 언론보도 | SONAVERSE`,
        description,
        images: [firstImg],
      },
      alternates: { canonical: pageUrl },
    };
  } catch {
    return {
      title: 'Press - SONAVERSE',
      description: 'SONAVERSE press coverage.',
      alternates: { canonical: `https://sonaverse.kr/press/${slug}` },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientPressDetail slug={slug} />;
}
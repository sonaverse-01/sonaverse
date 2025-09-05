import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dbConnect } from '@/lib/db';
import SonaverseStory, { ISonaverseStory, ISonaverseStoryContent } from '@/models/SonaverseStory';
import ClientStoryDetail from './ClientStoryDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getSonaverseStory(slug: string): Promise<ISonaverseStory | null> {
  try {
    await dbConnect();
    const story = await SonaverseStory.findOne({ 
      slug, 
      is_published: true 
    }).lean() as any;
    
    if (!story) return null;
    
    // 기존 다국어 구조에서 단일 구조로 변환
    let content = story.content || {};
    if (content.ko) {
      // 기존 다국어 구조인 경우 한국어 콘텐츠 사용
      content = content.ko;
    }
    
    return {
      ...story,
      content: content
    } as ISonaverseStory;
  } catch (error) {
    console.error('Error fetching sonaverse story:', error);
    return null;
  }
}

export async function generateStaticParams() {
  await dbConnect();
  const stories = await SonaverseStory.find({ is_published: true }).select('slug').lean();
  
  return stories.map((story) => ({
    slug: story.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getSonaverseStory(slug);
  
  if (!story || !story.content) {
    return {
      title: 'Story Not Found - SONAVERSE',
      description: 'The requested sonaverse story could not be found.'
    };
  }

  // 한국어 콘텐츠 사용
  const content = story.content;
  
  return {
    title: `${content?.title || 'Story'} - SONAVERSE`,
    description: content?.subtitle || content?.title || 'SONAVERSE Story',
    keywords: ['소나버스 스토리', content?.title, '시니어 라이프', '헬스케어', 'SONAVERSE Story'].filter(Boolean),
    authors: [{ name: 'SONAVERSE' }],
    openGraph: {
      title: content?.title || 'Story',
      description: content?.subtitle || content?.title || 'SONAVERSE Story',
      url: `https://sonaverse.kr/sonaverse-story/${slug}`,
      siteName: 'SONAVERSE',
      type: 'article',
      publishedTime: story.created_at?.toString(),
      modifiedTime: story.updated_at?.toString(),
      images: [{
        url: (() => {
          // 본문 첫 이미지 -> 썸네일 -> 기본 로고 순으로 선택
          const bodyHtml = content?.body || '';
          const match = bodyHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
          if (match?.[1]) return match[1];
          if (content?.thumbnail_url) return content.thumbnail_url;
          return '/logo/symbol_logo.png';
        })(),
        width: 1200,
        height: 630,
        alt: content?.title || 'Story',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content?.title || 'Story',
      description: content?.subtitle || content?.title || 'SONAVERSE Story',
      images: [(() => {
        // 본문 첫 이미지 -> 썸네일 -> 기본 로고 순으로 선택
        const bodyHtml = content?.body || '';
        const match = bodyHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        if (match?.[1]) return match[1];
        if (content?.thumbnail_url) return content.thumbnail_url;
        return '/logo/symbol_logo.png';
      })()],
    },
    alternates: {
      canonical: `https://sonaverse.kr/sonaverse-story/${slug}`,
    },
  };
}

export default async function SonaverseStoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getSonaverseStory(slug);

  if (!story || !story.content) {
    notFound();
  }

  return <ClientStoryDetail slug={slug} />;
}
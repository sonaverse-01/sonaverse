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
    }).lean() as ISonaverseStory | null;
    
    return story;
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

  // Use Korean as default for SEO, but support both languages
  const koContent = story.content.ko;
  const enContent = story.content.en;
  
  return {
    title: `${koContent?.title || enContent?.title || 'Story'} - SONAVERSE`,
    description: koContent?.subtitle || koContent?.title || enContent?.subtitle || enContent?.title || 'SONAVERSE Story',
    keywords: ['소나버스 스토리', koContent?.title, '시니어 라이프', '헬스케어', 'SONAVERSE Story', enContent?.title].filter(Boolean),
    authors: [{ name: 'SONAVERSE' }],
    openGraph: {
      title: koContent?.title || enContent?.title || 'Story',
      description: koContent?.subtitle || koContent?.title || enContent?.subtitle || enContent?.title || 'SONAVERSE Story',
      url: `https://sonaverse.kr/sonaverse-story/${slug}`,
      siteName: 'SONAVERSE',
      type: 'article',
      publishedTime: story.created_at?.toString(),
      modifiedTime: story.updated_at?.toString(),
      images: [{
        url: (() => {
          // 본문 첫 이미지 -> 썸네일 -> 기본 로고 순으로 선택
          const koBody = koContent?.body || '';
          const enBody = enContent?.body || '';
          const bodyHtml = koBody || enBody;
          const match = bodyHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
          if (match?.[1]) return match[1];
          if (koContent?.thumbnail_url || enContent?.thumbnail_url) return koContent?.thumbnail_url || enContent?.thumbnail_url || '';
          return '/logo/symbol_logo.png';
        })(),
        width: 1200,
        height: 630,
        alt: koContent?.title || enContent?.title || 'Story',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: koContent?.title || enContent?.title || 'Story',
      description: koContent?.subtitle || koContent?.title || enContent?.subtitle || enContent?.title || 'SONAVERSE Story',
      images: [(() => {
        // 본문 첫 이미지 -> 썸네일 -> 기본 로고 순으로 선택
        const koBody = koContent?.body || '';
        const enBody = enContent?.body || '';
        const bodyHtml = koBody || enBody;
        const match = bodyHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        if (match?.[1]) return match[1];
        if (koContent?.thumbnail_url || enContent?.thumbnail_url) return koContent?.thumbnail_url || enContent?.thumbnail_url || '';
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

  // Ensure both language versions exist in content
  if (!story.content.ko && !story.content.en) {
    notFound();
  }

  return <ClientStoryDetail slug={slug} />;
}
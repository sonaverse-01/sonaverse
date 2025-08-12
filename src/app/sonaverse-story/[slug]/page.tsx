import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RecommendedPosts from '@/components/RecommendedPosts';
import { dbConnect } from '@/lib/db';
import SonaverseStory, { ISonaverseStory, ISonaverseStoryContent } from '@/models/SonaverseStory';

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
  
  if (!story || !story.content?.ko) {
    return {
      title: 'Story Not Found - SONAVERSE',
      description: 'The requested sonaverse story could not be found.'
    };
  }

  const koContent = story.content.ko;
  
  return {
    title: `${koContent.title || 'Story'} - SONAVERSE`,
    description: koContent.subtitle || koContent.title || 'SONAVERSE Story',
    keywords: ['소나버스 스토리', koContent.title, '시니어 라이프', '헬스케어'],
    authors: [{ name: 'SONAVERSE' }],
    openGraph: {
      title: koContent.title || 'Story',
      description: koContent.subtitle || koContent.title || 'SONAVERSE Story',
      url: `https://sonaverse.com/sonaverse-story/${slug}`,
      siteName: 'SONAVERSE',
      type: 'article',
      publishedTime: story.created_at?.toString(),
      modifiedTime: story.updated_at?.toString(),
      images: koContent.thumbnail_url ? [{
        url: koContent.thumbnail_url,
        width: 1200,
        height: 630,
        alt: koContent.title || 'Story',
      }] : [{
        url: 'https://sonaverse.com/logo/symbol_logo.png',
        width: 1200,
        height: 630,
        alt: 'SONAVERSE',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: koContent.title || 'Story',
      description: koContent.subtitle || koContent.title || 'SONAVERSE Story',
      images: koContent.thumbnail_url ? [koContent.thumbnail_url] : ['https://sonaverse.com/logo/symbol_logo.png'],
    },
    alternates: {
      canonical: `https://sonaverse.com/sonaverse-story/${slug}`,
    },
  };
}

export default async function SonaverseStoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getSonaverseStory(slug);

  if (!story || !story.content?.ko) {
    notFound();
  }

  const koContent = story.content.ko;

  // YouTube URL을 embed URL로 변환 (자동재생 포함)
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // 이미 embed URL인 경우
    if (url.includes('/embed/')) {
      // 자동재생 파라미터 추가
      const separator = url.includes('?') ? '&' : '?';
      return url.includes('autoplay') ? url : `${url}${separator}autoplay=1&mute=1`;
    }
    
    // 일반 YouTube URL을 embed URL로 변환
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1`;
    }
    
    return url;
  };

  const embedUrl = story.youtube_url ? getYouTubeEmbedUrl(story.youtube_url) : '';

  // HTML 콘텐츠에서 불필요한 태그들 제거
  const cleanHtmlContent = (html: string) => {
    if (!html) return '';
    
    // 헤더, 푸터, nav 등의 전체 구조 태그들 제거
    return html
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .replace(/<main[^>]*>/gi, '')
      .replace(/<\/main>/gi, '')
      .trim();
  };

  const cleanedContent = cleanHtmlContent(koContent.body || '');

  // JSON-LD 구조화된 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: koContent.title || 'Story',
    description: koContent.subtitle || koContent.title || 'SONAVERSE Story',
    image: koContent.thumbnail_url || 'https://sonaverse.com/logo/symbol_logo.png',
    datePublished: story.created_at?.toString(),
    dateModified: story.updated_at?.toString(),
    author: {
      '@type': 'Organization',
      name: 'SONAVERSE',
      url: 'https://sonaverse.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SONAVERSE',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sonaverse.com/logo/symbol_logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sonaverse.com/sonaverse-story/${story.slug}`
    },
    url: `https://sonaverse.com/sonaverse-story/${story.slug}`,
    keywords: ['소나버스', '시니어 케어', '헬스케어', koContent.title].join(', '),
    articleBody: koContent.body?.replace(/<[^>]*>/g, '') || ''
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 제목 섹션 */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {koContent.title || 'Story'}
          </h1>
          {koContent.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {koContent.subtitle}
            </p>
          )}
          <div className="text-sm text-gray-500">
            <time dateTime={story.created_at ? new Date(story.created_at).toISOString() : new Date().toISOString()}>
              {new Date(story.created_at || new Date()).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        {/* YouTube 영상 */}
        {embedUrl && (
          <div className="mb-8">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={embedUrl}
                title={koContent.title || 'Story'}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}


        {/* 본문 */}
        <main>
          <article className="prose prose-lg max-w-none mb-12" itemScope itemType="https://schema.org/BlogPosting">
            <div 
              dangerouslySetInnerHTML={{ __html: cleanedContent }}
              className="text-gray-800 leading-relaxed"
            />
          </article>
        </main>

        {/* 추천 포스트 */}
        <RecommendedPosts currentSlug={story.slug || ''} />
      </div>
    </>
  );
}
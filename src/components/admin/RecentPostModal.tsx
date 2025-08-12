'use client';

import React, { useState, useEffect } from 'react';

interface IBlogPostImage {
  src: string;
  alt: string;
  alignment: 'left' | 'center' | 'right' | 'full';
  displaysize: number;
  originalWidth: number;
  originalHeight: number;
  uploadAt: Date;
}

interface RecentPost {
  type: string;
  title: string;
  slug: string;
  created_at: string;
  content?: {
    ko: { title: string; subtitle: string; body: string; thumbnail_url: string; images: IBlogPostImage[] };
    en: { title: string; subtitle: string; body: string; thumbnail_url: string; images: IBlogPostImage[] };
  };
}

interface RecentPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: RecentPost | null;
}

const RecentPostModal: React.FC<RecentPostModalProps> = ({ isOpen, onClose, post }) => {
  const [currentLanguage, setCurrentLanguage] = useState<'ko' | 'en'>('ko');
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 게시물 데이터 가져오기
  useEffect(() => {
    if (isOpen && post) {
      fetchPostData();
    }
  }, [isOpen, post]);

  const fetchPostData = async () => {
    if (!post) return;
    
    setLoading(true);
    try {
      let endpoint = '';
      switch (post.type) {
        case 'blog':
          endpoint = `/api/blog/${post.slug}`;
          break;
        case 'press':
          endpoint = `/api/press/${post.slug}`;
          break;
        case 'sonaverse-story':
          endpoint = `/api/sonaverse-story/${post.slug}`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        
        // 게시물 타입별로 데이터 구조 정규화
        let normalizedData;
        
        switch (post.type) {
          case 'blog':
            // 블로그는 이미 올바른 구조
            normalizedData = data;
            break;
            
          case 'press':
            // 언론보도 데이터 구조 정규화
            normalizedData = {
              slug: data.slug,
              content: {
                ko: {
                  title: data.title,
                  subtitle: data.press_name,
                  body: data.body || '',
                  thumbnail_url: '',
                  images: []
                },
                en: {
                  title: data.title,
                  subtitle: data.press_name,
                  body: data.body || '',
                  thumbnail_url: '',
                  images: []
                }
              },
              tags: '',
              external_link: data.external_link
            };
            break;
            
          case 'sonaverse-story':
            // 소나버스 스토리 데이터 구조 정규화
            const sonaverseStoryData = data.sonaverseStory || data;
            normalizedData = {
              slug: sonaverseStoryData.slug,
              content: {
                ko: {
                  title: sonaverseStoryData.content?.ko?.title || '',
                  subtitle: sonaverseStoryData.content?.ko?.subtitle || '',
                  body: sonaverseStoryData.content?.ko?.body || '',
                  thumbnail_url: sonaverseStoryData.content?.ko?.thumbnail_url || '',
                  images: sonaverseStoryData.content?.ko?.images || []
                },
                en: {
                  title: sonaverseStoryData.content?.en?.title || '',
                  subtitle: sonaverseStoryData.content?.en?.subtitle || '',
                  body: sonaverseStoryData.content?.en?.body || '',
                  thumbnail_url: sonaverseStoryData.content?.en?.thumbnail_url || '',
                  images: sonaverseStoryData.content?.en?.images || []
                }
              },
              tags: sonaverseStoryData.tags?.join(', ') || '',
              youtube_url: sonaverseStoryData.youtube_url
            };
            break;
            
          default:
            normalizedData = data;
        }
        
        setPostData(normalizedData);
      } else {
        console.error('API 응답 오류:', response.status);
      }
    } catch (error) {
      console.error('게시물 데이터를 가져오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  // 태그 문자열을 배열로 변환
  const parseTagsToArray = (tagsString: string): string[] => {
    if (!tagsString) return [];
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // 이미지 메타데이터를 DOM에 적용하는 함수
  const applyImageMetadata = (content: { body: string; images: IBlogPostImage[] }) => {
    if (!content.images || content.images.length === 0) return content.body;

    // DOM 파서로 HTML 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(content.body, 'text/html');
    const images = doc.querySelectorAll('img');

    images.forEach((img) => {
      // 이미지 메타데이터 찾기
      const metadata = content.images?.find(meta => {
        return meta.src === img.src || img.src.includes(meta.src.split('/').pop() || '');
      });

      if (metadata) {
        // 이미지 크기 적용
        img.style.width = `${metadata.displaysize}%`;
        img.style.height = 'auto';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';

        // 정렬 스타일 적용
        if (metadata.alignment === 'left') {
          img.style.float = 'left';
          img.style.margin = '0 16px 12px 0';
          img.style.clear = 'left';
        } else if (metadata.alignment === 'right') {
          img.style.float = 'right';
          img.style.margin = '0 0 12px 16px';
          img.style.clear = 'right';
        } else {
          img.style.float = 'none';
          img.style.margin = '12px auto';
          img.style.display = 'block';
          img.style.clear = 'both';
        }
      }
    });

    return doc.body.innerHTML;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sonaverse-story':
        return '소나버스 스토리';
      case 'press':
        return '언론보도';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sonaverse-story':
        return 'bg-purple-100 text-purple-800';
      case 'press':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !post) return null;

  const currentDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* 모달 컨테이너 */}
        <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(post.type)}`}>
                {getTypeLabel(post.type)}
              </span>
              <h2 className="text-2xl font-bold text-gray-900">게시물 미리보기</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* 모달 콘텐츠 */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">게시물을 불러오는 중...</span>
              </div>
            ) : postData ? (
              <>
                {/* 언어 선택 탭 */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button 
                        onClick={() => setCurrentLanguage('ko')}
                        className={`py-2 px-1 text-sm font-medium ${
                          currentLanguage === 'ko' 
                            ? 'border-b-2 border-blue-500 text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        한국어
                      </button>
                      <button 
                        onClick={() => setCurrentLanguage('en')}
                        className={`py-2 px-1 text-sm font-medium ${
                          currentLanguage === 'en' 
                            ? 'border-b-2 border-blue-500 text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        English
                      </button>
                    </nav>
                  </div>
                </div>

                {/* 미리보기 내용 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 썸네일 카드 미리보기 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">썸네일 카드 (목록 페이지)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow max-w-sm mx-auto">
                        {/* 썸네일 이미지 */}
                        {postData.content?.[currentLanguage]?.thumbnail_url ? (
                          <div className="aspect-video bg-gray-200">
                            <img
                              src={postData.content[currentLanguage].thumbnail_url}
                              alt={postData.content[currentLanguage].title || '제목을 입력하세요'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">썸네일 이미지 없음</span>
                          </div>
                        )}
                        
                        {/* 카드 콘텐츠 */}
                        <div className="p-4">
                          {/* 소나버스 스토리 유튜브 표시 */}
                          {post.type === 'sonaverse-story' && postData.youtube_url && (
                            <div className="mb-3">
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                YouTube
                              </span>
                            </div>
                          )}
                          
                          {/* 언론보도 외부 링크 표시 */}
                          {post.type === 'press' && postData.external_link && (
                            <div className="mb-3">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                외부 링크
                              </span>
                            </div>
                          )}
                          
                          {/* 제목 */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {postData.content?.[currentLanguage]?.title || '제목을 입력하세요'}
                          </h3>
                          
                          {/* 부제목 */}
                          <p className="text-gray-600 text-sm mb-3" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {postData.content?.[currentLanguage]?.subtitle || '부제목을 입력하세요'}
                          </p>
                          
                          {/* 날짜 */}
                          <p className="text-gray-500 text-xs">
                            {currentDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상세 페이지 미리보기 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">상세 페이지 콘텐츠</h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <div className="bg-white rounded-lg p-6">
                        {/* 제목 */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {postData.content?.[currentLanguage]?.title || '제목을 입력하세요'}
                        </h1>
                        
                        {/* 부제목 */}
                        <p className="text-lg text-gray-600 mb-4">
                          {postData.content?.[currentLanguage]?.subtitle || '부제목을 입력하세요'}
                        </p>
                        
                        {/* 메타 정보 */}
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                          <span className="text-sm text-gray-500">{currentDate}</span>
                          {postData.tags && parseTagsToArray(postData.tags).length > 0 && (
                            <div className="flex gap-2">
                              {parseTagsToArray(postData.tags).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* 소나버스 스토리 유튜브 링크 */}
                        {post.type === 'sonaverse-story' && postData.youtube_url && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">YouTube 링크</h4>
                            <a 
                              href={postData.youtube_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {postData.youtube_url}
                            </a>
                          </div>
                        )}
                        
                        {/* 언론보도 외부 링크 */}
                        {post.type === 'press' && postData.external_link && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">외부 링크</h4>
                            <a 
                              href={postData.external_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {postData.external_link}
                            </a>
                          </div>
                        )}
                        
                        {/* 썸네일 이미지 */}
                        {postData.content?.[currentLanguage]?.thumbnail_url && (
                          <div className="mb-6">
                            <img
                              src={postData.content[currentLanguage].thumbnail_url}
                              alt={postData.content[currentLanguage].title || '제목을 입력하세요'}
                              className="w-full rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* 본문 내용 */}
                        {postData.content?.[currentLanguage]?.body ? (
                          <div 
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: applyImageMetadata(postData.content[currentLanguage]) 
                            }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">본문 내용을 입력하세요...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">게시물을 불러올 수 없습니다.</p>
              </div>
            )}

            {/* 모달 푸터 */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
              <a
                href={`/admin/${post.type === 'press' ? 'press' : 'sonaverse-story'}/${post.slug}/edit`}
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors font-medium"
              >
                수정하기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentPostModal; 
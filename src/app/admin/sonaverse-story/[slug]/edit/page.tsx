'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor, { TiptapEditorRef } from '@/components/admin/TiptapEditor';
import FloatingToolbar from '@/components/admin/FloatingToolbar';
import ImageUpload from '@/components/admin/ImageUpload';
import SonaverseStoryPreviewModal from '@/components/admin/SonaverseStoryPreviewModal';
import { useToast } from '@/components/Toast';

interface IBlogPostImage {
  src: string;
  alt: string;
  alignment: 'left' | 'center' | 'right' | 'full';
  displaysize: number;
  originalWidth: number;
  originalHeight: number;
  uploadAt: Date;
  file?: File;
}

interface EditSonaverseStoryPageProps {
  params: Promise<{ slug: string }>;
}

const EditSonaverseStoryPage: React.FC<EditSonaverseStoryPageProps> = ({ params }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');
  const [formData, setFormData] = useState({
    slug: '',
    content: {
      ko: { title: '', subtitle: '', body: '', images: [] as IBlogPostImage[] },
      en: { title: '', subtitle: '', body: '', images: [] as IBlogPostImage[] }
    },
    thumbnail_url: '', // 통합 썸네일
    youtube_url: '',
    category: '', // 카테고리 추가
    tags: {
      ko: '',
      en: ''
    },
    created_at: '',
    is_main: false,
    is_published: true
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  // 에디터 ref 추가
  const koEditorRef = useRef<TiptapEditorRef>(null);
  const enEditorRef = useRef<TiptapEditorRef>(null);
  
  // 현재 활성 에디터 추적
  const [activeEditor, setActiveEditor] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchSonaverseStory();
    }
  }, [slug]);

  const fetchSonaverseStory = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/sonaverse-story/${slug}?admin=true`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('소나버스 스토리를 불러올 수 없습니다.');
      }

      const data = await response.json();
      
      setFormData({
        slug: data.slug,
        content: {
          ko: {
            title: data.content?.ko?.title || '',
            subtitle: data.content?.ko?.subtitle || '',
            body: data.content?.ko?.body || '',
            images: data.content?.ko?.images || []
          },
          en: {
            title: data.content?.en?.title || '',
            subtitle: data.content?.en?.subtitle || '',
            body: data.content?.en?.body || '',
            images: data.content?.en?.images || []
          }
        },
        thumbnail_url: data.thumbnail_url || '',
        youtube_url: data.youtube_url || '',
        category: data.category || '',
        tags: {
          ko: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          en: Array.isArray(data.tags) ? data.tags.join(', ') : ''
        },
        created_at: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '',
        is_main: data.is_main || false,
        is_published: data.is_published !== false
      });
      
      // 썸네일 미리보기 설정
      if (data.thumbnail_url) {
        setThumbnailPreview(data.thumbnail_url);
      }
    } catch (error) {
      console.error('소나버스 스토리 불러오기 실패:', error);
      addToast({
        type: 'error',
        message: '소나버스 스토리를 불러오는데 실패했습니다.'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, child: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, any>),
        [child]: value
      }
    }));
  };

  const handleContentChange = (lang: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: {
          ...prev.content[lang as keyof typeof prev.content],
          [field]: value
        }
      }
    }));
  };

  // 이미지 메타데이터 변경 핸들러
  const handleImagesChange = (lang: string, images: IBlogPostImage[]) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: {
          ...prev.content[lang as keyof typeof prev.content],
          images
        }
      }
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (): Promise<string> => {
    if (!thumbnailFile) return formData.thumbnail_url;

    const uploadFormData = new FormData();
    uploadFormData.append('file', thumbnailFile);
    uploadFormData.append('folder', `sonaverseStory/${formData.slug}`);
    uploadFormData.append('filename', `${formData.slug}_thumbnail`);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error('썸네일 업로드 실패');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const thumbnailUrl = await uploadThumbnail();

      // 에디터의 임시 이미지들을 실제 blob에 업로드
      const updatedKoBody = await koEditorRef.current?.uploadTempImagesToBlob(formData.slug, 'ko') || formData.content.ko.body;
      const updatedEnBody = await enEditorRef.current?.uploadTempImagesToBlob(formData.slug, 'en') || formData.content.en.body;

      // 태그 파싱
      const koTags = formData.tags.ko
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      const enTags = formData.tags.en
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const allTags = [...new Set([...koTags, ...enTags])];

      // 작성일자 처리 - 공란이면 현재 날짜로 설정
      const createdAt = formData.created_at || new Date().toISOString();

      const payload = {
        content: {
          ko: {
            ...formData.content.ko,
            body: updatedKoBody
          },
          en: {
            ...formData.content.en,
            body: updatedEnBody
          }
        },
        thumbnail_url: thumbnailUrl,
        youtube_url: formData.youtube_url,
        category: formData.category,
        tags: allTags,
        created_at: createdAt,
        is_main: formData.is_main,
        is_published: formData.is_published
      };

      const response = await fetch(`/api/sonaverse-story/${formData.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('소나버스 스토리 수정 실패');
      }

      addToast({
        type: 'success',
        message: '소나버스 스토리가 성공적으로 수정되었습니다.'
      });
      
      // 약간의 지연 후 리다이렉트 (토스터가 보이도록)
      setTimeout(() => {
        router.push('/admin/sonaverse-story');
      }, 1000);
    } catch (error) {
      console.error('[소나버스 스토리 수정 전체 에러]', error);
      addToast({
        type: 'error',
        message: '소나버스 스토리 수정 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">소나버스 스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">소나버스 스토리 수정</h1>
          <Link
            href="/admin/sonaverse-story"
            className="px-3 sm:px-4 py-2 text-white rounded-lg transition-colors w-full sm:w-auto text-center text-sm sm:text-base"
            style={{ backgroundColor: '#bda191' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a08874'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bda191'}
          >
            ← 목록으로 돌아가기
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">기본 정보</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  슬러그 (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  disabled
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">슬러그는 수정할 수 없습니다.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 (쉼표로 구분)
                </label>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      한국어 태그
                    </label>
                    <input
                      type="text"
                      value={formData.tags.ko}
                      onChange={(e) => handleNestedInputChange('tags', 'ko', e.target.value)}
                      placeholder="예: 소나버스, 스토리, 혁신"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      영어 태그 (선택사항)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.en}
                      onChange={(e) => handleNestedInputChange('tags', 'en', e.target.value)}
                      placeholder="e.g. sonaverse, story, innovation (선택사항)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작성일자
              </label>
              <input
                type="date"
                value={formData.created_at}
                onChange={(e) => handleInputChange('created_at', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">공란으로 두면 현재 날짜로 자동 설정됩니다.</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">카테고리 선택</option>
                <option value="제품스토리">제품스토리</option>
                <option value="사용법">사용법</option>
                <option value="건강정보">건강정보</option>
                <option value="복지정보">복지정보</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="is_main"
                checked={formData.is_main}
                onChange={(e) => handleInputChange('is_main', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="is_main" className="ml-2 text-sm font-medium text-gray-700">
                메인 게시물로 설정 (메인 페이지 및 대형 카드에 표시)
              </label>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                * 메인 게시물로 설정하면 기존 메인 게시물은 자동으로 해제됩니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">썸네일 이미지</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 업로드
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">미리보기:</p>
                    <img 
                      src={thumbnailPreview} 
                      alt="썸네일 미리보기" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    {thumbnailFile && (
                      <p className="text-xs text-orange-600 mt-1">※ 임시 이미지입니다. 수정 버튼 클릭 시 실제 업로드됩니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 한국어 콘텐츠 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">한국어 콘텐츠</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.content.ko.title}
                  onChange={(e) => handleContentChange('ko', 'title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부제목
                </label>
                <input
                  type="text"
                  value={formData.content.ko.subtitle}
                  onChange={(e) => handleContentChange('ko', 'subtitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문 *
                </label>
                <TiptapEditor
                  ref={koEditorRef}
                  value={formData.content.ko.body}
                  onChange={(value: string) => handleContentChange('ko', 'body', value)}
                  slug={formData.slug}
                  folder={formData.slug ? `sonaverseStory/${formData.slug}` : "sonaverseStory"}
                  placeholder="한국어 본문을 입력하세요..."
                  images={formData.content.ko.images}
                  onImagesChange={(images) => handleImagesChange('ko', images)}
                  onEditorFocus={() => setActiveEditor(koEditorRef.current?.getEditor())}
                />
              </div>
            </div>
          </div>

          {/* 영어 콘텐츠 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">영어 콘텐츠</h2>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 안내:</strong> 영어 콘텐츠는 선택사항입니다. 영어 콘텐츠가 없을 경우 사용자 화면에서는 한국어 버전이 표시됩니다.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 (선택사항)
                </label>
                <input
                  type="text"
                  value={formData.content.en.title}
                  onChange={(e) => handleContentChange('en', 'title', e.target.value)}
                  placeholder="영어 제목을 입력하세요 (선택사항)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부제목 (선택사항)
                </label>
                <input
                  type="text"
                  value={formData.content.en.subtitle}
                  onChange={(e) => handleContentChange('en', 'subtitle', e.target.value)}
                  placeholder="영어 부제목을 입력하세요 (선택사항)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문 (선택사항)
                </label>
                <TiptapEditor
                  ref={enEditorRef}
                  value={formData.content.en.body}
                  onChange={(value: string) => handleContentChange('en', 'body', value)}
                  slug={formData.slug}
                  folder={formData.slug ? `sonaverseStory/${formData.slug}` : "sonaverseStory"}
                  placeholder="영어 본문을 입력하세요 (선택사항)..."
                  images={formData.content.en.images}
                  onImagesChange={(images) => handleImagesChange('en', images)}
                  onEditorFocus={() => setActiveEditor(enEditorRef.current?.getEditor())}
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end items-center">
            <div className="flex space-x-4">
              <Link
                href="/admin/sonaverse-story"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (!formData.slug) {
                    addToast({ type: 'error', message: '슬러그를 확인해주세요.' });
                    return;
                  }
                  setShowPreview(true);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                미리보기
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </div>
        </form>

        {/* 미리보기 모달 */}
        <SonaverseStoryPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          formData={formData}
        />

        {/* 플로팅 툴바 */}
        {activeEditor && (
          <FloatingToolbar 
            editor={activeEditor}
            tiptapRef={activeEditor === koEditorRef.current?.getEditor() ? koEditorRef : enEditorRef}
            onClose={() => setActiveEditor(null)}
          />
        )}
      </div>
    </div>
  );
};

export default EditSonaverseStoryPage;
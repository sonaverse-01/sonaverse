'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor, { TiptapEditorRef } from '@/components/admin/TiptapEditor';
import FloatingToolbar from '@/components/admin/FloatingToolbar';
import SlugChecker from '@/components/admin/SlugChecker';
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

const NewSonaverseStoryPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
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
    created_at: '', // 작성일자 추가
    is_main: false, // 메인 게시물 여부
    is_published: true
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [showPreview, setShowPreview] = useState(false);
  const [hasSlugConflict, setHasSlugConflict] = useState(false);
  const [isSlugValidated, setIsSlugValidated] = useState(false);
  
  // 에디터 ref 추가
  const koEditorRef = useRef<TiptapEditorRef>(null);
  const enEditorRef = useRef<TiptapEditorRef>(null);
  
  // 현재 활성 에디터 추적
  const [activeEditor, setActiveEditor] = useState<any>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 영문, 하이픈, 숫자만 허용
    const sanitizedValue = value.replace(/[^a-zA-Z0-9-]/g, '');
    handleInputChange('slug', sanitizedValue);
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

  const handleNestedInputChange = (parent: string, child: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, any>),
        [child]: value
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
    if (!thumbnailFile) return '';

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
    
    if (!isSlugValidated) {
      addToast({
        type: 'error',
        message: '슬러그 중복 확인을 완료해주세요.'
      });
      return;
    }
    
    if (hasSlugConflict) {
      addToast({
        type: 'error',
        message: '슬러그가 중복됩니다. 다른 슬러그를 사용해주세요.'
      });
      return;
    }
    
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
        slug: formData.slug,
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

      const response = await fetch('/api/sonaverse-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('소나버스 스토리 생성 실패');
      }

      addToast({
        type: 'success',
        message: '소나버스 스토리가 성공적으로 생성되었습니다.'
      });
      
      // 약간의 지연 후 리다이렉트 (토스터가 보이도록)
      setTimeout(() => {
        router.push('/admin/sonaverse-story');
      }, 1000);
    } catch (error) {
      console.error('[소나버스 스토리 생성 전체 에러]', error);
      addToast({
        type: 'error',
        message: '소나버스 스토리 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">새 소나버스 스토리 등록</h1>
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
                  슬러그 (URL) *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="예: sonaverse-story-2025"
                    className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                  <div className="flex-shrink-0">
                    <SlugChecker 
                      slug={formData.slug} 
                      onCheck={setHasSlugConflict}
                      onValidated={setIsSlugValidated}
                    />
                  </div>
                </div>
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
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      영어 태그
                    </label>
                    <input
                      type="text"
                      value={formData.tags.en}
                      onChange={(e) => handleNestedInputChange('tags', 'en', e.target.value)}
                      placeholder="e.g. sonaverse, story, innovation"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                작성일자
              </label>
              <input
                type="date"
                value={formData.created_at}
                onChange={(e) => handleInputChange('created_at', e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="공란 시 현재 날짜로 설정됩니다"
              />
              <p className="text-xs text-gray-500 mt-1">공란으로 두면 현재 날짜로 자동 설정됩니다.</p>
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
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">썸네일 이미지</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 업로드
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">미리보기:</p>
                    <img 
                      src={thumbnailPreview} 
                      alt="썸네일 미리보기" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <p className="text-xs text-orange-600 mt-1">※ 임시 이미지입니다. 생성 버튼 클릭 시 실제 업로드됩니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 한국어 콘텐츠 */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">한국어 콘텐츠</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.content.ko.title}
                  onChange={(e) => handleContentChange('ko', 'title', e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">영어 콘텐츠</h2>            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={formData.content.en.title}
                  onChange={(e) => handleContentChange('en', 'title', e.target.value)}
                  placeholder="영어 제목을 입력하세요"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부제목
                </label>
                <input
                  type="text"
                  value={formData.content.en.subtitle}
                  onChange={(e) => handleContentChange('en', 'subtitle', e.target.value)}
                  placeholder="영어 부제목을 입력하세요"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문
                </label>
                <TiptapEditor
                  ref={enEditorRef}
                  value={formData.content.en.body}
                  onChange={(value: string) => handleContentChange('en', 'body', value)}
                  slug={formData.slug}
                  folder={formData.slug ? `sonaverseStory/${formData.slug}` : "sonaverseStory"}
                  placeholder="영어 본문을 입력하세요..."
                  images={formData.content.en.images}
                  onImagesChange={(images) => handleImagesChange('en', images)}
                  onEditorFocus={() => setActiveEditor(enEditorRef.current?.getEditor())}
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-4">
            <Link
              href="/admin/sonaverse-story"
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm sm:text-base"
            >
              취소
            </Link>
            <button
              type="button"
              onClick={() => {
                if (!formData.slug) {
                  addToast({ type: 'error', message: '슬러그를 입력해주세요.' });
                  return;
                }
                setShowPreview(true);
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              미리보기
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
            >
              {loading ? '생성 중...' : '생성하기'}
            </button>
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

export default NewSonaverseStoryPage;
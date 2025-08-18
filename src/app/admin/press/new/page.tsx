'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor, { TiptapEditorRef } from '@/components/admin/TiptapEditor';
import PressPreviewModal from '@/components/admin/PressPreviewModalNew';
import FloatingToolbar from '@/components/admin/FloatingToolbar';
import SlugChecker from '@/components/admin/SlugChecker';
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

const NewPressPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    press_name: { ko: '', en: '' },
    external_link: '',
    content: {
      ko: { title: '', subtitle: '', body: '', thumbnail_url: '', images: [] as IBlogPostImage[] },
      en: { title: '', subtitle: '', body: '', thumbnail_url: '', images: [] as IBlogPostImage[] }
    },
    tags: { ko: '', en: '' },
    created_at: '',
    is_active: true
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [hasSlugConflict, setHasSlugConflict] = useState(false);
  const [isSlugValidated, setIsSlugValidated] = useState(false);
  
  const koEditorRef = useRef<TiptapEditorRef>(null);
  const enEditorRef = useRef<TiptapEditorRef>(null);
  const [activeEditor, setActiveEditor] = useState<any>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9-]/g, '');
    handleInputChange('slug', sanitizedValue);
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
    if (!thumbnailFile) return '';

    const uploadFormData = new FormData();
    uploadFormData.append('file', thumbnailFile);
    uploadFormData.append('folder', `press/${formData.slug}`);
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

      let updatedKoBody = formData.content.ko.body;
      let updatedEnBody = formData.content.en.body;

      if (formData.content.ko.images && formData.content.ko.images.length > 0) {
        let imageCounter = 1;
        for (const image of formData.content.ko.images) {
          if (image.file) {
            const imageFormData = new FormData();
            imageFormData.append('file', image.file);
            imageFormData.append('folder', `press/${formData.slug}/ko`);
            imageFormData.append('filename', `${formData.slug}_${imageCounter.toString().padStart(2, '0')}`);

            const imageResponse = await fetch('/api/upload', {
              method: 'POST',
              body: imageFormData,
            });

            imageCounter++;

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              updatedKoBody = updatedKoBody.replace(
                `src="${image.src}"`,
                `src="${imageData.url}"`
              );
            }
          }
        }
      }

      if (formData.content.en.images && formData.content.en.images.length > 0) {
        let imageCounter = 1;
        for (const image of formData.content.en.images) {
          if (image.file) {
            const imageFormData = new FormData();
            imageFormData.append('file', image.file);
            imageFormData.append('folder', `press/${formData.slug}/en`);
            imageFormData.append('filename', `${formData.slug}_${imageCounter.toString().padStart(2, '0')}`);

            const imageResponse = await fetch('/api/upload', {
              method: 'POST',
              body: imageFormData,
            });

            imageCounter++;

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              updatedEnBody = updatedEnBody.replace(
                `src="${image.src}"`,
                `src="${imageData.url}"`
              );
            }
          }
        }
      }

      const tags = {
        ko: formData.tags.ko
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        en: formData.tags.en
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      };

      const createdAt = formData.created_at || new Date().toISOString();

      const payload = {
        slug: formData.slug,
        press_name: formData.press_name,
        external_link: formData.external_link,
        content: {
          ko: {
            ...formData.content.ko,
            body: updatedKoBody,
            thumbnail_url: thumbnailUrl
          },
          en: {
            ...formData.content.en,
            body: updatedEnBody,
            thumbnail_url: thumbnailUrl
          }
        },
        tags,
        created_at: createdAt,
        is_active: formData.is_active
      };

      const response = await fetch('/api/press', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `언론보도 생성 실패 (${response.status})`);
      }

      addToast({
        type: 'success',
        message: '언론보도가 성공적으로 생성되었습니다.'
      });
      
      setTimeout(() => {
        router.push('/admin/press');
      }, 1000);
    } catch (error) {
      console.error('[언론보도 생성 전체 에러]', error);
      addToast({
        type: 'error',
        message: '언론보도 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">새 언론보도 등록</h1>
          <Link
            href="/admin/press"
            className="px-3 sm:px-4 py-2 text-white rounded-lg transition-colors w-full sm:w-auto text-center text-sm sm:text-base"
            style={{ backgroundColor: '#bda191' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a08874'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bda191'}
          >
            ← 목록으로 돌아가기
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                    placeholder="예: press-release-2025"
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
                      placeholder="예: 언론보도, 수상, 혁신"
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
                      placeholder="e.g. press, award, innovation"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">공란으로 두면 현재 날짜로 자동 설정됩니다.</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">언론사 정보</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  한국어 언론사명 *
                </label>
                <input
                  type="text"
                  value={formData.press_name.ko}
                  onChange={(e) => handleNestedInputChange('press_name', 'ko', e.target.value)}
                  placeholder="예: 전자신문"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English Press Name *
                </label>
                <input
                  type="text"
                  value={formData.press_name.en}
                  onChange={(e) => handleNestedInputChange('press_name', 'en', e.target.value)}
                  placeholder="예: ET News"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                외부 기사 링크
              </label>
              <input
                type="url"
                value={formData.external_link}
                onChange={(e) => handleInputChange('external_link', e.target.value)}
                placeholder="https://example.com/article"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
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
                  required
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
                  folder="press"
                  placeholder="한국어 본문을 입력하세요..."
                  images={formData.content.ko.images}
                  onImagesChange={(images) => handleImagesChange('ko', images)}
                  onEditorFocus={() => setActiveEditor(koEditorRef.current?.getEditor())}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">영어 콘텐츠</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.content.en.title}
                  onChange={(e) => handleContentChange('en', 'title', e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
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
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문 *
                </label>
                <TiptapEditor
                  ref={enEditorRef}
                  value={formData.content.en.body}
                  onChange={(value: string) => handleContentChange('en', 'body', value)}
                  slug={formData.slug}
                  folder="press"
                  placeholder="영어 본문을 입력하세요..."
                  images={formData.content.en.images}
                  onImagesChange={(images) => handleImagesChange('en', images)}
                  onEditorFocus={() => setActiveEditor(enEditorRef.current?.getEditor())}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-4">
            <Link
              href="/admin/press"
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

        {showPreview && (
          <PressPreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            formData={formData}
          />
        )}

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

export default NewPressPage;
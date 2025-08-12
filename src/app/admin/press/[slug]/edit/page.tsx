'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor, { TiptapEditorRef } from '@/components/admin/TiptapEditor';
import PressPreviewModal from '@/components/admin/PressPreviewModalNew';
import FloatingToolbar from '@/components/admin/FloatingToolbar';
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

interface PressFormData {
  slug: string;
  press_name: {
    ko: string;
    en: string;
  };
  external_link: string;
  content: {
    ko: {
      title: string;
      subtitle: string;
      body: string;
      thumbnail_url: string;
      images: IBlogPostImage[];
    };
    en: {
      title: string;
      subtitle: string;
      body: string;
      thumbnail_url: string;
      images: IBlogPostImage[];
    };
  };
  tags: {
    ko: string;
    en: string;
  };
  created_at: string;
  is_active: boolean;
}

const EditPressPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<PressFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  // 에디터 ref 추가
  const koEditorRef = useRef<TiptapEditorRef>(null);
  const enEditorRef = useRef<TiptapEditorRef>(null);
  
  // 현재 활성 에디터 추적
  const [activeEditor, setActiveEditor] = useState<any>(null);

  useEffect(() => {
    fetchPress();
  }, [slug]);

  const fetchPress = async () => {
    try {
      const response = await fetch(`/api/press/${slug}?admin=true`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('언론보도를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      
      setFormData({
        slug: data.slug,
        press_name: {
          ko: data.press_name?.ko || '',
          en: data.press_name?.en || ''
        },
        external_link: data.external_link || '',
        content: {
          ko: {
            title: data.content?.ko?.title || '',
            subtitle: data.content?.ko?.subtitle || '',
            body: data.content?.ko?.body || '',
            thumbnail_url: data.content?.ko?.thumbnail_url || '',
            images: data.content?.ko?.images || []
          },
          en: {
            title: data.content?.en?.title || '',
            subtitle: data.content?.en?.subtitle || '',
            body: data.content?.en?.body || '',
            thumbnail_url: data.content?.en?.thumbnail_url || '',
            images: data.content?.en?.images || []
          }
        },
        tags: {
          ko: Array.isArray(data.tags?.ko) ? data.tags.ko.join(', ') : (data.tags?.ko || ''),
          en: Array.isArray(data.tags?.en) ? data.tags.en.join(', ') : (data.tags?.en || '')
        },
        created_at: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        is_active: data.is_active !== undefined ? data.is_active : true
      });
      
      // 썸네일 미리보기 설정
      if (data.content?.ko?.thumbnail_url) {
        setThumbnailPreview(data.content.ko.thumbnail_url);
      }
    } catch (error) {
      console.error('Error fetching press:', error);
      addToast({
        type: 'error',
        message: '언론보도를 불러오는데 실패했습니다.'
      });
      router.push('/admin/press');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleNestedInputChange = (parent: string, child: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [parent]: {
        ...(formData[parent as keyof typeof formData] as Record<string, any>),
        [child]: value
      }
    });
  };

  const handleContentChange = (lang: string, field: string, value: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [lang]: {
          ...formData.content[lang as keyof typeof formData.content],
          [field]: value
        }
      }
    });
  };

  const handleImagesChange = (lang: string, images: IBlogPostImage[]) => {
    if (!formData) return;
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [lang]: {
          ...formData.content[lang as keyof typeof formData.content],
          images
        }
      }
    });
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
    if (!thumbnailFile) return formData?.content.ko.thumbnail_url || '';

    const uploadFormData = new FormData();
    uploadFormData.append('file', thumbnailFile);
    uploadFormData.append('folder', `press/${formData?.slug}`);

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
    if (!formData) return;

    setLoading(true);

    try {
      const thumbnailUrl = await uploadThumbnail();

      let updatedKoBody = formData.content.ko.body;
      let updatedEnBody = formData.content.en.body;

      if (formData.content.ko.images && formData.content.ko.images.length > 0) {
        for (const image of formData.content.ko.images) {
          if (image.file) {
            const imageFormData = new FormData();
            imageFormData.append('file', image.file);
            imageFormData.append('folder', `press/${formData.slug}/ko`);

            const imageResponse = await fetch('/api/upload', {
              method: 'POST',
              body: imageFormData,
            });

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
        for (const image of formData.content.en.images) {
          if (image.file) {
            const imageFormData = new FormData();
            imageFormData.append('file', image.file);
            imageFormData.append('folder', `press/${formData.slug}/en`);

            const imageResponse = await fetch('/api/upload', {
              method: 'POST',
              body: imageFormData,
            });

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
        created_at: formData.created_at,
        is_active: formData.is_active
      };

      const response = await fetch(`/api/press/${formData.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();

      if (!response.ok) {
        addToast({
          type: 'error',
          message: result.error || '언론보도 수정에 실패했습니다.'
        });
        setLoading(false);
        return;
      }

      addToast({
        type: 'success',
        message: '언론보도가 성공적으로 수정되었습니다!'
      });
      
      // 약간의 지연 후 리다이렉트 (토스터가 보이도록)
      setTimeout(() => {
        router.push('/admin/press');
      }, 1000);
      
    } catch (error) {
      console.error('[언론보도 수정 전체 에러]', error);
      addToast({
        type: 'error',
        message: '언론보도 수정 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">언론보도를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">언론보도 수정</h1>
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
                <input
                  type="text"
                  value={formData.slug}
                  disabled
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  슬러그는 수정할 수 없습니다.
                </p>
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
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">활성화</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">언론사 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  한국어 언론사명 *
                </label>
                <input
                  type="text"
                  value={formData.press_name.ko}
                  onChange={(e) => handleNestedInputChange('press_name', 'ko', e.target.value)}
                  placeholder="예: 전자신문"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                  folder="press"
                  placeholder="한국어 본문을 입력하세요..."
                  images={formData.content.ko.images}
                  onImagesChange={(images) => handleImagesChange('ko', images)}
                  onEditorFocus={() => setActiveEditor(koEditorRef.current?.getEditor())}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">영어 콘텐츠</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.content.en.title}
                  onChange={(e) => handleContentChange('en', 'title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                if (!formData?.slug) {
                  addToast({ type: 'error', message: '슬러그를 확인해주세요.' });
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
              {loading ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>

        {showPreview && (
          <PressPreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            formData={formData}
            thumbnailPreview={thumbnailPreview}
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

export default EditPressPage; 
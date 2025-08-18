'use client';

import React, { useCallback, useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import FloatingToolbar from './FloatingToolbar';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontSize from './FontSize';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Node, Extension } from '@tiptap/core';
// import BulletList from '@tiptap/extension-bullet-list';
// import OrderedList from '@tiptap/extension-ordered-list';
// import ListItem from '@tiptap/extension-list-item';

interface IBlogPostImage {
  src: string;
  alt: string;
  alignment: 'left' | 'center' | 'right' | 'full';
  displaysize: number;
  originalWidth: number;
  originalHeight: number;
  uploadAt: Date;
}

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  slug?: string;
  folder?: string;
  images?: IBlogPostImage[];
  onImagesChange?: (images: IBlogPostImage[]) => void;
  onEditorFocus?: (editor: any) => void;
}

// ClearBreak 명령어 타입 확장
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearBreak: {
      insertClearBreak: () => ReturnType
    }
  }
}

export interface TiptapEditorRef {
  uploadTempImagesToBlob: (slug?: string, language?: string) => Promise<string>;
  getImages: () => IBlogPostImage[];
  getEditor: () => any;
  uploadImageToBlob: (file: File) => Promise<string>;
}

// 임시 이미지를 blob URL로 생성하는 함수
const createTempImageUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Clear Break 노드 정의 (float 해제용)
const ClearBreak = Node.create({
  name: 'clearBreak',
  
  group: 'block',
  
  parseHTML() {
    return [
      { tag: 'div[data-clear-break]' },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 
      ...HTMLAttributes, 
      'data-clear-break': '',
      style: 'clear: both; height: 1px; margin: 8px 0;' 
    }]
  },
  
  addCommands() {
    return {
      insertClearBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name })
      },
    }
  },
});


// 이미지 컴포넌트
const ImageComponent = ({ node, updateAttributes, deleteNode, extension }: any) => {
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 컨트롤 패널 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as globalThis.Node)) {
        setShowControls(false);
      }
    };

    if (showControls) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showControls]);

  // CSS 문자열을 React style 객체로 변환하는 함수
  const parseStyleString = (styleString: string): React.CSSProperties => {
    if (!styleString) return {};
    
    const styles: React.CSSProperties = {};
    const declarations = styleString.split(';');
    
    declarations.forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        // CSS property를 camelCase로 변환
        const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) => 
          letter.toUpperCase()
        );
        (styles as any)[camelCaseProperty] = value;
      }
    });
    
    return styles;
  };

  const handleSizeChange = (size: string) => {
    const currentStyle = node.attrs.style || '';
    // 기존 width 제거하고 새로운 width 추가
    const newStyle = currentStyle.replace(/width:\s*[^;]+;?/g, '').replace(/;+/g, ';').replace(/^;|;$/g, '') + `; width: ${size}; height: auto;`;
    updateAttributes({ style: newStyle.trim() });
    
    // 메타데이터 업데이트 (백분율을 숫자로 변환)
    const numericSize = parseInt(size.replace('%', ''));
    if (extension?.options?.updateImageMetadata) {
      extension.options.updateImageMetadata(node.attrs.src, { displaysize: numericSize });
    }
  };

  const handleAlignChange = (align: string) => {
    const currentStyle = node.attrs.style || '';
    
    // 기존 정렬 관련 스타일 모두 제거
    let cleanStyle = currentStyle
      .replace(/float:\s*[^;]+;?/g, '')
      .replace(/display:\s*[^;]+;?/g, '')
      .replace(/margin:\s*[^;]+;?/g, '')
      .replace(/margin-left:\s*[^;]+;?/g, '')
      .replace(/margin-right:\s*[^;]+;?/g, '')
      .replace(/text-align:\s*[^;]+;?/g, '')
      .replace(/;+/g, ';')
      .replace(/^;|;$/g, '');

    let newStyle = '';
    
    if (align === 'left') {
      // 왼쪽 정렬: 이미지를 왼쪽에 고정하고 텍스트가 오른쪽으로 흐르도록
      newStyle = `${cleanStyle}; display: block; float: left; margin: 0 20px 16px 0; clear: left;`;
    } else if (align === 'right') {
      // 오른쪽 정렬: 이미지를 오른쪽에 고정하고 텍스트가 왼쪽으로 흐르도록
      newStyle = `${cleanStyle}; display: block; float: right; margin: 0 0 16px 20px; clear: right;`;
    } else if (align === 'center') {
      // 가운데 정렬: 이미지를 중앙에 배치하고 위아래 여백 추가
      newStyle = `${cleanStyle}; display: block; margin: 16px auto; float: none; clear: both;`;
    }
    
    updateAttributes({ style: newStyle.trim() });
    
    // 메타데이터 업데이트
    if (extension?.options?.updateImageMetadata) {
      extension.options.updateImageMetadata(node.attrs.src, { alignment: align as 'left' | 'center' | 'right' | 'full' });
    }
  };

  const handleDelete = () => {
    if (confirm('이미지를 삭제하시겠습니까?')) {
      // 메타데이터에서도 제거
      if (extension?.options?.removeImageMetadata) {
        extension.options.removeImageMetadata(node.attrs.src);
      }
      deleteNode();
    }
  };

  // 기본 스타일과 사용자 정의 스타일 병합
  const defaultStyle: React.CSSProperties = {
    width: '50%',
    height: 'auto',
    display: 'block',
    margin: '16px auto'
  };

  const customStyle = parseStyleString(node.attrs.style || '');
  const finalStyle = { ...defaultStyle, ...customStyle };

  // 컨테이너 스타일 설정 (정렬에 따라)
  const containerStyle: React.CSSProperties = {};
  const wrapperClass = ['relative', 'group', 'my-4'];
  
  if (customStyle.float === 'left') {
    containerStyle.float = 'left';
    containerStyle.clear = 'left';
    containerStyle.margin = '0 20px 16px 0';
    wrapperClass.push('image-container', 'left');
  } else if (customStyle.float === 'right') {
    containerStyle.float = 'right';
    containerStyle.clear = 'right';
    containerStyle.margin = '0 0 16px 20px';
    wrapperClass.push('image-container', 'right');
  } else {
    containerStyle.display = 'block';
    containerStyle.margin = '16px auto';
    containerStyle.textAlign = 'center';
    containerStyle.clear = 'both';
    wrapperClass.push('image-container', 'center');
  }

  return (
    <NodeViewWrapper 
      className={wrapperClass.join(' ')}
      style={containerStyle}
      data-drag-handle=""
    >
      <div
        ref={containerRef}
        onClick={() => setShowControls(!showControls)}
        className={`relative inline-block cursor-pointer transition-all duration-200 ${
          showControls ? 'ring-2 ring-blue-500 ring-opacity-50' : 'hover:ring-1 hover:ring-gray-300'
        }`}
        style={{ 
          maxWidth: '100%',
          position: 'relative',
          borderRadius: '8px'
        }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          style={{
            ...finalStyle,
            display: 'block',
            maxWidth: '100%',
            height: 'auto'
          }}
          className="rounded-lg"
          onError={(e) => {
            // 이미지 로딩 실패 시 대체 텍스트 표시
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-4 text-center text-gray-500';
            fallback.style.width = target.style.width || '200px';
            fallback.style.height = '150px';
            fallback.style.display = 'flex';
            fallback.style.alignItems = 'center';
            fallback.style.justifyContent = 'center';
            fallback.innerHTML = `
              <div>
                <div>🖼️</div>
                <div class="text-sm mt-2">이미지 로딩 중...</div>
                <div class="text-xs text-gray-400 mt-1">임시 이미지는 저장 시 업로드됩니다</div>
              </div>
            `;
            target.parentNode?.appendChild(fallback);
          }}
          onLoad={(e) => {
            // 이미지 로딩 성공 시 fallback 제거
            const target = e.target as HTMLImageElement;
            const fallback = target.parentNode?.querySelector('.bg-gray-200');
            if (fallback) {
              fallback.remove();
            }
            target.style.display = 'block';
          }}
        />
        
        {showControls && (
          <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-2 flex flex-wrap gap-1 max-w-xs z-50 border">
            <div className="w-full text-xs text-gray-500 mb-1 text-center">이미지 설정</div>
            {/* 크기 조정 버튼들 */}
            <div className="flex gap-1 w-full">
              <button
                type="button"
                onClick={() => handleSizeChange('25%')}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors font-medium"
                title="25% 크기"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleSizeChange('50%')}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors font-medium"
                title="50% 크기"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleSizeChange('75%')}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors font-medium"
                title="75% 크기"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handleSizeChange('100%')}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors font-medium"
                title="100% 크기"
              >
                100%
              </button>
            </div>
            
            {/* 구분선 */}
            <div className="w-full h-px bg-gray-300 my-1"></div>
            
            {/* 정렬 버튼들 */}
            <div className="flex gap-1 w-full">
              <button
                type="button"
                onClick={() => handleAlignChange('left')}
                className="flex-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded transition-colors flex items-center justify-center"
                title="왼쪽 정렬 (텍스트가 오른쪽으로 흐름)"
              >
                ← 좌측
              </button>
              <button
                type="button"
                onClick={() => handleAlignChange('center')}
                className="flex-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded transition-colors flex items-center justify-center"
                title="가운데 정렬"
              >
                ↔ 중앙
              </button>
              <button
                type="button"
                onClick={() => handleAlignChange('right')}
                className="flex-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded transition-colors flex items-center justify-center"
                title="오른쪽 정렬 (텍스트가 왼쪽으로 흐름)"
              >
                → 우측
              </button>
            </div>
            
            {/* 구분선 */}
            <div className="w-full h-px bg-gray-300 my-1"></div>
            
            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
              title="이미지 삭제"
            >
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// 향상된 이미지 확장
const EnhancedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {}
          return { style: attributes.style }
        },
      },
      tempFile: {
        default: null,
      },
    }
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({ 
  value, 
  onChange, 
  placeholder = '본문을 입력하세요...', 
  className = '', 
  slug,
  folder,
  images = [],
  onImagesChange,
  onEditorFocus
}, ref) => {
  const [tempFiles, setTempFiles] = useState<Map<string, File>>(new Map());
  const [imageMetadata, setImageMetadata] = useState<IBlogPostImage[]>(images);

  // onEditorFocus를 useCallback으로 안정화
  const stableOnEditorFocus = useCallback((editor: any) => {
    onEditorFocus?.(editor);
  }, [onEditorFocus]);

  // 이미지 메타데이터 업데이트 함수
  const updateImageMetadata = useCallback((src: string, updates: Partial<IBlogPostImage>) => {
    setImageMetadata(prev => prev.map(img => img.src === src ? { ...img, ...updates } : img));
  }, []);

  // 새 이미지 메타데이터 추가 함수
  const addImageMetadata = useCallback((imageData: IBlogPostImage) => {
    setImageMetadata(prev => [...prev, imageData]);
  }, []);

  // 이미지 메타데이터 제거 함수
  const removeImageMetadata = useCallback((src: string) => {
    setImageMetadata(prev => prev.filter(img => img.src !== src));
  }, []);

  // images prop이 바뀔 때만 내부 상태 동기화
  useEffect(() => {
    setImageMetadata(images || []);
  }, [images]);
  
  // imageMetadata가 바뀌었을 때만 상위로 알림 (무한 루프 방지)
  useEffect(() => {
    const currentImagesString = JSON.stringify(imageMetadata);
    const propImagesString = JSON.stringify(images);
    
    if (propImagesString !== currentImagesString) {
      onImagesChange?.(imageMetadata);
    }
  }, [imageMetadata]); // onImagesChange 제거하여 무한 루프 방지

  // 이미지 메타데이터 가져오기 함수
  const getImages = useCallback(() => imageMetadata, [imageMetadata]);

  const editor = useEditor({
    extensions: [
      StarterKit, // 리스트 확장 비활성화 옵션 제거
      TextStyle,
      Color,
      FontSize,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      // BulletList,
      // OrderedList,
      // ListItem,
      EnhancedImage.configure({ 
        inline: false, 
        allowBase64: false,
      }),
      TextAlign.configure({ 
        types: ['heading', 'paragraph'] 
      }),
      ClearBreak,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: ({ editor }) => {
      stableOnEditorFocus(editor);
    },
    editorProps: {
      attributes: {
        class: 'min-h-[500px] p-4 focus:outline-none prose prose-lg max-w-none',
        placeholder,
      },
      handleDrop: (view, event, slice, moved) => {
        // 드래그 앤 드롭으로 이미지 업로드 지원
        if (!moved && event.dataTransfer && event.dataTransfer.files) {
          const files = Array.from(event.dataTransfer.files);
          const imageFiles = files.filter(file => file.type.startsWith('image/'));
          
          if (imageFiles.length > 0) {
            event.preventDefault();
            
            // 여러 이미지를 동시에 업로드
            imageFiles.forEach((file) => {
              handleImageUpload(file);
            });
            
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        // 클립보드에서 이미지 붙여넣기 지원
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter(item => item.type.startsWith('image/'));
        
        if (imageItems.length > 0) {
          event.preventDefault();
          
          imageItems.forEach((item) => {
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
            }
          });
          
          return true;
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  // 이미지 업로드 핸들러 (임시 URL로만 처리)
  const handleImageUpload = useCallback(async (file?: File) => {
    if (!editor) return;
    
    let selectedFile = file;
    if (!selectedFile) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true; // 다중 선택 지원
      
      input.onchange = async () => {
        if (input.files) {
          const files = Array.from(input.files);
          // 모든 파일을 동시에 처리
          files.forEach((file) => {
            handleImageUpload(file);
          });
        }
      };
      
      input.click();
      return;
    }
    
    try {
      // 임시 URL 생성
      const tempUrl = URL.createObjectURL(selectedFile);
      
      // 임시 파일 저장
      setTempFiles(prev => new Map(prev).set(tempUrl, selectedFile));
      
      // 이미지 크기 정보 가져오기
      const img = document.createElement('img');
      img.onload = () => {
        // 이미지 메타데이터 추가
        const imageData: IBlogPostImage = {
          src: tempUrl,
          alt: selectedFile.name,
          alignment: 'center',
          displaysize: 50,
          originalWidth: img.naturalWidth || img.width,
          originalHeight: img.naturalHeight || img.height,
          uploadAt: new Date()
        };
        addImageMetadata(imageData);
      };
      img.src = tempUrl;
      
      // 에디터에 임시 이미지 삽입 (포커스를 현재 위치로 유지)
      const { from } = editor.state.selection;
      editor.chain().focus().insertContentAt(from, {
        type: 'image',
        attrs: {
          src: tempUrl,
          alt: selectedFile.name
        }
      }).run();
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      // 토스터는 상위 컴포넌트에서 처리하므로 여기서는 로그만 남김
    }
  }, [editor, addImageMetadata]);

  // 단일 이미지 업로드 함수 (외부에서 호출용)
  const uploadImageToBlob = useCallback(async (file: File, slug?: string, customFilename?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'editor');
    
    // folder가 있으면 해당 폴더에 업로드
    if (folder) {
      formData.append('folder', folder);
    }
    
    // 커스텀 파일명이 있으면 사용
    if (customFilename) {
      formData.append('filename', customFilename);
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || '이미지 업로드 실패');
    }
    
    const data = await res.json();
    return data.url as string;
  }, []);

  // 실제 blob 업로드 함수 (외부에서 호출용)
  const uploadTempImagesToBlob = useCallback(async (slug?: string, language?: string) => {

    if (!editor || tempFiles.size === 0) return editor?.getHTML() || '';

    let updatedContent = editor.getHTML();
    let imageCounter = 1;
    
    // 각 임시 이미지를 실제 blob URL로 교체
    for (const [tempUrl, file] of tempFiles.entries()) {
      try {
        // 올바른 파일명 생성: [slug]_[language]_[counter]
        let customFilename;
        if (slug && language) {
          customFilename = `${slug}_${language}_${imageCounter.toString().padStart(2, '0')}`;
          imageCounter++;
        }
        
        const realUrl = await uploadImageToBlob(file, slug, customFilename);
        // 정확한 URL 매칭을 위해 이스케이프 처리
        const escapedTempUrl = tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedTempUrl, 'g');
        updatedContent = updatedContent.replace(regex, realUrl);
        
        // 이미지 메타데이터의 src도 업데이트
        updateImageMetadata(tempUrl, { src: realUrl });
        
        // 메모리 정리
        URL.revokeObjectURL(tempUrl);
      } catch (error) {
        console.error(`임시 이미지 업로드 실패:`, error);
      }
    }
    
    // 임시 파일 목록 정리
    setTempFiles(new Map());
    
    // 에디터 내용 업데이트
    editor.commands.setContent(updatedContent);
    
    return updatedContent;
  }, [editor, tempFiles]);

  // ref로 함수 노출
  useImperativeHandle(ref, () => ({
    uploadTempImagesToBlob,
    getImages,
    getEditor: () => editor,
    uploadImageToBlob
  }), [uploadTempImagesToBlob, getImages, editor, uploadImageToBlob]);


  if (!editor) {
    return (
      <div className="border rounded-lg p-4 text-center text-gray-500">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {/* 에디터 스타일 추가 */}
      <style jsx>{`
        .ProseMirror {
          outline: none;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        
        /* 이미지 컨테이너 정렬 스타일 */
        .ProseMirror .image-container {
          position: relative;
          margin: 16px 0;
          clear: both;
        }
        
        .ProseMirror .image-container.left {
          float: left;
          margin: 0 20px 16px 0;
          clear: left;
        }
        
        .ProseMirror .image-container.right {
          float: right;
          margin: 0 0 16px 20px;
          clear: right;
        }
        
        .ProseMirror .image-container.center {
          display: block;
          margin: 16px auto;
          text-align: center;
          float: none;
          clear: both;
        }
        
        /* 이미지별 정렬 스타일 */
        .ProseMirror img[style*="float: left"] {
          float: left !important;
          margin: 0 20px 16px 0 !important;
          clear: left !important;
        }
        
        .ProseMirror img[style*="float: right"] {
          float: right !important;
          margin: 0 0 16px 20px !important;
          clear: right !important;
        }
        
        .ProseMirror img[style*="margin: 16px auto"] {
          display: block !important;
          margin: 16px auto !important;
          float: none !important;
          clear: both !important;
        }
        
        /* 텍스트 흐름 개선 */
        .ProseMirror p {
          margin: 8px 0;
          line-height: 1.6;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        
        
        /* float 해제를 위한 클리어픽스 */
        .ProseMirror::after,
        .ProseMirror p::after {
          content: "";
          display: table;
          clear: both;
        }
        
        /* 이미지 다음 단락의 텍스트 흐름 보정 */
        .ProseMirror p + p {
          clear: none;
        }
        
        /* 긴 단어나 URL 등의 줄바꿈 처리 */
        .ProseMirror * {
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        /* 이미지 주변 여백 조정 */
        .ProseMirror img + p,
        .ProseMirror p + img {
          margin-top: 12px;
        }
        
        /* 연속된 이미지 간격 */
        .ProseMirror img + img {
          margin-top: 16px;
        }
        
        /* 브라우저별 호환성 */
        .ProseMirror {
          -webkit-hyphens: auto;
          -moz-hyphens: auto;
          hyphens: auto;
        }
        
        /* Clear Break 스타일 */
        .ProseMirror [data-clear-break] {
          clear: both !important;
          height: 1px;
          margin: 8px 0;
          border: none;
          background: transparent;
        }
        
        /* Clear Break 시각적 표시 (편집 모드에서만) */
        .ProseMirror [data-clear-break]:hover {
          background: rgba(59, 130, 246, 0.1);
          border: 1px dashed rgba(59, 130, 246, 0.3);
          height: 8px;
        }
        
        /* HTML span 태그 스타일 지원 */
        .ProseMirror span {
          display: inline !important;
        }
        
        .ProseMirror span[style] {
          display: inline !important;
        }
        
        /* 폰트 사이즈 */
        .ProseMirror span[style*="font-size"] {
          line-height: 1.4 !important;
        }
        
        /* 텍스트 색상 */
        .ProseMirror span[style*="color"] {
          /* 색상 스타일이 적용되도록 허용 */
        }
        
        /* HTML 파싱 지원 - span 태그를 텍스트로 표시하지 않음 */
        .ProseMirror {
          white-space: normal !important;
        }
      `}</style>
      
      {/* 에디터 영역 */}
      <div className="min-h-[500px] relative p-4">
        <EditorContent editor={editor} />
      </div>
      
      {/* 플로팅 툴바는 각 페이지에서 개별적으로 관리 */}
    </div>
  );
});

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;
export type { TiptapEditorProps }; 
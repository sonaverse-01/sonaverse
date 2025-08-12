'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';

interface FloatingToolbarProps {
  editor: Editor | null;
  onImageUpload?: () => void;
  tiptapRef?: any;
  onClose?: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ 
  editor, 
  onImageUpload,
  tiptapRef,
  onClose
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!toolbarRef.current) return;
    
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  // 드래그 중
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 이벤트 리스너 등록
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // 폰트 색상 변경 (Tiptap 명령어 사용)
  const handleColorChange = (color: string) => {
    if (!editor || !color) return;
    editor.chain().focus().setColor(color).run();
  };

  // 상태: 폰트 크기, 색상 팝오버, 현재 폰트 크기
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontColor, setShowFontColor] = useState(false);
  const [fontSize, setFontSize] = useState('16px');
  const [fontInput, setFontInput] = useState('16');
  const [colorInput, setColorInput] = useState('#000000');

  // 폰트 크기 조절 핸들러
  const handleFontSizeChange = (size: string) => {
    if (!editor || !size) return;
    setFontSize(size);
    setFontInput(size.replace('px', ''));
    editor.chain().focus().setFontSize(size).run();
  };
  const handleFontSizeStep = (step: number) => {
    let current = parseInt(fontSize.replace('px', ''));
    let next = Math.max(8, Math.min(72, current + step));
    handleFontSizeChange(next + 'px');
  };
  const handleFontInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    setFontInput(val);
    if (val) handleFontSizeChange(val + 'px');
  };

  // 색상 입력 핸들러
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorInput(e.target.value);
  };
  const handleColorInputApply = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(colorInput)) {
      handleColorChange(colorInput);
      setShowFontColor(false);
    }
  };

  // 링크 추가
  const handleAddLink = () => {
    if (!editor) return;
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // 리스트 토글 핸들러
  const handleBulletList = () => {
    if (!editor) return;
    editor.chain().focus().toggleBulletList().run();
  };
  const handleOrderedList = () => {
    if (!editor) return;
    editor.chain().focus().toggleOrderedList().run();
  };

  // 팝오버 닫기용 ref
  const fontPopoverRef = useRef<HTMLDivElement>(null);
  const colorPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showFontSize && fontPopoverRef.current && !fontPopoverRef.current.contains(e.target as Node)) {
        setShowFontSize(false);
      }
      if (showFontColor && colorPopoverRef.current && !colorPopoverRef.current.contains(e.target as Node)) {
        setShowFontColor(false);
      }
    }
    if (showFontSize || showFontColor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFontSize, showFontColor]);

  if (!editor) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-200 w-auto flex flex-col gap-0 p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        overflow: 'visible',
        minWidth: 0,
        maxWidth: 'none',
        height: 'auto',
      }}
    >
      {/* 헤더 - 드래그 영역 */}
      <div
        className="bg-gray-100 px-3 py-2 rounded-t-lg flex items-center justify-between border-b"
        onMouseDown={handleMouseDown}
      >
        <span className="text-xs font-medium text-gray-600">
          {isCollapsed ? '도구' : '편집 도구'}
        </span>
        <div className="flex items-center gap-1">
          <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-200 rounded text-gray-500"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isCollapsed ? '📝' : '➖'}
        </button>
        {onClose && (
          <button
            onClick={() => {
              onClose();
            }}
            className="p-1 hover:bg-red-200 rounded text-red-500"
            onMouseDown={(e) => e.stopPropagation()}
            title="툴바 닫기"
          >
            ✕
          </button>
        )}
        </div>
      </div>

      {/* 툴바 내용 */}
      {!isCollapsed && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* 텍스트 서식 */}
          <div className="text-[10px] text-gray-400 mb-0.5">텍스트 서식</div>
          <div className="flex gap-0.5 mb-0.5">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="굵게"><strong>B</strong></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="기울임"><em>I</em></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="밑줄"><u>U</u></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="제목2">H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="제목3">H3</button>
            <button onClick={() => editor.chain().focus().unsetColor().run()} className="px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-gray-200" title="스타일 제거">🚫</button>
          </div>
          {/* 폰트 */}
          <div className="text-[10px] text-gray-400 mb-0.5 mt-1">폰트</div>
          <div className="flex gap-0.5 mb-0.5">
            <button onClick={() => setShowFontSize((v) => !v)} className="px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-gray-200" title="폰트 크기"><span role="img" aria-label="폰트 크기">🔠</span></button>
            {showFontSize && (
              <div ref={fontPopoverRef} className="absolute z-50 mt-2 left-0 bg-white border rounded shadow p-2 flex items-center gap-1" style={{ minWidth: 120 }}>
                <button onClick={() => handleFontSizeStep(-2)} className="px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-gray-200">-</button>
                <input type="number" min="8" max="72" value={fontInput} onChange={handleFontInputChange} className="w-10 text-center border rounded text-xs" style={{height: 22}} />
                <span className="text-xs mx-1">px</span>
                <button onClick={() => handleFontSizeStep(2)} className="px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-gray-200">+</button>
              </div>
            )}
          </div>
          {/* 색상 */}
          <div className="text-[10px] text-gray-400 mb-0.5 mt-1">색상</div>
          <div className="flex gap-0.5 mb-0.5">
            <button onClick={() => setShowFontColor((v) => !v)} className="px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-gray-200" title="폰트 색상"><span role="img" aria-label="폰트 색상">🎨</span></button>
            {showFontColor && (
              <div ref={colorPopoverRef} className="absolute z-50 mt-2 left-16 bg-white border rounded shadow p-2 flex flex-col gap-1" style={{ minWidth: 120 }}>
                <div className="flex gap-1 mb-1">
                  {["#000000", "#ff0000", "#0000ff", "#008000", "#ffff00", "#800080", "#ffa500", "#ff69b4"].map((color) => (
                    <button key={color} onClick={() => { handleColorChange(color); setShowFontColor(false); }} className="w-5 h-5 rounded-full border-2 border-gray-200" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex gap-1 items-center mb-1">
                  <input type="text" value={colorInput} onChange={handleColorInputChange} maxLength={7} className="w-16 text-xs border rounded px-1" placeholder="#000000" />
                  <button onClick={handleColorInputApply} className="px-1 py-0.5 rounded text-xs bg-blue-500 text-white">적용</button>
                </div>
                <button onClick={() => { editor.chain().focus().unsetColor().run(); setShowFontColor(false); }} className="px-1 py-0.5 rounded text-xs bg-gray-200 hover:bg-gray-300">색상 제거</button>
              </div>
            )}
          </div>
          {/* 정렬 */}
          <div className="text-[10px] text-gray-400 mb-0.5 mt-1">정렬</div>
          <div className="flex gap-0.5 mb-0.5">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="왼쪽 정렬">⬅️</button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="가운데 정렬">↔️</button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`px-1 py-0.5 rounded text-xs ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="오른쪽 정렬">➡️</button>
          </div>
          {/* 기타 기능 */}
          <div className="text-[10px] text-gray-400 mb-0.5 mt-1">기타</div>
          <div className="flex gap-0.5 mb-0.5">
            <button onClick={handleAddLink} className={`px-1 py-0.5 rounded text-xs ${editor.isActive('link') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title="링크">🔗</button>
            <button onClick={() => {
              if (editor && tiptapRef?.current?.uploadImageToBlob) {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    try {
                      const imageUrl = await tiptapRef.current.uploadImageToBlob(file);
                      editor.chain().focus().setImage({ src: imageUrl }).run();
                    } catch (error) {
                      console.error('이미지 업로드 실패:', error);
                    }
                  }
                };
                input.click();
              }
            }} className="px-1 py-0.5 rounded text-xs bg-green-100 hover:bg-green-200" title="이미지">🖼️</button>
            <button onClick={() => editor.chain().focus().insertClearBreak().run()} className="px-1 py-0.5 rounded text-xs bg-purple-100 hover:bg-purple-200" title="줄바꿈">↩️</button>
            <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50" title="실행 취소">↩️</button>
            <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50" title="재실행">↪️</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
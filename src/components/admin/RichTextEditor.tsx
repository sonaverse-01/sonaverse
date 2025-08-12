'use client';

import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toggleBold = () => {
    execCommand('bold');
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    execCommand('italic');
    setIsItalic(!isItalic);
  };

  const toggleUnderline = () => {
    execCommand('underline');
    setIsUnderline(!isUnderline);
  };

  const insertLink = () => {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const clearFormatting = () => {
    execCommand('removeFormat');
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* 툴바 */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded hover:bg-gray-200 ${isBold ? 'bg-blue-200' : ''}`}
          title="굵게"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded hover:bg-gray-200 ${isItalic ? 'bg-blue-200' : ''}`}
          title="기울임"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={toggleUnderline}
          className={`p-2 rounded hover:bg-gray-200 ${isUnderline ? 'bg-blue-200' : ''}`}
          title="밑줄"
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded hover:bg-gray-200"
          title="링크 삽입"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 rounded hover:bg-gray-200"
          title="이미지 삽입"
        >
          🖼️
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={clearFormatting}
          className="p-2 rounded hover:bg-gray-200"
          title="서식 지우기"
        >
          🗑️
        </button>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[200px] p-4 focus:outline-none"
        data-placeholder={placeholder}
        style={{ minHeight: '200px' }}
      />
    </div>
  );
};

export default RichTextEditor; 
'use client';

import React, { useState } from 'react';

interface TextEditorProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  languages?: string[];
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  label = '내용',
  placeholder = '내용을 입력하세요...',
  rows = 6,
  languages = ['ko', 'en']
}) => {
  const [activeLang, setActiveLang] = useState(languages[0]);

  const langLabels = {
    ko: '한국어',
    en: 'English'
  };

  const handleChange = (lang: string, content: string) => {
    onChange({
      ...value,
      [lang]: content
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* 언어 탭 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeLang === lang
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {langLabels[lang as keyof typeof langLabels]}
            </button>
          ))}
        </nav>
      </div>

      {/* 에디터 */}
      <div className="space-y-2">
        {languages.map((lang) => (
          <div
            key={lang}
            className={`${activeLang === lang ? 'block' : 'hidden'}`}
          >
            <textarea
              value={value[lang] || ''}
              onChange={(e) => handleChange(lang, e.target.value)}
              placeholder={`${placeholder} (${langLabels[lang as keyof typeof langLabels]})`}
              rows={rows}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <div className="text-xs text-gray-500 mt-1">
              {langLabels[lang as keyof typeof langLabels]} 버전
            </div>
          </div>
        ))}
      </div>

      {/* 간단한 도구 모음 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>💡 팁:</span>
        <span>HTML 태그를 사용할 수 있습니다. 예: &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;p&gt;</span>
      </div>
    </div>
  );
};

export default TextEditor; 
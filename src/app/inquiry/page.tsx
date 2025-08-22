'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../contexts/LanguageContext';
import PrivacyConsent from '../../components/PrivacyConsent';

const categories = [
  { key: 'service', ko: '서비스 도입 문의', en: 'Service Introduction Inquiry' },
  { key: 'feature', ko: '제품 기능 문의', en: 'Product Feature Inquiry' },
  { key: 'estimate', ko: '견적 요청', en: 'Estimate Request' },
  { key: 'demo', ko: '데모/시연 요청', en: 'Demo/Trial Request' },
  { key: 'tech', ko: '기술 지원 문의', en: 'Technical Support Inquiry' },
  { key: 'biz_partnership', ko: '사업 제휴 제안', en: 'Business Partnership Proposal' },
  { key: 'tech_partnership', ko: '기술 제휴 제안', en: 'Technical Partnership Proposal' },
  { key: 'channel', ko: '채널 제휴 문의', en: 'Channel Partnership Inquiry' },
  { key: 'invest', ko: '투자/IR 문의', en: 'Investment/IR Inquiry' },
  { key: 'pr', ko: '언론/홍보 문의', en: 'PR/Media Inquiry' },
  { key: 'recruit', ko: '채용 문의', en: 'Recruitment Inquiry' },
  { key: 'complaint', ko: '불만/건의 사항', en: 'Complaint/Suggestion' },
  { key: 'etc', ko: '기타', en: 'Other' },
];

const InquiryPage: React.FC = () => {
  const { language, isClient } = useLanguage();
  
  // LanguageContext의 language 상태만 사용 (SSR 일관성 보장)
  const { addToast } = useToast();
  const [form, setForm] = useState({
    category: '',
    name: '',
    position: '',
    company: '',
    phone: '',
    email: '',
    message: '',
    files: [] as File[],
  });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [privacyConsented, setPrivacyConsented] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleCustomFileClick = () => fileInputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 실제 blob 업로드 허용 확장자만 남김 (이미지, pdf, doc, docx, xls, xlsx, csv, ppt, pptx, zip, txt, hwp, hwpx)
  const allowedFileTypesArr = [
    'jpg','jpeg','png','gif','bmp','svg','heic',
    'pdf','doc','docx','hwp','hwpx','txt',
    'xls','xlsx','csv','ppt','pptx','zip'
  ];
  const allowedFileTypes = allowedFileTypesArr.map(ext => '.'+ext).join(',');
  const allowedFileTypesText = language === 'en' 
    ? 'Allowed file types: ' + allowedFileTypesArr.join(', ')
    : '허용 확장자: ' + allowedFileTypesArr.join(', ');

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    // 허용 확장자만 필터링
    const filtered = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext && allowedFileTypesArr.includes(ext);
    });
    setForm(prev => ({ ...prev, files: filtered }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!form.category || !form.name || !form.phone || !form.email || !form.message) {
      addToast({
        type: 'error',
        message: language === 'en' ? 'Please fill in all required fields.' : '필수 항목을 모두 입력해주세요.'
      });
      return;
    }

    // 개인정보 동의 검증
    if (!privacyConsented) {
      setShowConsentError(true);
      addToast({
        type: 'error',
        message: language === 'en' ? 'Please consent to the collection and use of personal information.' : '개인정보 수집 및 이용에 동의해주세요.'
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      addToast({
        type: 'error',
        message: language === 'en' ? 'Please enter a valid email address.' : '올바른 이메일 주소를 입력해주세요.'
      });
      return;
    }

    setLoading(true);

    try {
      // 파일 업로드 처리
      const uploadedFiles = [];
      for (const file of form.files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'inquiry');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          uploadedFiles.push(uploadResult.url);
        }
      }

      // 문의 제출 (카테고리 한글 라벨 매핑 포함)
      const selected = categories.find(c => c.key === form.category);
      const inquiryData = {
        inquiry_type: form.category,
        inquiry_type_label: selected ? selected.ko : form.category,
        name: form.name,
        company_name: form.company,
        phone_number: form.phone,
        email: form.email,
        message: form.message,
        attached_files: uploadedFiles,
        privacy_consented: privacyConsented
      };

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '문의 제출에 실패했습니다.');
      }

      addToast({
        type: 'success',
        message: language === 'en' ? 'Your inquiry has been submitted successfully!' : '문의가 성공적으로 제출되었습니다!'
      });
      
      // 폼 초기화
      setForm({
        category: '',
        name: '',
        position: '',
        company: '',
        phone: '',
        email: '',
        message: '',
        files: [],
      });
      setPrivacyConsented(false);
      setShowConsentError(false);
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Inquiry submission error:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : '문의 제출 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center px-4 py-12 bg-white">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">
          {language === 'en' ? 'Purchase/Partnership Inquiry' : '구매/제휴 문의'}
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 카테고리 */}
          <div>
            <label className="block font-semibold mb-2">
              {language === 'en' ? 'Inquiry Category' : '문의 카테고리'} *
            </label>
            <div className={`grid grid-cols-2 gap-2 transition-all duration-300 ${showAllCategories ? '' : 'max-h-[180px] overflow-hidden'}`}>
              {(showAllCategories ? categories : categories.slice(0, 4)).map(cat => (
                <button
                  type="button"
                  key={cat.key}
                  className={`px-3 py-2 rounded-lg border transition-all text-sm font-medium ${form.category === cat.key ? 'bg-[#bda191] text-white border-[#bda191]' : 'bg-gray-50 border-gray-300 hover:bg-[#f0ece9]'}${cat.key === 'etc' ? ' col-span-2' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, category: cat.key }))}
                >
                  {language === 'en' ? cat.en : cat.ko}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 text-xs text-[#bda191] underline hover:no-underline focus:outline-none"
              onClick={() => setShowAllCategories(v => !v)}
            >
              {showAllCategories 
                ? (language === 'en' ? 'Collapse categories ▲' : '카테고리 접기 ▲')
                : (language === 'en' ? 'Show more categories ▼' : '카테고리 더보기 ▼')
              }
            </button>
          </div>
          {/* 성함 */}
          <div>
            <label className="block font-semibold mb-1">{language === 'en' ? 'Name' : '성함'} *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder={language === 'en' ? 'e.g. John Doe' : '예) 홍길동'} className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191]" />
          </div>
          {/* 직급 */}
          <div>
            <label className="block font-semibold mb-1">{language === 'en' ? 'Position' : '직급'}</label>
            <input name="position" value={form.position} onChange={handleChange} placeholder={language === 'en' ? 'e.g. Manager, CEO, Student' : '예) 팀장, 대표, 학생 등'} className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191]" />
          </div>
          {/* 회사명 */}
          <div>
            <label className="block font-semibold mb-1">{language === 'en' ? 'Company' : '회사명'}</label>
            <input name="company" value={form.company} onChange={handleChange} placeholder={language === 'en' ? 'e.g. Sonaverse' : '예) 소나버스'} className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191]" />
          </div>
          {/* 연락처 */}
          <div>
            <label className="block font-semibold mb-1">{language === 'en' ? 'Phone' : '연락처'} *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder={language === 'en' ? 'e.g. 010-1234-5678' : '예) 010-1234-5678'} className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191]" />
          </div>
          {/* 이메일 */}
          <div>
            <label className="block font-semibold mb-1">{language === 'en' ? 'Email' : '이메일'} *</label>
            <input name="email" value={form.email} onChange={handleChange} required placeholder={language === 'en' ? 'e.g. your@email.com' : '예) your@email.com'} className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191]" />
          </div>
          {/* 문의 내용 */}
          <div>
            <label className="block font-semibold mb-1">{language === 'en' ? 'Message' : '문의 내용'} *</label>
            <textarea name="message" value={form.message} onChange={handleChange} required placeholder={language === 'en' ? 'Please enter your inquiry.' : '문의하실 내용을 입력해 주세요.'} className="border rounded-lg px-3 py-2 w-full min-h-[120px] focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191]" />
          </div>
          {/* 첨부파일 */}
          <div>
            <label className="block font-semibold mb-1">{language === 'en' ? 'Attachment (multiple files allowed)' : '첨부파일 (여러 개 선택 가능)'}</label>
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={handleCustomFileClick}
                className="w-full px-4 py-2 bg-[#f0ece9] text-[#22223b] rounded-lg font-medium border border-[#bda191] hover:bg-[#bda191] hover:text-white transition-colors"
              >
                {language === 'en' ? 'Choose file(s)' : '파일 선택'}
              </button>
              <span className="text-xs text-gray-500 block w-full">
                {form.files.length === 0
                  ? (language === 'en' ? 'No file selected.' : '선택된 파일이 없습니다.')
                  : form.files.map(f => `${f.name}`).join(', ')}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="files"
              multiple
              accept={allowedFileTypes}
              onChange={handleFiles}
              className="hidden"
            />
            <div className="mt-1 text-xs text-gray-400">{allowedFileTypesText}</div>
          </div>
          
          {/* 개인정보 수집 동의 */}
          <PrivacyConsent 
            onConsentChange={(consented) => {
              setPrivacyConsented(consented);
              if (consented) setShowConsentError(false);
            }}
            showError={showConsentError}
            addToast={addToast}
          />
          
          {/* 제출 버튼 */}
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-[#bda191] text-white px-6 py-3 rounded-lg shadow hover:bg-[#a88a6d] transition-all font-semibold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (language === 'en' ? 'Submitting...' : '제출 중...')
              : (language === 'en' ? 'Submit Inquiry' : '문의하기')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default InquiryPage; 
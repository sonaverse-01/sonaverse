'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrivacyConsentProps {
  onConsentChange: (consented: boolean) => void;
  showError: boolean;
  addToast?: (toast: { type: 'error' | 'success' | 'info'; message: string }) => void;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onConsentChange, showError, addToast }) => {
  const { language } = useLanguage();
  const [consent, setConsent] = useState<'none' | 'agree' | 'disagree'>('none');
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const privacyText = {
    ko: {
      title: '개인정보 수집 및 이용동의',
      content: `
소나버스(이하 "회사")는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령에 따라 개인정보를 수집·이용하고자 할 때에는 정보주체의 동의를 받아야 합니다.

1. 개인정보 수집·이용 목적
회사는 다음의 목적을 위하여 개인정보를 처리합니다.
- 문의사항 접수 및 답변 제공
- 서비스 안내 및 상담
- 고객 요청사항 처리
- 제품 및 서비스 개선을 위한 연구 및 분석

2. 수집하는 개인정보 항목
- 필수항목: 성명, 연락처, 이메일 주소, 문의내용
- 선택항목: 직급, 회사명, 첨부파일

3. 개인정보의 보유·이용기간
수집된 개인정보는 목적 달성 시까지 보관하며, 관계법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관합니다.
- 문의사항 처리: 처리 완료 후 3년

4. 동의를 거부할 권리 및 동의 거부에 따른 불이익
귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으며, 동의를 거부할 경우 문의사항 접수 및 처리가 제한될 수 있습니다.

5. 개인정보 처리 위탁
회사는 서비스 향상을 위해 아래와 같이 개인정보 처리업무를 외부에 위탁하고 있습니다.
- 위탁업체: Vercel Inc.
- 위탁업무: 클라우드 서비스 제공 및 데이터 저장
- 보유·이용기간: 위탁계약 종료 시까지

위 내용에 대해 충분히 이해하셨으며, 개인정보 수집·이용에 동의하십니까?
      `,
      agreeLabel: '동의함',
      disagreeLabel: '동의하지 않음',
      scrollWarning: '개인정보 수집 및 이용 동의서를 끝까지 읽어주세요.',
      consentRequired: '개인정보 수집 및 이용에 동의해주세요.'
    },
    en: {
      title: 'Personal Information Collection and Use Consent',
      content: `
Sonaverse (hereinafter "Company") must obtain the consent of data subjects when collecting and using personal information in accordance with relevant laws such as the Act on Promotion of Information and Communications Network Utilization and Information Protection, Personal Information Protection Act.

1. Purpose of Personal Information Collection and Use
The Company processes personal information for the following purposes:
- Receiving and responding to inquiries
- Service guidance and consultation
- Processing customer requests
- Research and analysis for product and service improvement

2. Personal Information Items Collected
- Required items: Name, contact information, email address, inquiry content
- Optional items: Position, company name, attached files

3. Personal Information Retention and Use Period
Collected personal information is retained until the purpose is achieved, and if it needs to be preserved according to relevant laws, it is retained for the corresponding period.
- Inquiry processing: 3 years after processing completion

4. Right to Refuse Consent and Disadvantages of Refusing Consent
You have the right to refuse consent to personal information collection and use, and if you refuse consent, the receipt and processing of inquiries may be restricted.

5. Personal Information Processing Outsourcing
The Company outsources personal information processing tasks to external parties as follows to improve services:
- Outsourced company: Vercel Inc.
- Outsourced work: Cloud service provision and data storage
- Retention and use period: Until the outsourcing contract ends

Do you fully understand the above content and consent to the collection and use of personal information?
      `,
      agreeLabel: 'Agree',
      disagreeLabel: 'Disagree',
      scrollWarning: 'Please read the personal information collection and use agreement to the end.',
      consentRequired: 'Please consent to the collection and use of personal information.'
    }
  };

  const currentText = privacyText[language];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      setIsScrolledToBottom(isAtBottom);
    }
  };

  const handleConsentChange = (value: 'agree' | 'disagree') => {
    if (value === 'agree' && !isScrolledToBottom) {
      if (addToast) {
        addToast({
          type: 'error',
          message: language === 'en' 
            ? 'Please read the personal information collection and use agreement to the end.' 
            : '개인정보 수집 및 이용동의서를 끝까지 읽어주세요.'
        });
      }
      return;
    }
    setConsent(value);
    onConsentChange(value === 'agree');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
      return () => {
        if (scrollRef.current) {
          scrollRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, []);

  return (
    <div className="w-full">
      <label className="block font-semibold mb-2 text-gray-800">
        {currentText.title} *
      </label>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto p-4 text-sm leading-relaxed text-gray-700 bg-gray-50"
          onScroll={handleScroll}
        >
          <div className="whitespace-pre-line">
            {currentText.content}
          </div>
        </div>
        
        <div className="p-2 bg-white border-t border-gray-200">
          <div className="flex flex-row gap-6 justify-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="privacy-consent"
                value="agree"
                checked={consent === 'agree'}
                onChange={() => handleConsentChange('agree')}
                className="mr-2 text-[#bda191] focus:ring-[#bda191]"
              />
              <span className="font-medium text-black">
                {currentText.agreeLabel}
              </span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="privacy-consent"
                value="disagree"
                checked={consent === 'disagree'}
                onChange={() => handleConsentChange('disagree')}
                className="mr-2 text-red-500 focus:ring-red-500"
              />
              <span className="font-medium text-black">
                {currentText.disagreeLabel}
              </span>
            </label>
          </div>
          
          {showError && consent !== 'agree' && (
            <div className="mt-2 text-xs text-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {currentText.consentRequired}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsent;
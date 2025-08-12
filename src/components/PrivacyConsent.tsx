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
      intro:
        '소나버스(이하 "회사")는 「개인정보보호법」 등 관련 법령에 따라, 제휴 문의 접수 및 처리를 위해 아래와 같이 개인정보를 수집·이용하고자 합니다. 내용을 자세히 읽어보신 후 동의 여부를 결정해 주시기 바랍니다.',
      sections: [
        {
          heading: '1. 개인정보 수집 및 이용 목적',
          bullets: [
            '제휴 제안 검토 및 결과 회신',
            '제휴 관계 설정 및 유지·관리',
            '원활한 의사소통 경로 확보',
            '(동의 시) 회사 서비스 및 제휴 관련 정보 안내',
          ],
        },
        {
          heading: '2. 수집하는 개인정보 항목',
          bullets: [
            '필수항목: 성함, 연락처, 이메일 주소, 문의내용',
            '선택항목: 직급, 회사명, 첨부파일',
          ],
        },
        {
          heading: '3. 개인정보의 보유 및 이용 기간',
          paragraphs: [
            '수집된 개인정보는 제휴 검토 기간 동안 이용하며, 제휴 관계 종료 후 또는 정보주체의 삭제 요청 시까지 보유합니다. 단, 관계 법령의 규정에 따라 보존할 필요가 있는 경우, 회사는 아래와 같이 관계 법령에서 정한 일정한 기간 동안 개인정보를 보관합니다.',
          ],
          bullets: [
            '계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)',
            '소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)',
          ],
        },
        {
          heading: '4. 동의를 거부할 권리 및 동의 거부에 따른 불이익',
          paragraphs: [
            '귀하는 위와 같은 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수항목에 대한 동의를 거부하실 경우, 정상적인 제휴 제안 접수 및 검토가 불가능하여 서비스 이용이 제한될 수 있습니다.',
          ],
        },
      ],
      finalQuestion:
        '위 내용에 대해 충분히 이해하셨으며, 소나버스의 제휴 문의를 위한 개인정보 수집 및 이용에 동의하십니까?',
      agreeLabel: '동의함',
      disagreeLabel: '동의하지 않음',
      scrollWarning: '개인정보 수집 및 이용 동의서를 끝까지 읽어주세요.',
      consentRequired: '개인정보 수집 및 이용에 동의해주세요.'
    },
    en: {
      title: 'Personal Information Collection and Use Consent',
      intro:
        'Sonaverse (the "Company") intends to collect and use personal information as follows for the receipt and processing of partnership inquiries in accordance with the Personal Information Protection Act and other applicable laws. Please review the details carefully and decide whether to consent.',
      sections: [
        {
          heading: '1. Purpose of Collection and Use of Personal Information',
          bullets: [
            'Review partnership proposals and provide results',
            'Establish, maintain, and manage partnership relationships',
            'Secure a channel for smooth communication',
            '(If consented) Provide information on Company services and partnership-related updates',
          ],
        },
        {
          heading: '2. Personal Information Items Collected',
          bullets: [
            'Required: Name, contact number, email address, inquiry details',
            'Optional: Position, company name, attachments',
          ],
        },
        {
          heading: '3. Retention and Use Period of Personal Information',
          paragraphs: [
            'Collected personal information is used during the partnership review period and retained until the partnership ends or upon the data subject’s request for deletion. However, where preservation is required by law, the Company retains personal information for the statutory periods below:',
          ],
          bullets: [
            'Records on contracts or withdrawal of offers: 5 years (Act on Consumer Protection in Electronic Commerce, etc.)',
            'Records on consumer complaints or dispute resolution: 3 years (Act on Consumer Protection in Electronic Commerce, etc.)',
          ],
        },
        {
          heading: '4. Right to Refuse Consent and Possible Disadvantages',
          paragraphs: [
            'You have the right to refuse consent to the collection and use of personal information. However, refusing consent to the required items may make it impossible to properly receive and review partnership proposals, thereby limiting the service.',
          ],
        },
      ],
      finalQuestion:
        'Do you fully understand the above and consent to the collection and use of your personal information for SONAVERSE partnership inquiries?',
      agreeLabel: 'Agree',
      disagreeLabel: 'Disagree',
      scrollWarning: 'Please read the personal information collection and use agreement to the end.',
      consentRequired: 'Please consent to the collection and use of personal information.'
    }
  } as const;

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
          className="h-64 overflow-y-auto p-5 text-sm leading-relaxed text-gray-800 bg-gray-50"
          onScroll={handleScroll}
        >
          {currentText.intro && (
            <p className="mb-4 text-gray-800">{currentText.intro}</p>
          )}
          {currentText.sections?.map((sec: any, idx: number) => (
            <section key={idx} className="mb-5">
              <h4 className="font-bold text-gray-900 mb-2">{sec.heading}</h4>
              {sec.paragraphs?.map((p: string, i: number) => (
                <p key={i} className="mb-2 text-gray-800">{p}</p>
              ))}
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  {sec.bullets.map((b: string, j: number) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          {currentText.finalQuestion && (
            <p className="mt-4 font-medium text-gray-900">{currentText.finalQuestion}</p>
          )}
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
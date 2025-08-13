'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/app/i18n';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{t('privacy_policy', '개인정보처리방침')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label={t('close', '닫기')}
          >
            ×
          </button>
        </div>
        
        {/* 내용 */}
        <div className="p-6 text-sm text-gray-700 leading-relaxed">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. {t('privacy_purpose_title', '개인정보의 처리 목적')}</h3>
              <p className="mb-2">
                {t('privacy_purpose_desc', '(주)소나버스는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.')}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('privacy_purpose_1', '회원 가입 및 관리')}</li>
                <li>{t('privacy_purpose_2', '상품 주문 및 배송')}</li>
                <li>{t('privacy_purpose_3', '고객 상담 및 문의 응대')}</li>
                <li>{t('privacy_purpose_4', '마케팅 및 광고에의 활용')}</li>
                <li>{t('privacy_purpose_5', '서비스 제공 및 운영')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. {t('privacy_retention_title', '개인정보의 처리 및 보유기간')}</h3>
              <p className="mb-2">
                {t('privacy_retention_desc', '회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.')}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('privacy_retention_1', '회원정보: 회원탈퇴 시까지')}</li>
                <li>{t('privacy_retention_2', '주문정보: 5년간 보관')}</li>
                <li>{t('privacy_retention_3', '계약 또는 청약철회 등에 관한 기록: 5년')}</li>
                <li>{t('privacy_retention_4', '대금결제 및 재화 등의 공급에 관한 기록: 5년')}</li>
                <li>{t('privacy_retention_5', '소비자의 불만 또는 분쟁처리에 관한 기록: 3년')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. {t('privacy_third_party_title', '개인정보의 제3자 제공')}</h3>
              <p className="mb-2">
                {t('privacy_third_party_desc', '회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. {t('privacy_entrustment_title', '개인정보처리의 위탁')}</h3>
              <p className="mb-2">
                {t('privacy_entrustment_desc', '회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.')}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('privacy_entrustment_1', '배송업무: 택배회사')}</li>
                <li>{t('privacy_entrustment_2', '결제처리: 결제대행사')}</li>
                <li>{t('privacy_entrustment_3', '고객상담: 고객상담업체')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. {t('privacy_rights_title', '정보주체의 권리·의무 및 그 행사방법')}</h3>
              <p className="mb-2">
                {t('privacy_rights_desc', '이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.')}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('privacy_rights_1', '개인정보 열람요구')}</li>
                <li>{t('privacy_rights_2', '오류 등이 있을 경우 정정 요구')}</li>
                <li>{t('privacy_rights_3', '삭제요구')}</li>
                <li>{t('privacy_rights_4', '처리정지 요구')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. {t('privacy_destruction_title', '개인정보의 파기')}</h3>
              <p className="mb-2">
                {t('privacy_destruction_desc', '회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. {t('privacy_security_title', '개인정보의 안전성 확보 조치')}</h3>
              <p className="mb-2">
                {t('privacy_security_desc', '회사는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보조치를 취하고 있습니다.')}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('privacy_security_1', '개인정보의 암호화')}</li>
                <li>{t('privacy_security_2', '해킹 등에 대비한 기술적 대책')}</li>
                <li>{t('privacy_security_3', '개인정보에 대한 접근 제한')}</li>
                <li>{t('privacy_security_4', '개인정보 취급 직원의 최소화 및 교육')}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. {t('privacy_officer_title', '개인정보 보호책임자')}</h3>
              <p className="mb-2">
                {t('privacy_officer_desc', '회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>{t('privacy_officer', '개인정보 보호책임자')}</strong></p>
                <p>{t('name', '성명')}: {t('representative', '이수진')}</p>
                <p>{t('contact', '연락처')}: {t('main_phone', '010-5703-8899')}</p>
                <p>{t('email', '이메일')}: {t('cs_email', 'shop@sonaverse.kr')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. {t('privacy_changes_title', '개인정보 처리방침 변경')}</h3>
              <p>
                {t('privacy_changes_desc', '이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.')}
              </p>
            </section>

            <div className="text-center text-gray-500 text-xs mt-8">
              <p>{t('effective_date', '시행일자')}: 2024년 1월 1일</p>
              <p>{t('last_modified', '최종 수정일')}: 2024년 12월 1일</p>
            </div>
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('close', '닫기')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal; 
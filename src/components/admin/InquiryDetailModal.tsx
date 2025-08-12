'use client';

import React from 'react';

interface StatusHistory {
  status: string;
  changed_by: {
    _id: string;
    username: string;
    email: string;
  };
  changed_at: string;
  notes?: string;
}

interface Inquiry {
  _id: string;
  inquiry_type: string;
  name: string;
  company_name: string;
  phone_number: string;
  email: string;
  message: string;
  attached_files: string[];
  submitted_at: string;
  status: string;
  admin_notes?: string;
  responded_at?: string;
  responded_by?: {
    _id: string;
    username: string;
    email: string;
  };
  status_history: StatusHistory[];
}

interface InquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
}

const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  isOpen,
  onClose,
  inquiry
}) => {
  if (!isOpen || !inquiry) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'inProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '대기중',
      inProgress: '처리중',
      completed: '완료',
      closed: '종료'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              문의 상세 정보
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              문의 상세 정보를 확인하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="space-y-8">
            {/* 기본 정보 섹션 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                기본 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    이름
                  </label>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                    <p className="text-gray-900 font-medium">{inquiry.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    회사명
                  </label>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                    <p className="text-gray-900">{inquiry.company_name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    이메일
                  </label>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                    <p className="text-gray-900 font-mono text-sm">{inquiry.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    전화번호
                  </label>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                    <p className="text-gray-900 font-mono">{inquiry.phone_number}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 문의 정보 섹션 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                문의 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    문의 유형
                  </label>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                    <p className="text-gray-900">{inquiry.inquiry_type}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    상태
                  </label>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                      {getStatusText(inquiry.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    접수일
                  </label>
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                    <p className="text-gray-900 font-mono">{formatDate(inquiry.submitted_at)}</p>
                  </div>
                </div>
                {inquiry.responded_at && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      답변일
                    </label>
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                      <p className="text-gray-900 font-mono">{formatDate(inquiry.responded_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 첨부파일 섹션 */}
            {inquiry.attached_files && inquiry.attached_files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  첨부파일
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                  <div className="space-y-2">
                    {inquiry.attached_files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                          첨부파일 {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 관리자 메모 섹션 */}
            {inquiry.admin_notes && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  관리자 메모
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                  <p className="text-gray-900 whitespace-pre-wrap">{inquiry.admin_notes}</p>
                </div>
              </div>
            )}

            {/* 문의 내용 섹션 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                문의 내용
              </h3>
              <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                <div className="prose max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {inquiry.message || '문의 내용이 없습니다.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 상태 히스토리 섹션 */}
            {inquiry.status_history && inquiry.status_history.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  처리 히스토리
                </h3>
                <div className="space-y-3">
                  {inquiry.status_history.map((history, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mr-3 ${getStatusColor(history.status)}`}>
                            {getStatusText(history.status)}
                          </span>
                          <span className="text-sm text-gray-600 font-medium">
                            {history.changed_by?.username || '알 수 없음'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 font-mono">
                          {formatDate(history.changed_at)}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-gray-700 text-sm mt-2 pl-3 border-l-2 border-gray-300">
                          {history.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailModal; 
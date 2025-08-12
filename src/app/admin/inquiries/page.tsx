'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import InquiryDetailModal from '@/components/admin/InquiryDetailModal';
import { useToast } from '@/components/Toast';

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

const InquiriesManagement: React.FC = () => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inquiries', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }
      
      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      addToast({
        type: 'error',
        message: '문의 목록을 불러오는데 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    title: '문의 관리',
    search: '문의 검색...',
    filterAll: '전체',
    table: {
      name: '이름',
      company: '회사명',
      category: '카테고리',
      subject: '제목',
      status: '상태',
      handler: '처리자',
      receivedDate: '접수일',
      actions: '작업'
    },
    status: {
      new: '신규',
      inProgress: '처리중',
      completed: '완료'
    },
    actions: {
      view: '보기',
      reply: '답변',
      delete: '삭제'
    },
    noInquiries: '등록된 문의가 없습니다.'
  };

  // 상태값 수정 함수
  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      // 상태 변경 메모 입력받기
      const statusChangeNotes = prompt('상태 변경 사유를 입력해주세요 (선택사항):');
      
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          status_change_notes: statusChangeNotes || ''
        }),
      });

      if (!response.ok) {
        throw new Error('상태 변경 실패');
      }

      const updatedInquiry = await response.json();
      
      setInquiries(prev => prev.map(inquiry => 
        inquiry._id === inquiryId ? updatedInquiry : inquiry
      ));
      
      addToast({
        type: 'success',
        message: '상태가 성공적으로 변경되었습니다.'
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      addToast({
        type: 'error',
        message: '상태 변경에 실패했습니다.'
      });
    }
  };

  // 문의 삭제 함수
  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      setInquiries(prev => prev.filter(inquiry => inquiry._id !== inquiryId));
      addToast({
        type: 'success',
        message: '문의가 삭제되었습니다.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: '문의 삭제에 실패했습니다.'
      });
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'inProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // 카테고리 매핑 함수
  const getCategoryDisplayName = (categoryKey: string) => {
    const categoryMap: { [key: string]: string } = {
      'general': '일반문의',
      'partnership': '제휴문의',
      'product': '제품문의',
      'media': '언론문의',
      'investment': '투자문의',
      'other': '기타문의'
    };
    return categoryMap[categoryKey] || categoryKey;
  };

  // 마지막 상태 변경자 정보 가져오기
  const getLastStatusHandler = (inquiry: Inquiry) => {
    if (inquiry.status_history && inquiry.status_history.length > 0) {
      const lastChange = inquiry.status_history[inquiry.status_history.length - 1];
      return lastChange.changed_by?.username || '시스템';
    }
    return '시스템';
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{labels.title}</h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={labels.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
          >
            <option value="all">{labels.filterAll}</option>
            {Object.entries(labels.status).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inquiries Table - Desktop */}
      <div className="hidden lg:block bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.company}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.category}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.subject}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.handler}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.receivedDate}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {labels.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    문의 목록을 불러오는 중입니다...
                  </td>
                </tr>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {inquiry.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {inquiry.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{inquiry.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{getCategoryDisplayName(inquiry.inquiry_type)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {truncateMessage(inquiry.message)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-yellow-400 ${getStatusColor(inquiry.status)}`}
                      >
                        {Object.entries(labels.status).map(([key, value]) => (
                          <option key={key} value={key} className="bg-gray-800 text-white">
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{getLastStatusHandler(inquiry)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(inquiry.submitted_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {labels.actions.view}
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 transition-colors"
                          onClick={() => {
                            if (confirm('정말 삭제하시겠습니까?')) {
                              handleDeleteInquiry(inquiry._id);
                            }
                          }}
                        >
                          {labels.actions.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    {labels.noInquiries}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <p className="text-gray-400">문의 목록을 불러오는 중입니다...</p>
          </div>
        ) : filteredInquiries.length > 0 ? (
          filteredInquiries.map((inquiry) => (
            <div key={inquiry._id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white">
                    {inquiry.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {inquiry.email}
                  </p>
                  {inquiry.company_name && (
                    <p className="text-xs text-gray-400">
                      {inquiry.company_name}
                    </p>
                  )}
                </div>
                <select
                  value={inquiry.status}
                  onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                  className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-yellow-400 ${getStatusColor(inquiry.status)}`}
                >
                  {Object.entries(labels.status).map(([key, value]) => (
                    <option key={key} value={key} className="bg-gray-800 text-white">
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-xs text-gray-500 mb-2">
                <span className="inline-block mr-3">
                  📂 {getCategoryDisplayName(inquiry.inquiry_type)}
                </span>
                <span className="inline-block">
                  📅 {formatDate(inquiry.submitted_at)}
                </span>
              </div>
              
              <div className="text-sm text-gray-300 mb-3 line-clamp-2">
                {truncateMessage(inquiry.message)}
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  처리자: {getLastStatusHandler(inquiry)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setShowDetailModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    {labels.actions.view}
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300 transition-colors text-sm"
                    onClick={() => {
                      if (confirm('정말 삭제하시겠습니까?')) {
                        handleDeleteInquiry(inquiry._id);
                      }
                    }}
                  >
                    {labels.actions.delete}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <p className="text-gray-400">{labels.noInquiries}</p>
          </div>
        )}
      </div>

      {/* 문의 상세 모달 */}
      <InquiryDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedInquiry(null);
        }}
        inquiry={selectedInquiry}
      />
    </div>
  );
};

export default InquiriesManagement; 
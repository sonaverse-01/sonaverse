'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '../../../components/Toast';

interface PressItem {
  _id: string;
  slug: string;
  press_name: Record<string, string>;
  content: Record<string, {
    title: string;
    body: string;
    external_link?: string;
  }>;
  is_active: boolean;
  created_at: string;
  last_updated: string;
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: PressItem[];
}

const AdminPressPage: React.FC = () => {
  const { addToast } = useToast();
  const [allPressList, setAllPressList] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 모든 언론보도를 가져오기
  useEffect(() => {
    fetchAllPressList();
  }, []);

  const fetchAllPressList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/press?pageSize=1000', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch press list');
      const data = await res.json();
      setAllPressList(data.results || []);
    } catch (err) {
      console.error('Error fetching press list:', err);
      setError('언론보도 목록을 불러오는데 실패했습니다.');
      addToast({
        type: 'error',
        message: '언론보도 목록을 불러오는데 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // 검색 필터링된 결과
  const filteredPressList = useMemo(() => {
    if (!searchTerm.trim()) {
      return allPressList;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return allPressList.filter(press => {
      const koTitle = press.content?.ko?.title?.toLowerCase() || '';
      const enTitle = press.content?.en?.title?.toLowerCase() || '';
      const koPressName = press.press_name?.ko?.toLowerCase() || '';
      const enPressName = press.press_name?.en?.toLowerCase() || '';
      const koBody = press.content?.ko?.body?.toLowerCase() || '';
      const enBody = press.content?.en?.body?.toLowerCase() || '';
      
      return koTitle.includes(searchLower) ||
             enTitle.includes(searchLower) ||
             koPressName.includes(searchLower) ||
             enPressName.includes(searchLower) ||
             koBody.includes(searchLower) ||
             enBody.includes(searchLower);
    });
  }, [allPressList, searchTerm]);

  // 페이징네이션 계산
  const paginationData = useMemo(() => {
    const total = filteredPressList.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const results = filteredPressList.slice(startIndex, endIndex);
    
    return {
      total,
      page: currentPage,
      pageSize,
      totalPages,
      results
    };
  }, [filteredPressList, currentPage, pageSize]);

  // 검색어가 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // 즉시 로컬 상태 업데이트
      setAllPressList(prev => prev.map(item => 
        item._id === id 
          ? { ...item, is_active: !currentStatus }
          : item
      ));

      const res = await fetch(`/api/press/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      
      if (!res.ok) {
        // API 실패 시 원래 상태로 되돌리기
        setAllPressList(prev => prev.map(item => 
          item._id === id 
            ? { ...item, is_active: currentStatus }
            : item
        ));
        throw new Error('Failed to update press status');
      }
      
      addToast({
        type: 'success',
        message: `언론보도가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`
      });
    } catch (err) {
      console.error('Error updating press status:', err);
      addToast({
        type: 'error',
        message: '상태 변경에 실패했습니다.'
      });
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/press/${slug}`, {
        method: 'DELETE',
        credentials: 'include', // 쿠키 기반 인증
      });
      
      if (!res.ok) throw new Error('Failed to delete press');
      
      // 목록 새로고침
      fetchAllPressList();
      addToast({
        type: 'success',
        message: '언론보도가 삭제되었습니다.'
      });
    } catch (err) {
      console.error('Error deleting press:', err);
      addToast({
        type: 'error',
        message: '삭제에 실패했습니다.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white">언론보도 관리</h1>
        <Link 
          href="/admin/press/new" 
          className="bg-yellow-400 text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors font-medium text-sm sm:text-base text-center"
        >
          새 언론보도 등록
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="제목, 언론사명, 내용으로 검색..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchTerm && (
            <div className="sm:ml-4 text-sm text-gray-400">
              {paginationData.total}개 결과
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  언론사
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {paginationData.results.map((item) => (
                <tr key={item._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {item.content?.ko?.title || item.content?.en?.title || '제목 없음'}
                    </div>
                    <div className="text-sm text-gray-400">{item.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.press_name?.ko || item.press_name?.en || '언론사명 없음'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.is_active ? 'active' : 'inactive'}
                      onChange={(e) => handleToggleActive(item._id, item.is_active)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-yellow-400 ${
                        item.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/press/${item.slug}/edit`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(item.slug)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {paginationData.results.map((item) => (
          <div key={item._id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {item.content?.ko?.title || item.content?.en?.title || '제목 없음'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{item.slug}</p>
              </div>
              <select
                value={item.is_active ? 'active' : 'inactive'}
                onChange={(e) => handleToggleActive(item._id, item.is_active)}
                className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-yellow-400 ${
                  item.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
              <span>{item.press_name?.ko || item.press_name?.en || '언론사명 없음'}</span>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2 border-t border-gray-700">
              <Link 
                href={`/admin/press/${item.slug}/edit`}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                수정
              </Link>
              <button
                onClick={() => handleDelete(item.slug)}
                className="text-red-400 hover:text-red-300 transition-colors text-sm"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {paginationData.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-1">
            {/* 이전 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-l-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 페이지 번호들 */}
            {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
              let pageNum;
              if (paginationData.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= paginationData.totalPages - 2) {
                pageNum = paginationData.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border transition-colors ${
                    currentPage === pageNum
                      ? 'z-10 bg-yellow-400 text-black border-yellow-400'
                      : 'text-gray-300 bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* 다음 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationData.totalPages}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-r-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>

          {/* 페이지 정보 */}
          <div className="ml-6 flex items-center text-sm text-gray-400">
            <span>
              {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, paginationData.total)} / {paginationData.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPressPage; 
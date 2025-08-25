'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '../../../components/Toast';

interface SonaverseStoryItem {
  _id: string;
  slug: string;
  content: {
    ko?: {
      title: string;
      subtitle: string;
    };
    en?: {
      title: string;
      subtitle: string;
    };
  };
  youtube_url?: string;
  created_at: string;
  is_published: boolean;
  tags: string[];
  category?: string;
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: SonaverseStoryItem[];
}

const AdminSonaverseStoryPage: React.FC = () => {
  const { addToast } = useToast();
  const [allSonaverseStories, setAllSonaverseStories] = useState<SonaverseStoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 모든 소나버스 스토리를 가져오기
  useEffect(() => {
    fetchAllSonaverseStories();
  }, []);

  const fetchAllSonaverseStories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sonaverse-story?published=all&pageSize=1000', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAllSonaverseStories(data.results || []);
      setError(null);
    } catch (error) {
      console.error('소나버스 스토리 목록 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '소나버스 스토리 목록을 불러오는데 실패했습니다.');
      addToast({
        type: 'error',
        message: '소나버스 스토리 목록을 불러오는데 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // 검색어로 필터링된 소나버스 스토리들
  const filteredSonaverseStories = useMemo(() => {
    if (!searchTerm.trim()) {
      return allSonaverseStories;
    }
    
    const term = searchTerm.toLowerCase();
    return allSonaverseStories.filter(story => {
      const koTitle = story.content.ko?.title?.toLowerCase() || '';
      const enTitle = story.content.en?.title?.toLowerCase() || '';
      const koSubtitle = story.content.ko?.subtitle?.toLowerCase() || '';
      const enSubtitle = story.content.en?.subtitle?.toLowerCase() || '';
      const slug = story.slug.toLowerCase();
      const tags = story.tags.join(' ').toLowerCase();
      
      return koTitle.includes(term) || 
             enTitle.includes(term) || 
             koSubtitle.includes(term) || 
             enSubtitle.includes(term) || 
             slug.includes(term) || 
             tags.includes(term);
    });
  }, [allSonaverseStories, searchTerm]);

  // 페이지네이션을 위한 현재 페이지 데이터
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const results = filteredSonaverseStories.slice(startIndex, endIndex);
    
    return {
      results,
      total: filteredSonaverseStories.length,
      page: currentPage,
      pageSize,
      totalPages: Math.ceil(filteredSonaverseStories.length / pageSize)
    };
  }, [filteredSonaverseStories, currentPage, pageSize]);

  // 검색어 변경시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`"${title}" 소나버스 스토리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sonaverse-story/${slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      addToast({
        type: 'success',
        message: '소나버스 스토리가 삭제되었습니다.'
      });
      
      fetchAllSonaverseStories();
    } catch (error) {
      console.error('Delete error:', error);
      addToast({
        type: 'error',
        message: '삭제 중 오류가 발생했습니다.'
      });
    }
  };

  const togglePublish = async (slug: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/sonaverse-story/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !currentStatus
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('상태 변경 실패');
      }

      addToast({
        type: 'success',
        message: `소나버스 스토리가 ${!currentStatus ? '공개' : '비공개'} 처리되었습니다.`
      });
      
      fetchAllSonaverseStories();
    } catch (error) {
      console.error('Toggle publish error:', error);
      addToast({
        type: 'error',
        message: '상태 변경 중 오류가 발생했습니다.'
      });
    }
  };

  const renderPagination = () => {
    if (paginatedData.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(paginatedData.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            i === currentPage
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이전
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}
        {pages}
        {endPage < paginatedData.totalPages && (
          <>
            {endPage < paginatedData.totalPages - 1 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => setCurrentPage(paginatedData.totalPages)}
              className="px-3 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              {paginatedData.totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, currentPage + 1))}
          disabled={currentPage === paginatedData.totalPages}
          className="px-3 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">소나버스 스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">오류가 발생했습니다</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchAllSonaverseStories}
          className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-300"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">소나버스 스토리 관리</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-300">소나버스 스토리를 관리하고 새로운 스토리를 작성하세요.</p>
        </div>
        <Link
          href="/admin/sonaverse-story/new"
          className="bg-yellow-400 text-black px-3 sm:px-4 py-2 rounded-md hover:bg-yellow-300 font-medium text-sm sm:text-base text-center"
        >
          새 스토리 작성
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="제목, 부제목, 슬러그, 태그로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            총 {paginatedData.total}개의 스토리
          </div>
        </div>
      </div>

      {/* 소나버스 스토리 목록 */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
        {paginatedData.results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? '검색 결과가 없습니다' : '소나버스 스토리가 없습니다'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? '다른 검색어를 시도해보세요' : '첫 번째 소나버스 스토리를 작성해보세요'}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/sonaverse-story/new"
                className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-300 font-medium"
              >
                새 스토리 작성
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      슬러그
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      태그
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {paginatedData.results.map((story) => (
                    <tr key={story._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {story.content.ko?.title || story.content.en?.title || '제목 없음'}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {story.content.ko?.subtitle || story.content.en?.subtitle || ''}
                          </div>
                          {story.youtube_url && (
                            <div className="text-xs text-red-400 mt-1 flex items-center">
                              <span className="mr-1">🎥</span>
                              YouTube 영상 포함
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-blue-400 bg-gray-900 px-2 py-1 rounded">
                          {story.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublish(story.slug, story.is_published)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            story.is_published
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {story.is_published ? '공개' : '비공개'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {story.category || '미분류'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {story.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {story.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{story.tags.length - 3}개
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(story.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/sonaverse-story/${story.slug}`}
                            target="_blank"
                            className="text-blue-400 hover:text-blue-300"
                            title="미리보기"
                          >
                            👁️
                          </Link>
                          <Link
                            href={`/admin/sonaverse-story/${story.slug}/edit`}
                            className="text-yellow-400 hover:text-yellow-300"
                            title="편집"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(story.slug, story.content.ko?.title || story.content.en?.title || '제목 없음')}
                          className="text-red-400 hover:text-red-300"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-3 space-y-3">
            {paginatedData.results.map((story) => (
              <div key={story._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {story.content.ko?.title || story.content.en?.title || '제목 없음'}
                    </h3>
                    {(story.content.ko?.subtitle || story.content.en?.subtitle) && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {story.content.ko?.subtitle || story.content.en?.subtitle}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <code className="text-xs text-blue-400 bg-gray-800 px-2 py-1 rounded">
                        {story.slug}
                      </code>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {story.category || '미분류'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePublish(story.slug, story.is_published)}
                    className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${
                      story.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {story.is_published ? '공개' : '비공개'}
                  </button>
                </div>
                
                {story.youtube_url && (
                  <div className="text-xs text-red-400 mb-2 flex items-center">
                    <span className="mr-1">🎥</span>
                    YouTube 영상 포함
                  </div>
                )}

                {story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {story.tags.length > 2 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{story.tags.length - 2}개
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                  <span className="text-xs text-gray-400">
                    {new Date(story.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </span>
                  <div className="flex gap-3">
                    <Link
                      href={`/sonaverse-story/${story.slug}`}
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                      title="미리보기"
                    >
                      👁️
                    </Link>
                    <Link
                      href={`/admin/sonaverse-story/${story.slug}/edit`}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                      title="편집"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(story.slug, story.content.ko?.title || story.content.en?.title || '제목 없음')}
                      className="text-red-400 hover:text-red-300 text-sm"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};

export default AdminSonaverseStoryPage;
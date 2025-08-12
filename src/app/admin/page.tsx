'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '../../components/Toast';
import RecentPostModal from '../../components/admin/RecentPostModal';

interface DashboardStats {
  totalPress: number;
  totalSonaverseStories: number;
  totalInquiries: number;
  totalVisitors: number;
  todayVisitors: number;
  yesterdayVisitors: number;
  visitorChangePercent: number;
  visitorChangeType: 'increase' | 'decrease' | 'same';
  recentPosts: Array<{
    type: string;
    title: string;
    slug: string;
    created_at: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalPress: 0,
    totalSonaverseStories: 0,
    totalInquiries: 0,
    totalVisitors: 0,
    todayVisitors: 0,
    yesterdayVisitors: 0,
    visitorChangePercent: 0,
    visitorChangeType: 'same',
    recentPosts: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Response:', res.status, errorText);
        throw new Error(`Failed to fetch stats: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('[대시보드] Error fetching stats:', error);
      addToast({
        type: 'error',
        message: '통계 데이터를 불러오는데 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: '새 언론보도 등록',
      description: '언론보도 자료를 새로 등록합니다',
      href: '/admin/press/new',
      icon: '📰',
      color: 'bg-blue-500'
    },
    {
      title: '새 소나버스 스토리 작성',
      description: '소나버스 스토리 글을 새로 작성합니다',
      href: '/admin/sonaverse-story/new',
      icon: '📝',
      color: 'bg-green-500'
    },
    {
      title: '문의 내역 확인',
      description: '새로운 문의 내역을 확인합니다',
      href: '/admin/inquiries',
      icon: '📧',
      color: 'bg-yellow-500'
    },
    {
      title: '통계 보기',
      description: '상세한 통계를 확인합니다',
      href: '/admin/analytics',
      icon: '📈',
      color: 'bg-indigo-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">관리자 대시보드</h1>
        <p className="mt-2 text-gray-300">(주)소나버스 관리자 시스템에 오신 것을 환영합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/admin/press" className="bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <span className="text-xl sm:text-2xl">📰</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">언론보도</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalPress}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/sonaverse-story" className="bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <span className="text-xl sm:text-2xl">🌟</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">소나버스 스토리</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalSonaverseStories}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/inquiries" className="bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <span className="text-xl sm:text-2xl">📧</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">문의</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalInquiries}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/analytics" className="bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">오늘 방문자</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.todayVisitors}</p>
                <p className="text-xs text-gray-500 truncate">
                  전체: {stats.totalVisitors}명
                </p>
              </div>
            </div>
            
            {/* 증감률 표시 */}
            {stats.visitorChangeType !== 'same' && (
              <div className="flex items-center">
                {stats.visitorChangeType === 'increase' ? (
                  <div className="flex items-center text-blue-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{stats.visitorChangePercent}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{stats.visitorChangePercent}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* 빠른 액션 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">빠른 액션</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-gray-800 rounded-lg shadow p-3 sm:p-6 hover:shadow-lg transition-shadow border border-gray-700 text-center sm:text-left"
            >
              <div className="flex justify-center sm:justify-start items-center mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-400 text-black flex-shrink-0">
                  <span className="text-base sm:text-xl">{action.icon}</span>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1 text-xs sm:text-base leading-tight">{action.title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 최근 업로드된 게시물 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">최근 업로드된 게시물</h2>
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">유형</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">제목</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">업로드 날짜</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {stats.recentPosts.length > 0 ? (
                  stats.recentPosts.slice(0, 5).map((post, index) => (
                    <tr key={index} className="hover:bg-gray-700 cursor-pointer" onClick={() => {
                      setSelectedPost(post);
                      setShowModal(true);
                    }}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.type === 'sonaverse-story' ? 'bg-purple-100 text-purple-800' :
                          post.type === 'press' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <span className="sm:hidden">
                            {post.type === 'sonaverse-story' ? '소나버스' :
                             post.type === 'press' ? '언론' :
                             post.type}
                          </span>
                          <span className="hidden sm:inline">
                            {post.type === 'sonaverse-story' ? '소나버스 스토리' :
                             post.type === 'press' ? '언론보도' :
                             post.type}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-sm text-white">
                          <div className="truncate max-w-xs sm:max-w-sm">{post.title}</div>
                          <div className="text-xs text-gray-400 mt-1 sm:hidden">
                            {new Date(post.created_at).toLocaleDateString('ko-KR', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-400 hidden sm:table-cell">
                        {new Date(post.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500 text-sm sm:text-base">
                      최근 업로드된 게시물이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 최근 게시물 모달 */}
      <RecentPostModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
      />
    </div>
  );
};

export default AdminDashboard; 
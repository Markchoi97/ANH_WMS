'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import { getWorkOrders } from '@/lib/api/workOrders';
import { WorkOrder, WorkStatus, WorkType } from '@/types';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CubeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function OpsBoardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'inbound' | 'outbound' | 'packing'>('all');

  useEffect(() => {
    loadWorkOrders();
  }, []);

  async function loadWorkOrders() {
    try {
      setLoading(true);
      const data = await getWorkOrders();
      setWorkOrders(data);
    } catch (error) {
      console.error('작업 지시서 로딩 실패:', error);
      alert('작업 지시서를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 통계 계산
  const getStats = () => {
    const inboundOrders = workOrders.filter(o => o.type === 'inbound');
    const outboundOrders = workOrders.filter(o => o.type === 'outbound');
    const packingOrders = workOrders.filter(o => o.type === 'packing');

    const countByStatus = (orders: WorkOrder[]) => ({
      planned: orders.filter(o => o.status === 'planned').length,
      inProgress: orders.filter(o => o.status === 'in-progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      overdue: orders.filter(o => o.status === 'overdue').length,
    });

    return {
      inbound: countByStatus(inboundOrders),
      outbound: countByStatus(outboundOrders),
      packing: countByStatus(packingOrders),
    };
  };

  const stats = getStats();

  const filteredOrders = selectedType === 'all' 
    ? workOrders 
    : workOrders.filter(order => order.type === selectedType);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'inbound': return '입고';
      case 'outbound': return '출고';
      case 'packing': return '포장';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inbound': return <ArrowDownTrayIcon className="h-5 w-5" />;
      case 'outbound': return <ArrowUpTrayIcon className="h-5 w-5" />;
      case 'packing': return <CubeIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inbound': return 'bg-green-50 text-green-700 border-green-200';
      case 'outbound': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'packing': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Ops 보드" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Ops 보드" />
      
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        {/* 날짜 표시 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h2>
          <p className="text-gray-600 mt-1">오늘의 작업 현황을 확인하세요</p>
        </div>

        {/* 작업 유형별 진행 현황 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 입고 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <ArrowDownTrayIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">입고</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {stats.inbound.planned + stats.inbound.inProgress + stats.inbound.completed + stats.inbound.overdue}
              </div>
            </div>
            <ProgressBar 
              planned={stats.inbound.planned}
              inProgress={stats.inbound.inProgress}
              completed={stats.inbound.completed}
              overdue={stats.inbound.overdue}
            />
          </div>

          {/* 출고 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <ArrowUpTrayIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">출고</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.outbound.planned + stats.outbound.inProgress + stats.outbound.completed + stats.outbound.overdue}
              </div>
            </div>
            <ProgressBar 
              planned={stats.outbound.planned}
              inProgress={stats.outbound.inProgress}
              completed={stats.outbound.completed}
              overdue={stats.outbound.overdue}
            />
          </div>

          {/* 포장 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-3">
                  <CubeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">포장</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.packing.planned + stats.packing.inProgress + stats.packing.completed + stats.packing.overdue}
              </div>
            </div>
            <ProgressBar 
              planned={stats.packing.planned}
              inProgress={stats.packing.inProgress}
              completed={stats.packing.completed}
              overdue={stats.packing.overdue}
            />
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedType('inbound')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'inbound'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              입고
            </button>
            <button
              onClick={() => setSelectedType('outbound')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'outbound'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              출고
            </button>
            <button
              onClick={() => setSelectedType('packing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'packing'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              포장
            </button>
          </div>
        </div>

        {/* 작업 목록 */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getTypeColor(order.type)}`}>
                      {getTypeIcon(order.type)}
                      {getTypeLabel(order.type)}
                    </span>
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-medium text-gray-600">#{order.id}</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{order.title}</h4>
                  <p className="text-gray-600 mb-3">{order.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">제품:</span>
                      <span className="ml-2 font-medium text-gray-900">{order.productName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">수량:</span>
                      <span className="ml-2 font-medium text-gray-900">{order.quantity} {order.unit}</span>
                    </div>
                    {order.location && (
                      <div>
                        <span className="text-gray-500">위치:</span>
                        <span className="ml-2 font-medium text-gray-900">{order.location}</span>
                      </div>
                    )}
                    {order.assignee && (
                      <div>
                        <span className="text-gray-500">담당자:</span>
                        <span className="ml-2 font-medium text-gray-900">{order.assignee}</span>
                      </div>
                    )}
                  </div>

                  {order.note && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>메모:</strong> {order.note}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(order.dueDate)}</span>
                  </div>
                  {order.status === 'overdue' && (
                    <span className="text-xs text-red-600 font-semibold">지연됨</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">표시할 작업이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}


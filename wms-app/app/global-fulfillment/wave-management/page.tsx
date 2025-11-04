'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import { GlobalWave } from '@/types';

export default function WaveManagementPage() {
  const [waves, setWaves] = useState<GlobalWave[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // TODO: API 호출
    const dummyWaves: GlobalWave[] = [
      {
        id: 'w1',
        waveNumber: 'W-2025-001',
        waveName: '2025년 1월 1차 항공',
        waveType: 'standard',
        shippingMethod: 'air',
        carrier: 'CJ대한통운',
        status: 'in_progress',
        totalOrders: 25,
        completedOrders: 15,
        plannedShipDate: new Date('2025-11-05'),
        cutoffTime: '18:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'w2',
        waveNumber: 'W-2025-002',
        waveName: '2025년 1월 중국 특송',
        waveType: '2B',
        shippingMethod: 'express',
        carrier: '顺丰速运',
        status: 'planned',
        totalOrders: 40,
        completedOrders: 0,
        plannedShipDate: new Date('2025-11-06'),
        cutoffTime: '17:00',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setWaves(dummyWaves);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">파도 관리 (Wave Management)</h1>
          <p className="text-sm text-gray-600 mt-1">
            출고 일정 및 분류 계획을 자동화하고 운송채널별로 묶음 처리합니다
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          새 Wave 생성
        </button>
      </div>

      {/* Wave 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {waves.map((wave) => (
          <WaveCard key={wave.id} wave={wave} />
        ))}
      </div>

      {/* 가이드 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3">💡 Wave 관리 가이드</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• <strong>Standard</strong>: 일반 출고 (혼합 배송)</li>
          <li>• <strong>2B</strong>: 2개 박스 단위 묶음</li>
          <li>• <strong>2S</strong>: 2개 세트 단위 묶음</li>
          <li>• <strong>Pallet</strong>: 팔레트 단위 대량 출고</li>
        </ul>
      </div>
    </div>
  );
}

function WaveCard({ wave }: { wave: GlobalWave }) {
  const progress = wave.totalOrders > 0 ? (wave.completedOrders / wave.totalOrders) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{wave.waveNumber}</h3>
          <p className="text-sm text-gray-600">{wave.waveName}</p>
        </div>
        <WaveStatusBadge status={wave.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">운송 방식</span>
          <span className="font-medium">{getShippingMethodLabel(wave.shippingMethod || '')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">운송사</span>
          <span className="font-medium">{wave.carrier}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Wave 타입</span>
          <WaveTypeBadge type={wave.waveType} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">출고 예정일</span>
          <span className="font-medium">
            {wave.plannedShipDate?.toLocaleDateString('ko-KR')} {wave.cutoffTime}
          </span>
        </div>
      </div>

      {/* 진행률 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">진행률</span>
          <span className="font-semibold">
            {wave.completedOrders} / {wave.totalOrders} ({progress.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
          상세보기
        </button>
        <button className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm font-medium">
          주문 추가
        </button>
      </div>
    </div>
  );
}

function WaveStatusBadge({ status }: { status: string }) {
  const classes: any = {
    planned: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    sorting: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    shipped: 'bg-purple-100 text-purple-700'
  };

  const labels: any = {
    planned: '계획됨',
    in_progress: '진행중',
    sorting: '분류중',
    completed: '완료',
    shipped: '출고됨'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes[status]}`}>
      {labels[status] || status}
    </span>
  );
}

function WaveTypeBadge({ type }: { type: string }) {
  const classes: any = {
    standard: 'bg-blue-100 text-blue-700',
    '2B': 'bg-purple-100 text-purple-700',
    '2S': 'bg-indigo-100 text-indigo-700',
    pallet: 'bg-orange-100 text-orange-700'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[type] || 'bg-gray-100 text-gray-700'}`}>
      {type}
    </span>
  );
}

function getShippingMethodLabel(method: string): string {
  const labels: any = {
    air: '항공',
    sea: '해운',
    express: '특송'
  };
  return labels[method] || method;
}


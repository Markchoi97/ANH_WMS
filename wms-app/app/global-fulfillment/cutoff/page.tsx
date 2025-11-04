'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, BellIcon } from '@heroicons/react/24/outline';
import { GlobalCutoff } from '@/types';

export default function CutoffPage() {
  const [cutoffs, setCutoffs] = useState<GlobalCutoff[]>([]);

  useEffect(() => {
    const dummyData: GlobalCutoff[] = [
      {
        id: '1',
        cutoffName: 'CJ 일일 마감',
        carrier: 'CJ대한통운',
        cutoffType: 'daily',
        cutoffTime: '18:00:00',
        warehouseLocation: '인천창고',
        countryCode: 'KR',
        isActive: true,
        reminderMinutesBefore: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        cutoffName: '顺丰 일일 마감',
        carrier: '顺丰速运',
        cutoffType: 'daily',
        cutoffTime: '17:00:00',
        warehouseLocation: '인천창고',
        countryCode: 'CN',
        isActive: true,
        reminderMinutesBefore: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        cutoffName: 'Lotte 일일 마감',
        carrier: 'Lotte Global',
        cutoffType: 'daily',
        cutoffTime: '16:00:00',
        warehouseLocation: '인천창고',
        countryCode: 'KR',
        isActive: true,
        reminderMinutesBefore: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setCutoffs(dummyData);
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">마감 시간 (Cut-off)</h1>
          <p className="text-sm text-gray-600 mt-1">
            매일/매주 단위 작업 마감 관리 - 현재 시각: <strong>{getCurrentTime()}</strong>
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          + 마감 시간 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cutoffs.map((cutoff) => (
          <div key={cutoff.id} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                cutoff.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {cutoff.isActive ? '활성' : '비활성'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{cutoff.cutoffName}</h3>
            <p className="text-sm text-gray-600 mb-4">{cutoff.carrier}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">마감 시각</span>
                <span className="font-bold text-red-600 text-xl">{cutoff.cutoffTime.slice(0, 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">창고</span>
                <span className="font-medium">{cutoff.warehouseLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">국가</span>
                <span className="font-medium">{cutoff.countryCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">알림</span>
                <span className="font-medium flex items-center gap-1">
                  <BellIcon className="h-4 w-4" />
                  {cutoff.reminderMinutesBefore}분 전
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                편집
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
          <ClockIcon className="h-6 w-6" />
          마감 시간 안내 (发货截止时间)
        </h3>
        <ul className="space-y-2 text-sm text-orange-800">
          <li>• 출고/입고 마감시간을 설정하여 당일 미처리건을 자동으로 리마인드합니다</li>
          <li>• 운송사별 마감시각이 다르므로 정확한 시간 설정이 중요합니다</li>
          <li>• 마감 시간 전 알림을 통해 작업 누락을 방지합니다</li>
        </ul>
      </div>
    </div>
  );
}


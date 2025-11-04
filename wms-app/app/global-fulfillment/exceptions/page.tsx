'use client';

import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { GlobalException } from '@/types';

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<GlobalException[]>([]);
  const [filter, setFilter] = useState<string>('open');

  useEffect(() => {
    // TODO: API 호출
    const dummyData: GlobalException[] = [
      {
        id: '1',
        exceptionNumber: 'EXP-2025-0001',
        orderId: 'o4',
        exceptionType: 'missing_item',
        severity: 'high',
        title: '수량 부족',
        description: '주문 수량 40개 중 5개 누락',
        detectedBy: 'operator',
        detectedAt: new Date('2025-11-03 14:00:00'),
        status: 'open',
        customerNotified: false,
        createdAt: new Date('2025-11-03'),
        updatedAt: new Date('2025-11-03')
      },
      {
        id: '2',
        exceptionNumber: 'EXP-2025-0002',
        orderId: 'o1',
        exceptionType: 'damaged',
        severity: 'medium',
        title: '상품 파손',
        description: '이어폰 박스 2개 손상 발견',
        detectedBy: 'operator',
        detectedAt: new Date('2025-11-03 10:30:00'),
        status: 'investigating',
        customerNotified: true,
        notificationSentAt: new Date('2025-11-03 11:00:00'),
        createdAt: new Date('2025-11-03'),
        updatedAt: new Date('2025-11-03')
      },
      {
        id: '3',
        exceptionNumber: 'EXP-2025-0003',
        orderId: 'o4',
        exceptionType: 'customs_delay',
        severity: 'high',
        title: '통관 지연',
        description: '서류 미비로 통관 지연 중',
        detectedBy: 'system',
        detectedAt: new Date('2025-11-03 16:00:00'),
        status: 'open',
        customerNotified: false,
        createdAt: new Date('2025-11-03'),
        updatedAt: new Date('2025-11-03')
      },
      {
        id: '4',
        exceptionNumber: 'EXP-2025-0004',
        exceptionType: 'weight_mismatch',
        severity: 'low',
        title: '중량 불일치',
        description: '예상 중량 10kg, 실제 9.5kg (-5%)',
        detectedBy: 'system',
        detectedAt: new Date('2025-11-02 15:20:00'),
        status: 'resolved',
        resolvedAt: new Date('2025-11-02 17:00:00'),
        resolutionNotes: '포장재 변경으로 인한 정상 차이',
        customerNotified: false,
        createdAt: new Date('2025-11-02'),
        updatedAt: new Date('2025-11-02')
      }
    ];
    setExceptions(dummyData);
  }, []);

  const filteredExceptions = exceptions.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const handleResolve = (id: string) => {
    setExceptions(exceptions.map(e => 
      e.id === id ? { ...e, status: 'resolved', resolvedAt: new Date() } : e
    ));
  };

  const handleEscalate = (id: string) => {
    setExceptions(exceptions.map(e => 
      e.id === id ? { ...e, status: 'escalated' } : e
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            비정상적인 부분 (Exception Handling)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            전체 프로세스 중 오류/누락건을 집중 관리하고 신속하게 대응합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="전체"
          count={exceptions.length}
          color="gray"
          onClick={() => setFilter('all')}
          active={filter === 'all'}
        />
        <StatCard
          title="미해결"
          count={exceptions.filter(e => e.status === 'open').length}
          color="red"
          onClick={() => setFilter('open')}
          active={filter === 'open'}
        />
        <StatCard
          title="조사중"
          count={exceptions.filter(e => e.status === 'investigating').length}
          color="yellow"
          onClick={() => setFilter('investigating')}
          active={filter === 'investigating'}
        />
        <StatCard
          title="에스컬레이션"
          count={exceptions.filter(e => e.status === 'escalated').length}
          color="orange"
          onClick={() => setFilter('escalated')}
          active={filter === 'escalated'}
        />
        <StatCard
          title="해결됨"
          count={exceptions.filter(e => e.status === 'resolved').length}
          color="green"
          onClick={() => setFilter('resolved')}
          active={filter === 'resolved'}
        />
      </div>

      {/* 이상 목록 */}
      <div className="space-y-4">
        {filteredExceptions.map((exception) => (
          <ExceptionCard
            key={exception.id}
            exception={exception}
            onResolve={handleResolve}
            onEscalate={handleEscalate}
          />
        ))}

        {filteredExceptions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">이상 항목 없음</h3>
            <p className="text-sm text-gray-600">
              현재 {filter === 'all' ? '전체' : getStatusLabel(filter)} 상태의 이상 항목이 없습니다
            </p>
          </div>
        )}
      </div>

      {/* 가이드 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-semibold text-red-900 mb-3">⚠️ 이상 처리 가이드</h3>
        <ul className="space-y-2 text-sm text-red-800">
          <li>• <strong>시스템 자동 탐지</strong>: 누락, 중복, 통관 지연 등을 자동으로 감지합니다</li>
          <li>• <strong>이상처리 보고서</strong>: 일일/주간 보고서가 자동 생성됩니다</li>
          <li>• <strong>고객 알림</strong>: WeChat 또는 이메일로 자동 알림이 전송됩니다</li>
          <li>• <strong>우선순위</strong>: Severity(긴급도)에 따라 처리 우선순위가 결정됩니다</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, count, color, onClick, active }: any) {
  const colors: any = {
    gray: active ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-700 border-gray-200',
    red: active ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border-red-200',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
    orange: active ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 border-orange-200',
    green: active ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} rounded-lg p-4 border transition cursor-pointer hover:shadow-md`}
    >
      <div className="text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold">{count}</div>
    </button>
  );
}

function ExceptionCard({ exception, onResolve, onEscalate }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{exception.title}</h3>
            <SeverityBadge severity={exception.severity} />
            <StatusBadge status={exception.status} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{exception.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>이상번호: <strong>{exception.exceptionNumber}</strong></span>
            {exception.orderId && <span>주문: <strong>{exception.orderId}</strong></span>}
            <span>유형: <strong>{getExceptionTypeLabel(exception.exceptionType)}</strong></span>
            <span>감지: <strong>{exception.detectedBy === 'system' ? '시스템' : '운영자'}</strong></span>
            <span>발생: <strong>{exception.detectedAt.toLocaleString('ko-KR')}</strong></span>
          </div>
        </div>
      </div>

      {/* 고객 알림 상태 */}
      {exception.customerNotified && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800">
            고객 알림 완료 ({exception.notificationSentAt?.toLocaleString('ko-KR')})
          </span>
        </div>
      )}

      {/* 해결 정보 */}
      {exception.status === 'resolved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-green-800 mb-1">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <strong>해결 완료</strong>
          </div>
          {exception.resolutionNotes && (
            <p className="text-sm text-green-700 ml-7">{exception.resolutionNotes}</p>
          )}
          {exception.resolvedAt && (
            <p className="text-xs text-green-600 ml-7 mt-1">
              {exception.resolvedAt.toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      {exception.status !== 'resolved' && exception.status !== 'closed' && (
        <div className="flex gap-2">
          <button
            onClick={() => onResolve(exception.id)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            해결 완료
          </button>
          <button
            onClick={() => onEscalate(exception.id)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
          >
            에스컬레이션
          </button>
          {!exception.customerNotified && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              고객 알림
            </button>
          )}
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
            상세보기
          </button>
        </div>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const classes: any = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const labels: any = {
    low: '낮음',
    medium: '중간',
    high: '높음',
    critical: '긴급'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[severity]}`}>
      🔥 {labels[severity]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: any = {
    open: 'bg-red-100 text-red-700',
    investigating: 'bg-yellow-100 text-yellow-700',
    escalated: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[status]}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function getStatusLabel(status: string): string {
  const labels: any = {
    open: '미해결',
    investigating: '조사중',
    escalated: '에스컬레이션',
    resolved: '해결됨',
    closed: '종료'
  };
  return labels[status] || status;
}

function getExceptionTypeLabel(type: string): string {
  const labels: any = {
    missing_item: '상품 누락',
    duplicate: '중복 주문',
    damaged: '상품 파손',
    customs_delay: '통관 지연',
    wrong_address: '주소 오류',
    weight_mismatch: '중량 불일치',
    system_error: '시스템 오류'
  };
  return labels[type] || type;
}


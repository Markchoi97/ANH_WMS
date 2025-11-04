'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  getMovementHistory,
  getReasonCodes,
  createMovement,
  getCurrentInventory,
} from '@/lib/api/movements';
import type { MovementHistory, ReasonCode, CurrentInventory, MovementType } from '@/types';

export default function MovementsPage() {
  const [history, setHistory] = useState<MovementHistory[]>([]);
  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 작업 생성 폼
  const [createForm, setCreateForm] = useState({
    movementType: 'INBOUND' as MovementType,
    channel: '',
    reasonCode: '',
    memo: '',
    sku: '',
    qtyChange: 0,
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [historyData, reasonData, invData] = await Promise.all([
        getMovementHistory(200),
        getReasonCodes(),
        getCurrentInventory(),
      ]);
      setHistory(historyData);
      setReasonCodes(reasonData);
      setInventory(invData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 작업 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.sku || createForm.qtyChange === 0) {
      alert('SKU와 수량을 입력하세요.');
      return;
    }

    try {
      setProcessing(true);
      await createMovement({
        movementType: createForm.movementType,
        channel: createForm.channel || undefined,
        reasonCode: createForm.reasonCode || undefined,
        memo: createForm.memo || undefined,
        lines: [
          {
            sku: createForm.sku,
            qtyChange: createForm.qtyChange,
          },
        ],
      });

      alert('✅ 작업이 등록되었습니다.');
      setShowCreateForm(false);
      setCreateForm({
        movementType: 'INBOUND',
        channel: '',
        reasonCode: '',
        memo: '',
        sku: '',
        qtyChange: 0,
      });
      await loadData();
    } catch (error: any) {
      console.error('작업 생성 실패:', error);
      alert(`❌ 작업 생성 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // 작업 유형별 색상
  const getTypeColor = (type: MovementType) => {
    switch (type) {
      case 'INBOUND':
        return 'bg-green-100 text-green-800';
      case 'OUTBOUND':
        return 'bg-red-100 text-red-800';
      case 'ADJUST':
        return 'bg-yellow-100 text-yellow-800';
      case 'BUNDLE':
        return 'bg-blue-100 text-blue-800';
      case 'UNBUNDLE':
        return 'bg-purple-100 text-purple-800';
      case 'LABEL':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 작업 유형 한글 라벨
  const getTypeLabel = (type: MovementType) => {
    switch (type) {
      case 'INBOUND':
        return '입고';
      case 'OUTBOUND':
        return '출고';
      case 'ADJUST':
        return '조정';
      case 'BUNDLE':
        return '번들생성';
      case 'UNBUNDLE':
        return '번들해체';
      case 'LABEL':
        return '라벨작업';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="📋 작업 이력" />
        <div className="p-8">
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="📋 작업 이력 (입출고/조정/파손/번들)" />

      <div className="p-8">
        {/* 작업 등록 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">총 {history.length}개의 작업 이력</p>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {showCreateForm ? '❌ 취소' : '➕ 작업 등록'}
          </button>
        </div>

        {/* 작업 등록 폼 */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">➕ 새 작업 등록</h2>

            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">작업 유형 *</label>
                <select
                  value={createForm.movementType}
                  onChange={(e) => setCreateForm({ ...createForm, movementType: e.target.value as MovementType })}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="INBOUND">입고</option>
                  <option value="OUTBOUND">출고</option>
                  <option value="ADJUST">재고조정</option>
                  <option value="LABEL">라벨작업</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">사유 코드</label>
                <select
                  value={createForm.reasonCode}
                  onChange={(e) => setCreateForm({ ...createForm, reasonCode: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">선택하세요</option>
                  {reasonCodes
                    .filter(rc => rc.category.toLowerCase() === createForm.movementType.toLowerCase())
                    .map(rc => (
                      <option key={rc.code} value={rc.code}>
                        {rc.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SKU *</label>
                <select
                  value={createForm.sku}
                  onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">선택하세요</option>
                  {inventory.map(item => (
                    <option key={item.sku} value={item.sku}>
                      {item.name} ({item.sku}) - 현재: {item.qty}개
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">수량 변화 *</label>
                <input
                  type="number"
                  value={createForm.qtyChange}
                  onChange={(e) => setCreateForm({ ...createForm, qtyChange: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="+10 (증가) 또는 -5 (감소)"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  양수: 증가, 음수: 감소
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">채널/거래처</label>
                <input
                  type="text"
                  value={createForm.channel}
                  onChange={(e) => setCreateForm({ ...createForm, channel: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="예: 쿠팡, BK, YBK"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">메모</label>
                <input
                  type="text"
                  value={createForm.memo}
                  onChange={(e) => setCreateForm({ ...createForm, memo: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="선택사항"
                />
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {processing ? '처리 중...' : '✅ 작업 등록'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 작업 이력 테이블 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold">작업 일시</th>
                <th className="p-4 text-left font-semibold">유형</th>
                <th className="p-4 text-left font-semibold">제품</th>
                <th className="p-4 text-right font-semibold">수량 변화</th>
                <th className="p-4 text-left font-semibold">사유</th>
                <th className="p-4 text-left font-semibold">채널</th>
                <th className="p-4 text-left font-semibold">메모</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    등록된 작업 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{item.movedAt.toLocaleDateString('ko-KR')}</div>
                        <div className="text-gray-500">{item.movedAt.toLocaleTimeString('ko-KR')}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(item.movementType)}`}>
                        {getTypeLabel(item.movementType)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{item.productName}</div>
                      <div className="text-sm text-gray-600">{item.sku}</div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-bold ${item.qtyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.qtyChange > 0 ? '+' : ''}{item.qtyChange}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.reasonLabel || item.reasonCode || '-'}
                    </td>
                    <td className="p-4">
                      {item.channel || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {item.memo || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


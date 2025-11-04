'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  getCurrentInventory,
  getBundleCompositions,
  createBundle,
  unbundle,
  getBundleComponentsBySku,
} from '@/lib/api/movements';
import type { CurrentInventory, BundleComposition } from '@/types';

export default function BundleManagementPage() {
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [compositions, setCompositions] = useState<BundleComposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'create' | 'unbundle' | 'composition'>('create');

  // 번들 생성 폼
  const [createForm, setCreateForm] = useState({
    bundleSku: '',
    quantity: 1,
    memo: '',
  });

  // 번들 해체 폼
  const [unbundleForm, setUnbundleForm] = useState({
    bundleSku: '',
    quantity: 1,
    memo: '',
  });

  const [selectedBundleComponents, setSelectedBundleComponents] = useState<BundleComposition[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [invData, compData] = await Promise.all([
        getCurrentInventory(),
        getBundleCompositions(),
      ]);
      setInventory(invData);
      setCompositions(compData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 번들 SKU 목록
  const bundleSkus = Array.from(new Set(inventory
    .filter(item => item.productKind === 'BUNDLE')
    .map(item => item.sku)));

  // 번들 생성
  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.bundleSku || createForm.quantity <= 0) {
      alert('번들 SKU와 수량을 입력하세요.');
      return;
    }

    try {
      setProcessing(true);
      await createBundle({
        bundleSku: createForm.bundleSku,
        quantity: createForm.quantity,
        memo: createForm.memo,
      });
      
      alert(`✅ 번들 생성 완료: ${createForm.bundleSku} x ${createForm.quantity}`);
      setCreateForm({ bundleSku: '', quantity: 1, memo: '' });
      await loadData();
    } catch (error: any) {
      console.error('번들 생성 실패:', error);
      alert(`❌ 번들 생성 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // 번들 해체
  const handleUnbundle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unbundleForm.bundleSku || unbundleForm.quantity <= 0) {
      alert('번들 SKU와 수량을 입력하세요.');
      return;
    }

    try {
      setProcessing(true);
      await unbundle({
        bundleSku: unbundleForm.bundleSku,
        quantity: unbundleForm.quantity,
        memo: unbundleForm.memo,
      });
      
      alert(`✅ 번들 해체 완료: ${unbundleForm.bundleSku} x ${unbundleForm.quantity}`);
      setUnbundleForm({ bundleSku: '', quantity: 1, memo: '' });
      await loadData();
    } catch (error: any) {
      console.error('번들 해체 실패:', error);
      alert(`❌ 번들 해체 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // 번들 구성 조회
  const handleViewComposition = async (bundleSku: string) => {
    try {
      const components = await getBundleComponentsBySku(bundleSku);
      setSelectedBundleComponents(components);
    } catch (error) {
      console.error('구성 조회 실패:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="📦 번들/세트 관리" />
        <div className="p-8">
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="📦 번들/세트 관리" />
      
      <div className="p-8">
        {/* 설명 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 번들/세트 관리란?</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li><strong>번들 생성:</strong> 원품(ORIGINAL)을 묶어서 번들(BUNDLE)로 만듭니다. 원품 재고가 자동으로 차감됩니다.</li>
            <li><strong>번들 해체:</strong> 번들을 풀어서 원품으로 되돌립니다. 원품 재고가 자동으로 복원됩니다.</li>
            <li><strong>예시:</strong> 원품 10개 → 2B(2개입 번들) 5개 만들기 → 원품 10개 차감, 2B 5개 증가</li>
          </ul>
        </div>

        {/* 탭 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ➕ 번들 생성
          </button>
          <button
            onClick={() => setTab('unbundle')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'unbundle'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ➖ 번들 해체
          </button>
          <button
            onClick={() => setTab('composition')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'composition'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 번들 구성 보기
          </button>
        </div>

        {/* 번들 생성 탭 */}
        {tab === 'create' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">➕ 번들 생성</h2>
            
            <form onSubmit={handleCreateBundle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">번들 SKU *</label>
                <select
                  value={createForm.bundleSku}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, bundleSku: e.target.value });
                    if (e.target.value) {
                      handleViewComposition(e.target.value);
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">선택하세요</option>
                  {bundleSkus.map(sku => {
                    const item = inventory.find(i => i.sku === sku);
                    return (
                      <option key={sku} value={sku}>
                        {item?.name} ({sku}) - 현재: {item?.qty}개
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">수량 *</label>
                <input
                  type="number"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">메모</label>
                <textarea
                  value={createForm.memo}
                  onChange={(e) => setCreateForm({ ...createForm, memo: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="선택사항"
                />
              </div>

              {/* 번들 구성 미리보기 */}
              {selectedBundleComponents.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">📋 번들 구성</h3>
                  <ul className="space-y-2">
                    {selectedBundleComponents.map((comp, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{comp.componentName} ({comp.componentSku})</span>
                        <span className="font-semibold">
                          {comp.qtyPerBundle}개 x {createForm.quantity} = {comp.qtyPerBundle * createForm.quantity}개 필요
                          <span className={`ml-2 ${comp.componentStock >= comp.qtyPerBundle * createForm.quantity ? 'text-green-600' : 'text-red-600'}`}>
                            (현재: {comp.componentStock}개)
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {processing ? '처리 중...' : '➕ 번들 생성'}
              </button>
            </form>
          </div>
        )}

        {/* 번들 해체 탭 */}
        {tab === 'unbundle' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">➖ 번들 해체</h2>
            
            <form onSubmit={handleUnbundle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">번들 SKU *</label>
                <select
                  value={unbundleForm.bundleSku}
                  onChange={(e) => {
                    setUnbundleForm({ ...unbundleForm, bundleSku: e.target.value });
                    if (e.target.value) {
                      handleViewComposition(e.target.value);
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">선택하세요</option>
                  {bundleSkus.map(sku => {
                    const item = inventory.find(i => i.sku === sku);
                    return (
                      <option key={sku} value={sku}>
                        {item?.name} ({sku}) - 현재: {item?.qty}개
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">수량 *</label>
                <input
                  type="number"
                  value={unbundleForm.quantity}
                  onChange={(e) => setUnbundleForm({ ...unbundleForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">메모</label>
                <textarea
                  value={unbundleForm.memo}
                  onChange={(e) => setUnbundleForm({ ...unbundleForm, memo: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="선택사항"
                />
              </div>

              {/* 번들 구성 미리보기 */}
              {selectedBundleComponents.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">📋 번들 구성 (해체 시 복원)</h3>
                  <ul className="space-y-2">
                    {selectedBundleComponents.map((comp, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{comp.componentName} ({comp.componentSku})</span>
                        <span className="font-semibold text-green-600">
                          +{comp.qtyPerBundle * unbundleForm.quantity}개 복원
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400"
              >
                {processing ? '처리 중...' : '➖ 번들 해체'}
              </button>
            </form>
          </div>
        )}

        {/* 번들 구성 보기 탭 */}
        {tab === 'composition' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">📋 번들 구성 목록</h2>
            
            {compositions.length === 0 ? (
              <p className="text-gray-500">등록된 번들 구성이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {/* 번들별로 그룹화 */}
                {bundleSkus.map(bundleSku => {
                  const bundleComps = compositions.filter(c => c.bundleSku === bundleSku);
                  if (bundleComps.length === 0) return null;

                  const bundleItem = inventory.find(i => i.sku === bundleSku);

                  return (
                    <div key={bundleSku} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">
                          {bundleComps[0].bundleName} 
                          <span className="ml-2 text-sm text-gray-600">({bundleSku})</span>
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          현재: {bundleItem?.qty || 0}개
                        </span>
                      </div>
                      
                      <table className="w-full">
                        <thead>
                          <tr className="text-left bg-gray-50">
                            <th className="p-2">구성품</th>
                            <th className="p-2">SKU</th>
                            <th className="p-2 text-right">번들당 수량</th>
                            <th className="p-2 text-right">현재 재고</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bundleComps.map((comp, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-2">{comp.componentName}</td>
                              <td className="p-2 text-sm text-gray-600">{comp.componentSku}</td>
                              <td className="p-2 text-right font-semibold">{comp.qtyPerBundle}개</td>
                              <td className="p-2 text-right">
                                <span className={comp.componentStock > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {comp.componentStock}개
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


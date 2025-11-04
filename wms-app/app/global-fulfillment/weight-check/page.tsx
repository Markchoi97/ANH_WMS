'use client';

export default function WeightCheckPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">무게 측정 (Weight Check)</h1>
        <p className="text-sm text-gray-600 mt-1">
          출고 요금 산정 및 중량 검증
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">⚖️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">무게 측정 페이지</h3>
        <p className="text-gray-600">
          바코드 스캔 → 무게값 자동 기록<br/>
          중량오류 자동감지 (허용오차 ±5%)<br/>
          운임 산출 API 연동 (CJ, 로젠, 顺丰 등)
        </p>
      </div>
    </div>
  );
}


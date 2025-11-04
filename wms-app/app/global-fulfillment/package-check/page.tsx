'use client';

export default function PackageCheckPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">패키지 검증 (Package Check)</h1>
        <p className="text-sm text-gray-600 mt-1">
          실제 포장단위(2B, 2S 등) 확인 및 송장 부착
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">패키지 검증 페이지</h3>
        <p className="text-gray-600">
          포장 후 무게 자동기록, 송장 인쇄/라벨 부착<br/>
          포장 완료 스캔 시 출고준비 완료 상태로 전환
        </p>
      </div>
    </div>
  );
}


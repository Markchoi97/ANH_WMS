'use client';

export default function ReturnsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">교환 / 반품 (Exchange / Return)</h1>
        <p className="text-sm text-gray-600 mt-1">
          반품 또는 교환 요청건 처리
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">교환/반품 페이지</h3>
        <p className="text-gray-600">
          송장번호 / 주문번호로 조회<br/>
          반품사유 입력 및 사진 첨부<br/>
          자동 재고복귀 or 폐기처리 옵션
        </p>
      </div>
    </div>
  );
}


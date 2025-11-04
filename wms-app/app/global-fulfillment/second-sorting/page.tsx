'use client';

export default function SecondSortingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">2차 정렬 (Second Sorting)</h1>
        <p className="text-sm text-gray-600 mt-1">
          배송번호 스캔 기반 자동 매칭 및 수취인별 패키지 구성
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2차 정렬 페이지</h3>
        <p className="text-gray-600">
          1차 "창고 단위 분류" → 2차 "바이어 단위 분류" 구조<br/>
          중복상품, 누락상품 검출 및 운송사별 파렛트 구성
        </p>
      </div>
    </div>
  );
}


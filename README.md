# ANH WMS - 창고 관리 시스템

Next.js 기반의 현대적인 창고 관리 시스템 (Warehouse Management System)

## 🚀 주요 기능

### 1. 대시보드
- 실시간 재고 현황 통계
- 금일 입출고 현황
- 재고 부족 경고
- 최근 거래 내역

### 2. 재고 관리
- 제품 등록/수정/삭제
- 재고 수량 관리
- 카테고리별 분류
- 재고 부족 알림

### 3. 입고 관리
- 입고 등록 및 내역 조회
- 공급업체별 입고 현황
- 입고 상태 관리 (대기/완료/취소)
- 입고 통계

### 4. 출고 관리
- 출고 등록 및 내역 조회
- 고객사별 출고 현황
- 출고 상태 관리 (대기/완료/취소)
- 출고 통계

### 5. 거래처 관리
- 공급업체/고객 정보 관리
- 거래처별 거래 내역
- 연락처 정보 관리

### 6. 사용자 관리
- 사용자 계정 관리
- 권한 관리 (관리자/매니저/직원)
- 접근 제어

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Deployment**: Vercel

## 📦 설치 및 실행

### 개발 환경 실행

\`\`\`bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

\`\`\`bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
\`\`\`

## 📁 프로젝트 구조

\`\`\`
wms-app/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 대시보드
│   ├── inventory/         # 재고 관리
│   ├── inbound/           # 입고 관리
│   ├── outbound/          # 출고 관리
│   ├── partners/          # 거래처 관리
│   └── users/             # 사용자 관리
├── components/            # 재사용 가능한 컴포넌트
│   ├── Sidebar.tsx       # 사이드바 네비게이션
│   └── Header.tsx        # 페이지 헤더
├── types/                # TypeScript 타입 정의
│   └── index.ts
├── lib/                  # 유틸리티 및 데이터
│   └── mockData.ts       # 임시 데이터
└── public/               # 정적 파일
\`\`\`

## 🌐 배포

### Vercel 배포
이 프로젝트는 Vercel에 최적화되어 있습니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Markchoi97/ANH_WMS)

## 📝 라이선스

이 프로젝트는 개인 사용을 위한 프로젝트입니다.

## 👨‍💻 개발자

- GitHub: [@Markchoi97](https://github.com/Markchoi97)

## 🔮 향후 개발 계획

- [ ] 백엔드 API 연동
- [ ] 실시간 알림 기능
- [ ] 데이터 엑스포트 (Excel, PDF)
- [ ] 바코드 스캐너 연동
- [ ] 모바일 반응형 최적화
- [ ] 다국어 지원
- [ ] 데이터 시각화 차트
- [ ] 인쇄 기능

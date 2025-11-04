# 📦 번들/세트 자동 재고 관리 시스템 가이드

> ANH WMS - 원품/번들/세트 통합 재고 관리

---

## 🎯 시스템 개요

이 시스템은 **원품(ORIGINAL)**, **번들(BUNDLE)**, **세트(SET)**를 자동으로 관리합니다.

### 핵심 기능

1. **번들 생성**: 원품 → 번들 (원품 자동 차감)
2. **번들 해체**: 번들 → 원품 (원품 자동 복원)
3. **작업 이력**: 모든 입출고/조정/파손 기록
4. **자동 계산**: 번들 작업 시 구성품 자동 증감

---

## 📋 사용 방법

### 1️⃣ 데이터베이스 스키마 실행

**Supabase SQL Editor에서 실행하세요:**

```sql
-- wms-app/supabase-bundle-schema.sql 파일 내용을 복사해서 실행
```

이 스크립트는 다음을 생성합니다:
- ✅ `products` 테이블 확장 (base_name, pack_code, pack_multiplier, product_kind)
- ✅ `bundle_components` 테이블 (번들 구성 정보)
- ✅ `inventory` 테이블 (SKU별 재고)
- ✅ `reason_codes` 테이블 (작업 사유 코드)
- ✅ `movements` 테이블 (작업 헤더)
- ✅ `movement_lines` 테이블 (작업 상세)
- ✅ `movement_effects` 테이블 (번들/해체 자동 효과)
- ✅ `apply_movement()` 함수 (자동 계산)
- ✅ 뷰 3개 (v_current_inventory, v_bundle_composition, v_movement_history)

---

### 2️⃣ 샘플 데이터 입력 (테스트용)

```sql
-- 1. 원품 제품 추가
INSERT INTO products (name, sku, category, unit, min_stock, price, location, base_name, pack_code, pack_multiplier, product_kind, is_active)
VALUES 
  ('리빙말랑귀지킬러', 'LIV-MGGK', '강아지용품', '개', 50, 15000, 'A-01', '리빙말랑귀지킬러', NULL, 1, 'ORIGINAL', true),
  ('리빙말랑귀지킬러 (2B)', 'LIV-MGGK-2B', '강아지용품', '개', 10, 29000, 'A-02', '리빙말랑귀지킬러', '2B', 2, 'BUNDLE', true),
  ('리빙말랑귀지킬러 (3B)', 'LIV-MGGK-3B', '강아지용품', '개', 5, 43000, 'A-03', '리빙말랑귀지킬러', '3B', 3, 'BUNDLE', true);

-- 2. 번들 구성 정의
INSERT INTO bundle_components (bundle_sku, component_sku, qty_per_bundle)
VALUES 
  ('LIV-MGGK-2B', 'LIV-MGGK', 2),  -- 2B는 원품 2개
  ('LIV-MGGK-3B', 'LIV-MGGK', 3);  -- 3B는 원품 3개

-- 3. 초기 재고 설정
INSERT INTO inventory (sku, qty)
VALUES 
  ('LIV-MGGK', 100),     -- 원품 100개
  ('LIV-MGGK-2B', 0),    -- 번들 0개
  ('LIV-MGGK-3B', 0);    -- 번들 0개
```

---

### 3️⃣ 번들 생성 테스트

**방법 1: UI 사용**

1. 좌측 메뉴에서 **"번들/세트 관리"** 클릭
2. **"➕ 번들 생성"** 탭 선택
3. 번들 SKU 선택: `LIV-MGGK-2B`
4. 수량 입력: `5`
5. **"➕ 번들 생성"** 버튼 클릭

**결과:**
- ✅ 원품(`LIV-MGGK`): 100개 → 90개 (10개 차감)
- ✅ 번들(`LIV-MGGK-2B`): 0개 → 5개 (5개 증가)

**방법 2: SQL로 직접 실행**

```sql
-- 번들 생성 (원품 → 2B 번들 5개)
INSERT INTO movements (movement_type, reason_code, memo)
VALUES ('BUNDLE', 'BUNDLE_CREATE', '2B 번들 5개 생성');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES 
  ((SELECT id FROM movements ORDER BY created_at DESC LIMIT 1), 'LIV-MGGK-2B', 5);

-- 자동 적용
SELECT apply_movement((SELECT id FROM movements ORDER BY created_at DESC LIMIT 1));

-- 재고 확인
SELECT * FROM inventory WHERE sku IN ('LIV-MGGK', 'LIV-MGGK-2B');
```

---

### 4️⃣ 번들 해체 테스트

**UI에서:**

1. **"번들/세트 관리"** → **"➖ 번들 해체"** 탭
2. 번들 SKU 선택: `LIV-MGGK-2B`
3. 수량 입력: `2`
4. **"➖ 번들 해체"** 버튼 클릭

**결과:**
- ✅ 번들(`LIV-MGGK-2B`): 5개 → 3개 (2개 감소)
- ✅ 원품(`LIV-MGGK`): 90개 → 94개 (4개 복원)

---

### 5️⃣ 작업 이력 조회

**"작업 이력"** 메뉴에서 모든 작업을 확인할 수 있습니다:

- 📥 입고 (INBOUND)
- 📤 출고 (OUTBOUND)
- 🔧 재고조정 (ADJUST)
- 📦 번들생성 (BUNDLE)
- 📂 번들해체 (UNBUNDLE)
- 🏷️ 라벨작업 (LABEL)

각 작업마다:
- ✅ 작업 일시
- ✅ 제품명/SKU
- ✅ 수량 변화 (+/-)
- ✅ 사유 코드
- ✅ 채널/거래처
- ✅ 메모

---

## 🎨 UI 화면 구성

### 1. 번들/세트 관리 (`/bundle-management`)

**3개 탭:**
- **➕ 번들 생성**: 원품 → 번들
- **➖ 번들 해체**: 번들 → 원품
- **📋 번들 구성 보기**: 모든 번들 구성 목록

**기능:**
- 번들 선택 시 구성품 자동 표시
- 필요/현재 재고 자동 계산
- 재고 부족 시 경고

### 2. 작업 이력 (`/movements`)

**기능:**
- 모든 작업 이력 조회 (최근 200개)
- 작업 유형별 색상 구분
- 새 작업 등록 (입고/출고/조정)

---

## 🔄 작업 흐름

### 번들 생성 흐름

```
1. 사용자: "2B 번들 5개 만들기" 요청
   ↓
2. 시스템: movements 생성
   ↓
3. 시스템: movement_lines 생성 (2B, +5)
   ↓
4. apply_movement() 함수 실행:
   - inventory[2B] += 5 (번들 증가)
   - bundle_components 조회 (2B = 원품 x2)
   - inventory[원품] -= 10 (구성품 차감)
   - movement_effects 기록 (감사 추적)
   ↓
5. 완료!
```

### 번들 해체 흐름

```
1. 사용자: "2B 번들 3개 해체" 요청
   ↓
2. 시스템: movements 생성
   ↓
3. 시스템: movement_lines 생성 (2B, -3)
   ↓
4. apply_movement() 함수 실행:
   - inventory[2B] -= 3 (번들 감소)
   - bundle_components 조회 (2B = 원품 x2)
   - inventory[원품] += 6 (구성품 복원)
   - movement_effects 기록 (감사 추적)
   ↓
5. 완료!
```

---

## 📊 데이터 구조

### Product (제품)

```typescript
{
  sku: 'LIV-MGGK-2B',
  name: '리빙말랑귀지킬러 (2B)',
  baseName: '리빙말랑귀지킬러',
  packCode: '2B',
  packMultiplier: 2,
  productKind: 'BUNDLE',  // ORIGINAL | BUNDLE | SET
  isActive: true
}
```

### BundleComponent (번들 구성)

```typescript
{
  bundleSku: 'LIV-MGGK-2B',
  componentSku: 'LIV-MGGK',
  qtyPerBundle: 2  // 번들 1개당 원품 2개
}
```

### Movement (작업)

```typescript
{
  movementType: 'BUNDLE',      // INBOUND | OUTBOUND | ADJUST | BUNDLE | UNBUNDLE | LABEL
  reasonCode: 'BUNDLE_CREATE',
  channel: 'BK',
  memo: '2B 번들 생성',
  lines: [
    { sku: 'LIV-MGGK-2B', qtyChange: 5 }
  ]
}
```

---

## 🎯 실전 활용

### 시나리오 1: 입고 → 번들 생성 → 출고

```
1. 원품 입고 100개
   INSERT INTO movements (movement_type, reason_code)
   VALUES ('INBOUND', 'RETURN_MILKRUN', ...);

2. 2B 번들 20개 생성
   - 원품 40개 차감
   - 2B 20개 증가

3. 2B 번들 15개 출고
   INSERT INTO movements (movement_type, reason_code)
   VALUES ('OUTBOUND', 'SHIP', ...);
   
결과:
   - 원품: 100 - 40 = 60개
   - 2B: 20 - 15 = 5개
```

### 시나리오 2: 파손 처리

```
원품 5개 파손:

INSERT INTO movements (movement_type, reason_code, memo)
VALUES ('ADJUST', 'DAMAGE', '포장 손상');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES (..., 'LIV-MGGK', -5);

SELECT apply_movement(...);
```

### 시나리오 3: 쿠팡 밀크런 반품

```
2B 번들 3개 반품 입고:

INSERT INTO movements (movement_type, channel, reason_code)
VALUES ('INBOUND', '쿠팡(밀크런)', 'CP_MILKRUN');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES (..., 'LIV-MGGK-2B', 3);

SELECT apply_movement(...);
```

---

## ⚠️ 주의사항

### 1. 재고 부족 시

번들 생성 시 원품 재고가 부족하면:
```
❌ 에러: 재고 부족: LIV-MGGK (필요: 10, 현재: 5)
```

→ 먼저 원품을 입고하거나, 번들 수량을 줄이세요.

### 2. 번들 해체 시

해체할 번들 재고가 부족하면:
```
❌ 에러: 번들 재고 부족: LIV-MGGK-2B (필요: 5, 현재: 2)
```

→ 해체 수량을 줄이세요.

### 3. 데이터 정합성

- ✅ `movement_effects` 테이블에 모든 변경이 기록됩니다
- ✅ 감사 추적이 가능합니다
- ✅ 수동으로 `inventory` 테이블을 직접 수정하지 마세요!

---

## 🚀 다음 단계

### 구현 완료 ✅
1. ✅ DB 스키마 및 함수
2. ✅ TypeScript 타입 정의
3. ✅ API 함수 (movements.ts)
4. ✅ 번들 관리 UI
5. ✅ 작업 이력 UI
6. ✅ 사이드바 메뉴 추가

### 추가 개발 예정 ⏳
7. ⏳ 엑셀 업로드 마법사 (일자별 작업 일괄 등록)
8. ⏳ 재고 조회 개선 (번들 구성 표시)
9. ⏳ 대시보드 확장 (고객별/채널별 통계)
10. ⏳ 샘플 데이터 및 시나리오 테스트

---

## 💡 FAQ

**Q: SET(세트)와 BUNDLE(번들)의 차이는?**
- **BUNDLE**: 내부에서 원품을 묶어서 만든 번들 (예: 2B, 3B)
- **SET**: 제조사/공급사에서 이미 세트로 들어온 상품 (예: 2S, 5S)
- SET도 필요 시 해체 가능 (옵션)

**Q: 번들 구성을 어떻게 정의하나요?**
```sql
INSERT INTO bundle_components (bundle_sku, component_sku, qty_per_bundle)
VALUES ('LIV-MGGK-2B', 'LIV-MGGK', 2);
```

**Q: 작업을 취소/수정하려면?**
- 현재는 반대 작업을 등록하세요 (예: 번들 생성 취소 = 번들 해체)
- 추후 작업 취소 기능 추가 예정

**Q: 여러 SKU를 한 번에 처리하려면?**
```typescript
await createMovement({
  movementType: 'INBOUND',
  lines: [
    { sku: 'SKU-001', qtyChange: 10 },
    { sku: 'SKU-002', qtyChange: 20 },
    { sku: 'SKU-003', qtyChange: 15 },
  ]
});
```

---

## 📞 지원

문제가 발생하면:
1. Supabase SQL Editor에서 쿼리 실행 확인
2. 브라우저 개발자 도구 콘솔 확인
3. `movement_effects` 테이블로 감사 추적

---

**🎉 번들/세트 자동 재고 관리로 업무 효율 10배 향상!**


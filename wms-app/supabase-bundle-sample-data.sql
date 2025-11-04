-- ========================================
-- 번들/세트 재고 관리 샘플 데이터
-- ========================================

-- 1. 원품 및 번들 제품 추가
INSERT INTO products (name, sku, category, unit, min_stock, price, location, base_name, pack_code, pack_multiplier, product_kind, is_active)
VALUES 
  -- 원품
  ('리빙말랑귀지킬러', 'LIV-MGGK', '강아지용품', '개', 50, 15000, 'A-01', '리빙말랑귀지킬러', NULL, 1, 'ORIGINAL', true),
  ('멍냥이애견간식', 'MGN-SNACK', '강아지간식', '개', 30, 8000, 'A-02', '멍냥이애견간식', NULL, 1, 'ORIGINAL', true),
  ('고양이츄르', 'CAT-CHURU', '고양이간식', '개', 100, 1500, 'B-01', '고양이츄르', NULL, 1, 'ORIGINAL', true),
  
  -- 번들 (2B, 3B)
  ('리빙말랑귀지킬러 (2B)', 'LIV-MGGK-2B', '강아지용품', '개', 10, 29000, 'A-03', '리빙말랑귀지킬러', '2B', 2, 'BUNDLE', true),
  ('리빙말랑귀지킬러 (3B)', 'LIV-MGGK-3B', '강아지용품', '개', 5, 43000, 'A-04', '리빙말랑귀지킬러', '3B', 3, 'BUNDLE', true),
  ('멍냥이애견간식 (2B)', 'MGN-SNACK-2B', '강아지간식', '개', 10, 15000, 'A-05', '멍냥이애견간식', '2B', 2, 'BUNDLE', true),
  ('고양이츄르 (5B)', 'CAT-CHURU-5B', '고양이간식', '개', 20, 7000, 'B-02', '고양이츄르', '5B', 5, 'BUNDLE', true),
  
  -- 세트 (공급사에서 이미 세트로 들어옴)
  ('리빙말랑귀지킬러 (2S)', 'LIV-MGGK-2S', '강아지용품', '세트', 5, 28000, 'A-06', '리빙말랑귀지킬러', '2S', 2, 'SET', true)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  base_name = EXCLUDED.base_name,
  pack_code = EXCLUDED.pack_code,
  pack_multiplier = EXCLUDED.pack_multiplier,
  product_kind = EXCLUDED.product_kind,
  is_active = EXCLUDED.is_active;

-- 2. 번들 구성 정의 (번들 1개당 원품이 몇 개 들어가는지)
INSERT INTO bundle_components (bundle_sku, component_sku, qty_per_bundle)
VALUES 
  -- 리빙말랑귀지킬러 번들
  ('LIV-MGGK-2B', 'LIV-MGGK', 2),  -- 2B = 원품 2개
  ('LIV-MGGK-3B', 'LIV-MGGK', 3),  -- 3B = 원품 3개
  
  -- 멍냥이애견간식 번들
  ('MGN-SNACK-2B', 'MGN-SNACK', 2), -- 2B = 원품 2개
  
  -- 고양이츄르 번들
  ('CAT-CHURU-5B', 'CAT-CHURU', 5), -- 5B = 원품 5개
  
  -- 세트 (SET도 필요 시 해체 가능하도록 구성 정의)
  ('LIV-MGGK-2S', 'LIV-MGGK', 2)   -- 2S = 원품 2개 (해체 시)
ON CONFLICT (bundle_sku, component_sku) DO UPDATE SET
  qty_per_bundle = EXCLUDED.qty_per_bundle;

-- 3. 초기 재고 설정
INSERT INTO inventory (sku, qty)
VALUES 
  -- 원품 초기 재고
  ('LIV-MGGK', 100),
  ('MGN-SNACK', 80),
  ('CAT-CHURU', 200),
  
  -- 번들/세트 초기 재고 (0개로 시작)
  ('LIV-MGGK-2B', 0),
  ('LIV-MGGK-3B', 0),
  ('MGN-SNACK-2B', 0),
  ('CAT-CHURU-5B', 0),
  ('LIV-MGGK-2S', 10)  -- 세트는 공급사에서 이미 10개 들어옴
ON CONFLICT (sku) DO UPDATE SET
  qty = EXCLUDED.qty;

-- 4. 샘플 작업 이력 생성 (시나리오)

-- 시나리오 1: 원품 입고
INSERT INTO movements (movement_type, channel, reason_code, memo, moved_at)
VALUES ('INBOUND', 'BK', 'RETURN_MILKRUN', '밀크런 반품 입고', now() - interval '5 days');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES 
  ((SELECT id FROM movements WHERE memo = '밀크런 반품 입고'), 'LIV-MGGK', 50);

SELECT apply_movement((SELECT id FROM movements WHERE memo = '밀크런 반품 입고'));

-- 시나리오 2: 2B 번들 10개 생성
INSERT INTO movements (movement_type, reason_code, memo, moved_at)
VALUES ('BUNDLE', 'BUNDLE_CREATE', '2B 번들 10개 생성', now() - interval '4 days');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES 
  ((SELECT id FROM movements WHERE memo = '2B 번들 10개 생성'), 'LIV-MGGK-2B', 10);

SELECT apply_movement((SELECT id FROM movements WHERE memo = '2B 번들 10개 생성'));

-- 시나리오 3: 3B 번들 5개 생성
INSERT INTO movements (movement_type, reason_code, memo, moved_at)
VALUES ('BUNDLE', 'BUNDLE_CREATE', '3B 번들 5개 생성', now() - interval '3 days');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES 
  ((SELECT id FROM movements WHERE memo = '3B 번들 5개 생성'), 'LIV-MGGK-3B', 5);

SELECT apply_movement((SELECT id FROM movements WHERE memo = '3B 번들 5개 생성'));

-- 시나리오 4: 2B 번들 출고
INSERT INTO movements (movement_type, channel, reason_code, memo, moved_at)
VALUES ('OUTBOUND', '쿠팡', 'SHIP', '쿠팡 주문 출고', now() - interval '2 days');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES 
  ((SELECT id FROM movements WHERE memo = '쿠팡 주문 출고'), 'LIV-MGGK-2B', -7);

SELECT apply_movement((SELECT id FROM movements WHERE memo = '쿠팡 주문 출고'));

-- 시나리오 5: 원품 파손
INSERT INTO movements (movement_type, reason_code, memo, moved_at)
VALUES ('ADJUST', 'DAMAGE', '포장 파손', now() - interval '1 day');

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES 
  ((SELECT id FROM movements WHERE memo = '포장 파손'), 'LIV-MGGK', -5);

SELECT apply_movement((SELECT id FROM movements WHERE memo = '포장 파손'));

-- 시나리오 6: 3B 번들 2개 해체 (취소/반품 등의 이유)
INSERT INTO movements (movement_type, reason_code, memo, moved_at)
VALUES ('UNBUNDLE', 'BUNDLE_BREAK', '3B 번들 2개 해체', now());

INSERT INTO movement_lines (movement_id, sku, qty_change)
VALUES 
  ((SELECT id FROM movements WHERE memo = '3B 번들 2개 해체'), 'LIV-MGGK-3B', -2);

SELECT apply_movement((SELECT id FROM movements WHERE memo = '3B 번들 2개 해체'));

-- ========================================
-- 검증 쿼리
-- ========================================

-- 현재 재고 확인
SELECT 
  '=== 현재 재고 ===' as title,
  sku,
  name,
  pack_code,
  product_kind,
  qty,
  min_stock
FROM v_current_inventory
ORDER BY base_name, pack_multiplier;

-- 번들 구성 확인
SELECT 
  '=== 번들 구성 ===' as title,
  bundle_name,
  component_name,
  qty_per_bundle,
  component_stock
FROM v_bundle_composition;

-- 작업 이력 확인
SELECT 
  '=== 작업 이력 ===' as title,
  moved_at,
  movement_type,
  product_name,
  qty_change,
  reason_label,
  memo
FROM v_movement_history
ORDER BY moved_at DESC
LIMIT 20;

-- 번들 생성/해체 효과 확인
SELECT 
  '=== 번들 효과 로그 ===' as title,
  me.created_at,
  m.movement_type,
  me.source_sku,
  me.target_sku,
  me.qty_change,
  me.note
FROM movement_effects me
JOIN movements m ON me.movement_id = m.id
ORDER BY me.created_at DESC;

-- 예상 재고 계산 (검증용)
SELECT 
  '=== 재고 검증 ===' as title,
  'LIV-MGGK (원품)' as item,
  '100 (초기) + 50 (입고) - 20 (2B 생성) - 15 (3B 생성) - 5 (파손) + 6 (3B 해체) = 116개' as expected,
  (SELECT qty FROM inventory WHERE sku = 'LIV-MGGK') as actual
UNION ALL
SELECT 
  '=== 재고 검증 ===' as title,
  'LIV-MGGK-2B (2B번들)' as item,
  '0 (초기) + 10 (생성) - 7 (출고) = 3개' as expected,
  (SELECT qty FROM inventory WHERE sku = 'LIV-MGGK-2B') as actual
UNION ALL
SELECT 
  '=== 재고 검증 ===' as title,
  'LIV-MGGK-3B (3B번들)' as item,
  '0 (초기) + 5 (생성) - 2 (해체) = 3개' as expected,
  (SELECT qty FROM inventory WHERE sku = 'LIV-MGGK-3B') as actual;

-- 완료 메시지
SELECT 
  '✅ 샘플 데이터 입력 완료!' as status,
  (SELECT COUNT(*) FROM products WHERE product_kind IN ('BUNDLE', 'SET')) as bundle_count,
  (SELECT COUNT(*) FROM bundle_components) as component_count,
  (SELECT COUNT(*) FROM inventory) as inventory_count,
  (SELECT COUNT(*) FROM movements) as movement_count,
  (SELECT COUNT(*) FROM movement_effects) as effect_count;


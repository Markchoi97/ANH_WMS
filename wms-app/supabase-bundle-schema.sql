-- ========================================
-- ANH WMS - 번들/세트 재고 관리 시스템
-- ========================================
-- 설명: 원품(ORIGINAL), 번들(BUNDLE), 세트(SET) 재고를 자동으로 관리
-- 기능: 번들 생성 시 원품 차감, 해체 시 원품 복원, 전체 이력 추적
-- ========================================

-- ========================================
-- 1. 기존 products 테이블 확장
-- ========================================

-- 새 컬럼 추가 (기존 테이블이 있다면)
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS base_name TEXT,
  ADD COLUMN IF NOT EXISTS pack_code TEXT,
  ADD COLUMN IF NOT EXISTS pack_multiplier INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS product_kind TEXT CHECK (product_kind IN ('ORIGINAL', 'BUNDLE', 'SET')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 기존 데이터를 위한 기본값 설정
UPDATE products 
SET 
  base_name = COALESCE(base_name, name),
  pack_multiplier = COALESCE(pack_multiplier, 1),
  product_kind = COALESCE(product_kind, 'ORIGINAL'),
  is_active = COALESCE(is_active, true)
WHERE base_name IS NULL OR pack_multiplier IS NULL OR product_kind IS NULL OR is_active IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_products_kind ON products(product_kind);
CREATE INDEX IF NOT EXISTS idx_products_base_name ON products(base_name);

COMMENT ON COLUMN products.base_name IS '제품 기본명 (예: "리빙말랑귀지킬러")';
COMMENT ON COLUMN products.pack_code IS '포장 코드 (예: "2B", "3B", "2S", null=원품)';
COMMENT ON COLUMN products.pack_multiplier IS '포장 배수 (2B=2, 3B=3, 원품=1)';
COMMENT ON COLUMN products.product_kind IS '제품 구분 (ORIGINAL: 원품, BUNDLE: 내부번들, SET: 외부세트)';
COMMENT ON COLUMN products.is_active IS '활성 여부 (true: 사용중, false: 비활성)';

-- ========================================
-- 2. 번들 구성 테이블
-- ========================================

CREATE TABLE IF NOT EXISTS bundle_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_sku TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
  component_sku TEXT NOT NULL REFERENCES products(sku) ON DELETE RESTRICT,
  qty_per_bundle INTEGER NOT NULL CHECK (qty_per_bundle > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bundle_sku, component_sku)
);

CREATE INDEX IF NOT EXISTS idx_bundle_components_bundle ON bundle_components(bundle_sku);
CREATE INDEX IF NOT EXISTS idx_bundle_components_component ON bundle_components(component_sku);

COMMENT ON TABLE bundle_components IS '번들/세트 구성품 정보 (번들 1개당 원품이 몇 개 들어가는지)';
COMMENT ON COLUMN bundle_components.bundle_sku IS '번들/세트 SKU';
COMMENT ON COLUMN bundle_components.component_sku IS '구성품 SKU (보통 ORIGINAL)';
COMMENT ON COLUMN bundle_components.qty_per_bundle IS '번들 1개당 구성품 수량';

-- ========================================
-- 3. 재고 스냅샷 테이블
-- ========================================

CREATE TABLE IF NOT EXISTS inventory (
  sku TEXT PRIMARY KEY REFERENCES products(sku) ON DELETE CASCADE,
  qty BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_qty ON inventory(qty);

COMMENT ON TABLE inventory IS 'SKU별 현재 재고 수량 (실시간 스냅샷)';

-- ========================================
-- 4. 작업 사유 코드
-- ========================================

CREATE TABLE IF NOT EXISTS reason_codes (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('INBOUND', 'OUTBOUND', 'ADJUST', 'PROCESS')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reason_codes IS '작업 사유 코드 (파손, 반품, 조정 등)';

-- 기본 사유 코드 삽입
INSERT INTO reason_codes (code, label, category) VALUES
  ('DAMAGE', '파손', 'ADJUST'),
  ('RETURN_B2C', '반품(B2C)', 'INBOUND'),
  ('RETURN_MILKRUN', '반품(밀크런)', 'INBOUND'),
  ('CP_MILKRUN', '쿠팡(밀크런)', 'INBOUND'),
  ('ADJ_PLUS', '재고조정(+)', 'ADJUST'),
  ('ADJ_MINUS', '재고조정(–)', 'ADJUST'),
  ('BUNDLE_CREATE', '번들생성', 'PROCESS'),
  ('BUNDLE_BREAK', '번들해체', 'PROCESS'),
  ('LABEL', '라벨작업', 'PROCESS'),
  ('SHIP', '택배(출고)', 'OUTBOUND'),
  ('INITIAL', '초기재고', 'ADJUST')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 5. 작업 헤더 (movements)
-- ========================================

CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_type TEXT NOT NULL CHECK (movement_type IN 
    ('INBOUND', 'OUTBOUND', 'ADJUST', 'BUNDLE', 'UNBUNDLE', 'LABEL')),
  channel TEXT,
  reason_code TEXT REFERENCES reason_codes(code),
  memo TEXT,
  moved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movements_type ON movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(moved_at);
CREATE INDEX IF NOT EXISTS idx_movements_reason ON movements(reason_code);

COMMENT ON TABLE movements IS '작업 헤더 (입출고, 조정, 번들/해체 등)';
COMMENT ON COLUMN movements.movement_type IS '작업 유형';
COMMENT ON COLUMN movements.channel IS '채널/거래처 (쿠팡, BK, YBK 등)';
COMMENT ON COLUMN movements.moved_at IS '작업 일시';

-- ========================================
-- 6. 작업 라인 (movement_lines)
-- ========================================

CREATE TABLE IF NOT EXISTS movement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
  sku TEXT NOT NULL REFERENCES products(sku) ON DELETE RESTRICT,
  qty_change BIGINT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(movement_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_movement_lines_movement ON movement_lines(movement_id);
CREATE INDEX IF NOT EXISTS idx_movement_lines_sku ON movement_lines(sku);

COMMENT ON TABLE movement_lines IS '작업 상세 라인 (어느 SKU가 몇 개 증감되는지)';
COMMENT ON COLUMN movement_lines.qty_change IS '수량 변화 (+: 증가, -: 감소)';

-- ========================================
-- 7. 번들/해체 자동 효과 로그
-- ========================================

CREATE TABLE IF NOT EXISTS movement_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
  source_sku TEXT NOT NULL,
  target_sku TEXT NOT NULL,
  qty_change BIGINT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movement_effects_movement ON movement_effects(movement_id);
CREATE INDEX IF NOT EXISTS idx_movement_effects_source ON movement_effects(source_sku);
CREATE INDEX IF NOT EXISTS idx_movement_effects_target ON movement_effects(target_sku);

COMMENT ON TABLE movement_effects IS '번들/해체 시 자동 생성되는 구성품 증감 이력 (감사 추적용)';
COMMENT ON COLUMN movement_effects.source_sku IS '소스 SKU (차감되는 쪽)';
COMMENT ON COLUMN movement_effects.target_sku IS '타겟 SKU (증가되는 쪽)';

-- ========================================
-- 8. 번들/해체 자동 처리 함수
-- ========================================

CREATE OR REPLACE FUNCTION apply_movement(mov_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  m movements;
  l record;
  comp record;
  current_qty BIGINT;
BEGIN
  -- 작업 정보 조회
  SELECT * INTO m FROM movements WHERE id = mov_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Movement not found: %', mov_id;
  END IF;

  -- 각 라인 처리
  FOR l IN SELECT * FROM movement_lines WHERE movement_id = mov_id LOOP
    
    -- 1) 일반 작업 (INBOUND, OUTBOUND, ADJUST, LABEL)
    IF m.movement_type IN ('INBOUND', 'OUTBOUND', 'ADJUST', 'LABEL') THEN
      -- 재고 업데이트
      UPDATE inventory 
      SET qty = qty + l.qty_change, updated_at = now()
      WHERE sku = l.sku;
      
      IF NOT FOUND THEN
        INSERT INTO inventory(sku, qty) VALUES (l.sku, l.qty_change);
      END IF;

    -- 2) 번들 생성 (BUNDLE)
    ELSIF m.movement_type = 'BUNDLE' THEN
      -- 번들 재고 증가
      UPDATE inventory 
      SET qty = qty + l.qty_change, updated_at = now()
      WHERE sku = l.sku;
      
      IF NOT FOUND THEN
        INSERT INTO inventory(sku, qty) VALUES (l.sku, l.qty_change);
      END IF;
      
      -- 구성품 차감
      FOR comp IN
        SELECT component_sku, qty_per_bundle 
        FROM bundle_components 
        WHERE bundle_sku = l.sku
      LOOP
        -- 재고 확인
        SELECT qty INTO current_qty FROM inventory WHERE sku = comp.component_sku;
        IF current_qty IS NULL THEN
          current_qty := 0;
        END IF;
        
        IF current_qty < (comp.qty_per_bundle * l.qty_change) THEN
          RAISE EXCEPTION '재고 부족: % (필요: %, 현재: %)', 
            comp.component_sku, 
            comp.qty_per_bundle * l.qty_change, 
            current_qty;
        END IF;
        
        -- 구성품 차감
        UPDATE inventory 
        SET qty = qty - (comp.qty_per_bundle * l.qty_change), updated_at = now()
        WHERE sku = comp.component_sku;
        
        -- 효과 로그 기록
        INSERT INTO movement_effects(movement_id, source_sku, target_sku, qty_change, note)
        VALUES (
          mov_id, 
          comp.component_sku, 
          l.sku, 
          -(comp.qty_per_bundle * l.qty_change), 
          format('번들 생성: %s → %s', comp.component_sku, l.sku)
        );
      END LOOP;

    -- 3) 번들 해체 (UNBUNDLE)
    ELSIF m.movement_type = 'UNBUNDLE' THEN
      -- 번들 재고 감소 (qty_change는 보통 음수로 들어옴)
      SELECT qty INTO current_qty FROM inventory WHERE sku = l.sku;
      IF current_qty IS NULL OR current_qty < ABS(l.qty_change) THEN
        RAISE EXCEPTION '번들 재고 부족: % (필요: %, 현재: %)', 
          l.sku, 
          ABS(l.qty_change), 
          COALESCE(current_qty, 0);
      END IF;
      
      UPDATE inventory 
      SET qty = qty + l.qty_change, updated_at = now()
      WHERE sku = l.sku;
      
      -- 구성품 복원
      FOR comp IN
        SELECT component_sku, qty_per_bundle 
        FROM bundle_components 
        WHERE bundle_sku = l.sku
      LOOP
        -- 구성품 증가 (qty_change가 음수이므로 ABS 처리)
        UPDATE inventory 
        SET qty = qty + (comp.qty_per_bundle * ABS(l.qty_change)), updated_at = now()
        WHERE sku = comp.component_sku;
        
        IF NOT FOUND THEN
          INSERT INTO inventory(sku, qty) 
          VALUES (comp.component_sku, comp.qty_per_bundle * ABS(l.qty_change));
        END IF;
        
        -- 효과 로그 기록
        INSERT INTO movement_effects(movement_id, source_sku, target_sku, qty_change, note)
        VALUES (
          mov_id, 
          l.sku, 
          comp.component_sku, 
          comp.qty_per_bundle * ABS(l.qty_change), 
          format('번들 해체: %s → %s', l.sku, comp.component_sku)
        );
      END LOOP;
    END IF;
    
  END LOOP;
END $$;

COMMENT ON FUNCTION apply_movement IS '작업 적용 함수 (번들/해체 시 구성품 자동 계산)';

-- ========================================
-- 9. RLS (Row Level Security) 정책
-- ========================================

ALTER TABLE bundle_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE reason_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_effects ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 먼저 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON bundle_components;
DROP POLICY IF EXISTS "Enable read access for all users" ON inventory;
DROP POLICY IF EXISTS "Enable read access for all users" ON reason_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON movements;
DROP POLICY IF EXISTS "Enable read access for all users" ON movement_lines;
DROP POLICY IF EXISTS "Enable read access for all users" ON movement_effects;

DROP POLICY IF EXISTS "Enable write access for all users" ON bundle_components;
DROP POLICY IF EXISTS "Enable write access for all users" ON inventory;
DROP POLICY IF EXISTS "Enable write access for all users" ON reason_codes;
DROP POLICY IF EXISTS "Enable write access for all users" ON movements;
DROP POLICY IF EXISTS "Enable write access for all users" ON movement_lines;
DROP POLICY IF EXISTS "Enable write access for all users" ON movement_effects;

-- 읽기 권한 (모두)
CREATE POLICY "Enable read access for all users" ON bundle_components FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON inventory FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON reason_codes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON movements FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON movement_lines FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON movement_effects FOR SELECT USING (true);

-- 쓰기 권한 (모두 - 추후 인증 추가 가능)
CREATE POLICY "Enable write access for all users" ON bundle_components FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON inventory FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON reason_codes FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON movements FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON movement_lines FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON movement_effects FOR ALL USING (true);

-- ========================================
-- 10. 유용한 뷰
-- ========================================

-- 현재 재고 (제품 정보와 함께)
CREATE OR REPLACE VIEW v_current_inventory AS
SELECT 
  p.sku,
  p.name,
  p.base_name,
  p.pack_code,
  p.pack_multiplier,
  p.product_kind,
  p.category,
  p.unit,
  p.location,
  COALESCE(i.qty, 0) as qty,
  p.min_stock,
  i.updated_at as last_updated
FROM products p
LEFT JOIN inventory i ON p.sku = i.sku
WHERE p.is_active = true
ORDER BY p.base_name, p.pack_multiplier;

-- 번들 구성 정보 (보기 쉽게)
CREATE OR REPLACE VIEW v_bundle_composition AS
SELECT 
  bc.bundle_sku,
  pb.name as bundle_name,
  pb.pack_code,
  bc.component_sku,
  pc.name as component_name,
  bc.qty_per_bundle,
  COALESCE(i.qty, 0) as component_stock
FROM bundle_components bc
JOIN products pb ON bc.bundle_sku = pb.sku
JOIN products pc ON bc.component_sku = pc.sku
LEFT JOIN inventory i ON bc.component_sku = i.sku;

-- 작업 이력 (상세)
CREATE OR REPLACE VIEW v_movement_history AS
SELECT 
  m.id,
  m.movement_type,
  m.channel,
  m.reason_code,
  rc.label as reason_label,
  m.memo,
  m.moved_at,
  ml.sku,
  p.name as product_name,
  ml.qty_change,
  m.created_by,
  m.created_at
FROM movements m
JOIN movement_lines ml ON m.id = ml.movement_id
JOIN products p ON ml.sku = p.sku
LEFT JOIN reason_codes rc ON m.reason_code = rc.code
ORDER BY m.moved_at DESC, m.created_at DESC;

COMMENT ON VIEW v_current_inventory IS '현재 재고 조회 (제품 정보 포함)';
COMMENT ON VIEW v_bundle_composition IS '번들 구성 정보 조회';
COMMENT ON VIEW v_movement_history IS '작업 이력 조회 (상세)';

-- ========================================
-- 완료!
-- ========================================

-- 확인용 쿼리
SELECT 
  '✅ 번들/세트 재고 관리 스키마 생성 완료!' as status,
  (SELECT COUNT(*) FROM bundle_components) as bundle_components_count,
  (SELECT COUNT(*) FROM inventory) as inventory_count,
  (SELECT COUNT(*) FROM reason_codes) as reason_codes_count,
  (SELECT COUNT(*) FROM movements) as movements_count;


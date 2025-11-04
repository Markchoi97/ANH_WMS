-- ANH WMS Database Schema
-- Supabase에서 SQL Editor를 열고 이 스크립트를 실행하세요

-- 제품 테이블
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '개',
  min_stock INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 거래처 테이블
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('supplier', 'customer', 'both')),
  contact TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 입고 테이블
CREATE TABLE IF NOT EXISTS inbounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  supplier_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  inbound_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 출고 테이블
CREATE TABLE IF NOT EXISTS outbounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  customer_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  outbound_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 작업 지시 테이블
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('inbound', 'outbound', 'packing')),
  title TEXT NOT NULL,
  description TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  location TEXT,
  assignee TEXT,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in-progress', 'completed', 'overdue', 'on-hold')),
  due_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  note TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 내 작업 테이블
CREATE TABLE IF NOT EXISTS my_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('inbound', 'outbound', 'packing')),
  title TEXT NOT NULL,
  description TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in-progress', 'completed', 'overdue', 'on-hold')),
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  barcode TEXT,
  qr_code TEXT,
  note TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_inbounds_date ON inbounds(inbound_date);
CREATE INDEX IF NOT EXISTS idx_outbounds_date ON outbounds(outbound_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_my_tasks_status ON my_tasks(status);

-- Row Level Security (RLS) 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 먼저 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON partners;
DROP POLICY IF EXISTS "Enable read access for all users" ON inbounds;
DROP POLICY IF EXISTS "Enable read access for all users" ON outbounds;
DROP POLICY IF EXISTS "Enable read access for all users" ON work_orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON my_tasks;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

DROP POLICY IF EXISTS "Enable insert for all users" ON products;
DROP POLICY IF EXISTS "Enable update for all users" ON products;
DROP POLICY IF EXISTS "Enable delete for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for all users" ON partners;
DROP POLICY IF EXISTS "Enable update for all users" ON partners;
DROP POLICY IF EXISTS "Enable delete for all users" ON partners;
DROP POLICY IF EXISTS "Enable insert for all users" ON inbounds;
DROP POLICY IF EXISTS "Enable update for all users" ON inbounds;
DROP POLICY IF EXISTS "Enable delete for all users" ON inbounds;
DROP POLICY IF EXISTS "Enable insert for all users" ON outbounds;
DROP POLICY IF EXISTS "Enable update for all users" ON outbounds;
DROP POLICY IF EXISTS "Enable delete for all users" ON outbounds;
DROP POLICY IF EXISTS "Enable insert for all users" ON work_orders;
DROP POLICY IF EXISTS "Enable update for all users" ON work_orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON work_orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON my_tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON my_tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON my_tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for all users" ON users;

-- 모든 사용자에게 읽기 권한 부여 (개발 단계용)
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON partners FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON inbounds FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON outbounds FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON work_orders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON my_tasks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);

-- 모든 사용자에게 쓰기 권한 부여 (개발 단계용)
CREATE POLICY "Enable insert for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON products FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON partners FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON partners FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON inbounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON inbounds FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON inbounds FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON outbounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON outbounds FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON outbounds FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON work_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON work_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON work_orders FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON my_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON my_tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON my_tasks FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);

-- 샘플 데이터 삽입
INSERT INTO products (name, sku, category, quantity, unit, min_stock, price, location, description) VALUES
('노트북 A', 'LAP-001', '전자제품', 45, '개', 10, 1200000, 'A-1-01', '15인치 노트북'),
('무선 마우스', 'MOU-001', '전자제품', 120, '개', 30, 25000, 'A-2-05', '블루투스 무선 마우스'),
('키보드', 'KEY-001', '전자제품', 8, '개', 15, 85000, 'A-2-06', '기계식 키보드'),
('모니터 27인치', 'MON-001', '전자제품', 32, '개', 10, 350000, 'B-1-03', '4K 해상도 모니터'),
('USB 케이블', 'CAB-001', '액세서리', 5, '개', 50, 5000, 'C-1-01', 'USB Type-C 케이블');

INSERT INTO partners (name, type, contact, phone, email, address) VALUES
('테크 공급업체', 'supplier', '김철수', '02-1234-5678', 'tech@anhwms.com', '서울시 강남구'),
('ABC 전자', 'customer', '이영희', '02-9876-5432', 'abc@anhwms.com', '서울시 서초구');

INSERT INTO users (username, email, role) VALUES
('admin', 'admin@anhwms.com', 'admin'),
('manager1', 'manager1@anhwms.com', 'manager'),
('staff1', 'staff1@anhwms.com', 'staff');

-- 입고 샘플 데이터
INSERT INTO inbounds (product_name, supplier_name, quantity, unit, unit_price, total_price, inbound_date, status) VALUES
('노트북 A', '테크 공급업체', 50, '개', 1200000, 60000000, NOW() - INTERVAL '2 days', 'completed'),
('무선 마우스', '테크 공급업체', 100, '개', 25000, 2500000, NOW() - INTERVAL '1 day', 'completed'),
('키보드', '테크 공급업체', 30, '개', 85000, 2550000, NOW(), 'pending'),
('모니터 27인치', '테크 공급업체', 20, '개', 350000, 7000000, NOW(), 'pending');

-- 출고 샘플 데이터
INSERT INTO outbounds (product_name, customer_name, quantity, unit, unit_price, total_price, outbound_date, status) VALUES
('노트북 A', 'ABC 전자', 10, '개', 1200000, 12000000, NOW() - INTERVAL '1 day', 'completed'),
('무선 마우스', 'ABC 전자', 25, '개', 25000, 625000, NOW() - INTERVAL '1 day', 'completed'),
('USB 케이블', 'ABC 전자', 50, '개', 5000, 250000, NOW(), 'pending'),
('모니터 27인치', 'ABC 전자', 5, '개', 350000, 1750000, NOW(), 'pending');

-- Work Orders 샘플 데이터 (Ops 보드용)
INSERT INTO work_orders (type, title, description, product_name, quantity, unit, location, assignee, status, due_date, started_at, completed_at) VALUES
('inbound', '노트북 입고 처리', '신규 노트북 50대 입고', '노트북 A', 50, '개', 'A-1-01', '김철수', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('inbound', '마우스 입고 처리', '무선 마우스 100개 입고', '무선 마우스', 100, '개', 'A-2-05', '김철수', 'completed', NOW(), NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours'),
('inbound', '키보드 입고 대기', '기계식 키보드 30개 입고 예정', '키보드', 30, '개', 'A-2-06', '이영희', 'in-progress', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NULL),
('inbound', '모니터 입고 예정', '27인치 모니터 20개 입고 예정', '모니터 27인치', 20, '개', 'B-1-03', '박민수', 'planned', NOW() + INTERVAL '4 hours', NULL, NULL),
('outbound', '노트북 출고 완료', 'ABC 전자 노트북 10대 출고', '노트북 A', 10, '개', 'A-1-01', '최수진', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('outbound', '마우스 출고 완료', 'ABC 전자 마우스 25개 출고', '무선 마우스', 25, '개', 'A-2-05', '최수진', 'completed', NOW(), NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
('outbound', '케이블 출고 중', 'USB 케이블 50개 출고 진행중', 'USB 케이블', 50, '개', 'C-1-01', '정민호', 'in-progress', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', NULL),
('outbound', '모니터 출고 예정', '모니터 5대 출고 예정', '모니터 27인치', 5, '개', 'B-1-03', '강지혜', 'planned', NOW() + INTERVAL '3 hours', NULL, NULL),
('outbound', '긴급 출고 지연', '긴급 주문 처리 지연', '노트북 A', 3, '개', 'A-1-01', '최수진', 'overdue', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '3 hours', NULL),
('packing', '노트북 포장 완료', '노트북 10대 포장 완료', '노트북 A', 10, '개', 'PACK-01', '송하늘', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('packing', '마우스 포장 완료', '마우스 25개 포장 완료', '무선 마우스', 25, '개', 'PACK-02', '송하늘', 'completed', NOW(), NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
('packing', '케이블 포장 중', 'USB 케이블 50개 포장 중', 'USB 케이블', 50, '개', 'PACK-01', '윤서연', 'in-progress', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '20 minutes', NULL),
('packing', '모니터 포장 예정', '모니터 5대 포장 예정', '모니터 27인치', 5, '개', 'PACK-02', '송하늘', 'planned', NOW() + INTERVAL '2 hours', NULL, NULL);

-- My Tasks 샘플 데이터
INSERT INTO my_tasks (work_order_id, type, title, description, product_name, quantity, unit, location, status, due_date, priority, barcode, qr_code) VALUES
((SELECT id FROM work_orders WHERE title = '키보드 입고 대기' LIMIT 1), 'inbound', '키보드 입고 확인', '기계식 키보드 30개 입고 확인 필요', '키보드', 30, '개', 'A-2-06', 'in-progress', NOW() + INTERVAL '2 hours', 'high', 'KEY-001', 'QR-KEY-001'),
((SELECT id FROM work_orders WHERE title = '모니터 입고 예정' LIMIT 1), 'inbound', '모니터 입고 준비', '27인치 모니터 20개 입고 준비', '모니터 27인치', 20, '개', 'B-1-03', 'planned', NOW() + INTERVAL '4 hours', 'medium', 'MON-001', 'QR-MON-001'),
((SELECT id FROM work_orders WHERE title = '케이블 출고 중' LIMIT 1), 'outbound', 'USB 케이블 출고', 'USB 케이블 50개 출고 처리', 'USB 케이블', 50, '개', 'C-1-01', 'in-progress', NOW() + INTERVAL '1 hour', 'high', 'CAB-001', 'QR-CAB-001'),
((SELECT id FROM work_orders WHERE title = '모니터 출고 예정' LIMIT 1), 'outbound', '모니터 출고 준비', '모니터 5대 출고 준비', '모니터 27인치', 5, '개', 'B-1-03', 'planned', NOW() + INTERVAL '3 hours', 'medium', 'MON-001', 'QR-MON-001'),
((SELECT id FROM work_orders WHERE title = '케이블 포장 중' LIMIT 1), 'packing', '케이블 포장 작업', 'USB 케이블 50개 포장', 'USB 케이블', 50, '개', 'PACK-01', 'in-progress', NOW() + INTERVAL '1 hour', 'high', 'CAB-001', 'QR-CAB-001'),
((SELECT id FROM work_orders WHERE title = '모니터 포장 예정' LIMIT 1), 'packing', '모니터 포장 준비', '모니터 5대 포장 준비', '모니터 27인치', 5, '개', 'PACK-02', 'planned', NOW() + INTERVAL '2 hours', 'low', 'MON-001', 'QR-MON-001'),
((SELECT id FROM work_orders WHERE title = '노트북 포장 완료' LIMIT 1), 'packing', '노트북 포장 완료', '노트북 10대 포장 완료', '노트북 A', 10, '개', 'PACK-01', 'completed', NOW() - INTERVAL '1 day', 'medium', 'LAP-001', 'QR-LAP-001'),
((SELECT id FROM work_orders WHERE title = '마우스 포장 완료' LIMIT 1), 'packing', '마우스 포장 완료', '마우스 25개 포장 완료', '무선 마우스', 25, '개', 'PACK-02', 'completed', NOW(), 'medium', 'MOU-001', 'QR-MOU-001');

-- ====================================================================
-- 주문 업로드 & 배송연동 시스템
-- ====================================================================

-- 주문 메인 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  user_id UUID,
  country_code TEXT,               -- CN/KR/JP/...
  product_name TEXT,
  remark TEXT,
  logistics_company TEXT,          -- 'CJ' | 'ANH' | 'INTL'
  tracking_no TEXT,
  status TEXT DEFAULT 'CREATED',   -- CREATED|PUSHED|SYNCED|FAILED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수취인 정보 테이블
CREATE TABLE IF NOT EXISTS order_receivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,                      -- 국제형식 또는 원본
  zip TEXT,
  address1 TEXT,                   -- 현지어 full line (중문 가능)
  address2 TEXT,
  locality TEXT,                   -- 성/시/구 등
  country_code TEXT,
  meta JSONB DEFAULT '{}'::JSONB,  -- {cn_mapped: {...}} 등
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 발송인 정보 테이블 (기본값 저장용)
CREATE TABLE IF NOT EXISTS order_senders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  zip TEXT,
  address TEXT,
  address_detail TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 외부 물류 API 연동 로그
CREATE TABLE IF NOT EXISTS logistics_api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  adapter TEXT,                    -- 'CJ' | 'ANH' | 'INTL'
  direction TEXT,                  -- 'REQUEST' | 'RESPONSE'
  status TEXT,                     -- 'S' | 'E' | 'F'
  http_code INT,
  headers JSONB,
  body JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_logistics_company ON orders(logistics_company);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_receivers_order_id ON order_receivers(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_api_logs_order_id ON logistics_api_logs(order_id);

-- RLS 활성화
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_api_logs ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 먼저 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON order_receivers;
DROP POLICY IF EXISTS "Enable read access for all users" ON order_senders;
DROP POLICY IF EXISTS "Enable read access for all users" ON logistics_api_logs;

DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON order_receivers;
DROP POLICY IF EXISTS "Enable update for all users" ON order_receivers;
DROP POLICY IF EXISTS "Enable delete for all users" ON order_receivers;
DROP POLICY IF EXISTS "Enable insert for all users" ON order_senders;
DROP POLICY IF EXISTS "Enable update for all users" ON order_senders;
DROP POLICY IF EXISTS "Enable delete for all users" ON order_senders;
DROP POLICY IF EXISTS "Enable insert for all users" ON logistics_api_logs;
DROP POLICY IF EXISTS "Enable update for all users" ON logistics_api_logs;
DROP POLICY IF EXISTS "Enable delete for all users" ON logistics_api_logs;

-- 읽기 권한 (개발 단계용)
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON order_receivers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON order_senders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON logistics_api_logs FOR SELECT USING (true);

-- 쓰기 권한 (개발 단계용)
CREATE POLICY "Enable insert for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON orders FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON order_receivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON order_receivers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON order_receivers FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON order_senders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON order_senders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON order_senders FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON logistics_api_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON logistics_api_logs FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON logistics_api_logs FOR DELETE USING (true);

-- 샘플 발송인 데이터
INSERT INTO order_senders (name, phone, zip, address, address_detail, is_default) VALUES
('ANH 물류센터', '010-1234-5678', '10009', '경기도 김포시 통진읍', '서암고정로 295', true);

-- 샘플 주문 데이터
INSERT INTO orders (order_no, country_code, product_name, remark, logistics_company, tracking_no, status) VALUES
('A2025-000001', 'CN', '노트북 A', '배송 전 연락 필수', 'ANH', 'ANH1234567890', 'SYNCED'),
('A2025-000002', 'KR', '무선 마우스', '', 'CJ', 'CJ9876543210', 'SYNCED'),
('A2025-000003', 'CN', '키보드', '박스 추가 포장', 'ANH', '', 'CREATED');

-- 샘플 수취인 데이터
INSERT INTO order_receivers (order_id, name, phone, zip, address1, address2, locality, country_code) VALUES
((SELECT id FROM orders WHERE order_no = 'A2025-000001'), '张三', '+86-138-0000-1111', '200120', '上海市 浦东新区 花木路100弄5号801室', '', '上海市', 'CN'),
((SELECT id FROM orders WHERE order_no = 'A2025-000002'), '김철수', '010-2222-3333', '06000', '서울시 강남구 테헤란로 123', '101호', '서울시', 'KR'),
((SELECT id FROM orders WHERE order_no = 'A2025-000003'), '李四', '+86-139-1111-2222', '310000', '浙江省 杭州市 西湖区 文三路100号', '', '杭州市', 'CN');


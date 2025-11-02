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
('테크 공급업체', 'supplier', '김철수', '02-1234-5678', 'tech@supplier.com', '서울시 강남구'),
('ABC 전자', 'customer', '이영희', '02-9876-5432', 'abc@customer.com', '서울시 서초구');

INSERT INTO users (username, email, role) VALUES
('admin', 'admin@wms.com', 'admin'),
('manager1', 'manager1@wms.com', 'manager'),
('staff1', 'staff1@wms.com', 'staff');


-- 주문 업로드 & 배송연동 시스템 스키마

-- 주문 메인 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  user_id UUID,
  country_code TEXT,
  product_name TEXT,
  remark TEXT,
  logistics_company TEXT,
  tracking_no TEXT,
  status TEXT DEFAULT 'CREATED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수취인 정보 테이블
CREATE TABLE IF NOT EXISTS order_receivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  zip TEXT,
  address1 TEXT,
  address2 TEXT,
  locality TEXT,
  country_code TEXT,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 발송인 정보 테이블
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
  adapter TEXT,
  direction TEXT,
  status TEXT,
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

-- 읽기 권한
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON order_receivers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON order_senders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON logistics_api_logs FOR SELECT USING (true);

-- 쓰기 권한
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


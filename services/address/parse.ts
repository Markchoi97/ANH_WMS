import { TelParts, ParsedAddress } from '@/types';

/**
 * 국가 자동 감지 (중문자 포함 시 CN, 아니면 KR)
 */
export function detectCountry(raw: string): 'CN' | 'KR' | 'JP' | 'OTH' {
  // 중국어 감지 (중문 유니코드 범위)
  if (/[\u4e00-\u9fa5]/.test(raw)) return 'CN';
  
  // 일본어 감지 (히라가나, 가타카나, 한자)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(raw)) return 'JP';
  
  // 한국어 감지 (한글 유니코드 범위)
  if (/[\uAC00-\uD7AF]/.test(raw)) return 'KR';
  
  // 기본값: 한국
  return 'KR';
}

/**
 * 전화번호를 한국 3파트로 분할 (02-1234-5678 → {a:'02',b:'1234',c:'5678'})
 */
export function splitTel3KR(v?: string): TelParts {
  if (!v) return { a: '', b: '', c: '' };
  
  const d = v.replace(/\D/g, ''); // 숫자만 추출
  
  // 02 지역번호 처리
  if (d.startsWith('02')) {
    const rest = d.slice(2);
    if (rest.length === 8) {
      return { a: '02', b: rest.slice(0, 4), c: rest.slice(4) };
    }
    if (rest.length === 7) {
      return { a: '02', b: rest.slice(0, 3), c: rest.slice(3) };
    }
    return { a: '02', b: rest.slice(0, 3), c: rest.slice(3) };
  }
  
  // 일반 휴대폰/지역번호
  if (d.length === 10) {
    return { a: d.slice(0, 3), b: d.slice(3, 6), c: d.slice(6) };
  }
  
  if (d.length === 11) {
    return { a: d.slice(0, 3), b: d.slice(3, 7), c: d.slice(7) };
  }
  
  // 기타 경우
  if (d.length >= 9) {
    return { a: d.slice(0, 3), b: d.slice(3, 6), c: d.slice(6) };
  }
  
  return { a: d, b: '', c: '' };
}

/**
 * 중국 주소 파싱
 * 예: "上海市 浦东新区 花木路100弄5号801室"
 */
export function parseCN(raw: string, phone: string): ParsedAddress {
  // 우편번호 추출 (6자리 숫자)
  const postcodeMatch = raw.match(/\b(\d{6})\b/);
  const postcode = postcodeMatch ? postcodeMatch[1] : '';
  
  // 성/시 추출 (간단 버전 - 실제로는 사전 기반으로 확장 가능)
  const localities = ['北京市', '上海市', '天津市', '重庆市', '广东省', '浙江省', '江苏省', '山东省'];
  let locality = '';
  
  for (const loc of localities) {
    if (raw.includes(loc)) {
      locality = loc;
      break;
    }
  }
  
  // 국제 전화번호 형식
  let phoneIntl = phone;
  if (!phone.startsWith('+')) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('86')) {
      phoneIntl = '+' + cleaned;
    } else {
      phoneIntl = '+86' + cleaned;
    }
  }
  
  return {
    countryCode: 'CN',
    address1: raw.trim().replace(postcode, '').trim(),
    address2: '',
    postcode,
    locality,
    phoneIntl,
  };
}

/**
 * 한국 주소 파싱
 */
export function parseKR(raw: string, phone: string, zip?: string): ParsedAddress {
  // 시/도 추출
  const localities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
  let locality = '';
  
  for (const loc of localities) {
    if (raw.includes(loc)) {
      locality = loc;
      break;
    }
  }
  
  // 전화번호 처리
  let phoneIntl = phone;
  if (!phone.startsWith('+')) {
    const cleaned = phone.replace(/\D/g, '');
    phoneIntl = '+82' + (cleaned.startsWith('0') ? cleaned.slice(1) : cleaned);
  }
  
  return {
    countryCode: 'KR',
    address1: raw.trim(),
    address2: '',
    postcode: zip || '',
    locality,
    phoneIntl,
  };
}

/**
 * 주소 자동 파싱 (국가 자동 감지)
 */
export function parseAddress(raw: string, phone: string, zip?: string): ParsedAddress {
  const country = detectCountry(raw);
  
  if (country === 'CN') {
    return parseCN(raw, phone);
  }
  
  return parseKR(raw, phone, zip);
}


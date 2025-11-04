/**
 * 국가 코드에 따라 최적의 배송사를 자동 배정
 * - KR: CJ 대한통운
 * - CN: ANH 중국 물류
 * - 기타: INTL 국제 배송
 */
export function pickCarrier(countryCode: string): 'CJ' | 'ANH' | 'INTL' {
  switch (countryCode) {
    case 'KR':
      return 'CJ';
    case 'CN':
      return 'ANH';
    case 'JP':
    case 'US':
    case 'EU':
      return 'INTL';
    default:
      return 'INTL';
  }
}

/**
 * 배송사 한글명 반환
 */
export function getCarrierName(carrier: 'CJ' | 'ANH' | 'INTL'): string {
  switch (carrier) {
    case 'CJ':
      return 'CJ 대한통운';
    case 'ANH':
      return 'ANH 물류';
    case 'INTL':
      return '국제 배송';
    default:
      return carrier;
  }
}

/**
 * 배송사별 색상 (Tailwind CSS)
 */
export function getCarrierColor(carrier: 'CJ' | 'ANH' | 'INTL'): string {
  switch (carrier) {
    case 'CJ':
      return 'bg-red-100 text-red-800';
    case 'ANH':
      return 'bg-blue-100 text-blue-800';
    case 'INTL':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}


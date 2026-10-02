/**
 * Persian Numbers & Currency Formatting Utilities
 * Uses authentic Persian typography (Vazirmatn) with bold numeral representation.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts standard ASCII digits (0-9) to standard Persian digits (۰-۹).
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)]);
}

export const formatPersianDigits = toPersianDigits;

/**
 * Formats a number as a localized Persian currency/amount string with thousands separators
 * and Persian numerals.
 */
export function formatPersianNumber(
  num: number | string | null | undefined,
  options?: {
    decimals?: number;
    addSeparators?: boolean;
  }
): string {
  if (num === null || num === undefined) return '';
  const val = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(val)) return toPersianDigits(String(num));

  const decimals = options?.decimals !== undefined ? options.decimals : val % 1 !== 0 ? 2 : 0;
  const addSeparators = options?.addSeparators !== false;

  let formatted = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();

  if (addSeparators) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '،');
    formatted = parts.join('/');
  }

  return toPersianDigits(formatted);
}

/**
 * Formats Toman amount with Persian digits and Toman suffix
 */
export function formatPersianToman(amountToman: number): string {
  if (amountToman >= 1_000_000_000) {
    const billions = (amountToman / 1_000_000_000).toFixed(2);
    return `${toPersianDigits(billions)} میلیارد تومان`;
  }
  if (amountToman >= 1_000_000) {
    const millions = (amountToman / 1_000_000).toFixed(1);
    return `${toPersianDigits(millions)} میلیون تومان`;
  }
  return `${formatPersianNumber(amountToman)} تومان`;
}

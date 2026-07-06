/**
 * Kenyan phone number helpers.
 *
 * Accepts the common local/international variants:
 *   +254 712 345 678
 *   254712345678
 *   0712345678
 *   0112345678  (newer local mobile prefix)
 *   712345678   (bare 9-digit mobile)
 *   112345678   (bare 9-digit mobile starting with 1)
 *
 * Canonical form used for API calls and storage is 254XXXXXXXXX.
 */

const DIGITS_ONLY = /\D/g;

// Valid Kenyan mobile numbers: 7xx or 1xx followed by 8 digits.
const VALID_MOBILE = /^[17]\d{8}$/;

/**
 * Strip spaces, dashes and the leading '+' so we can reason about digits only.
 */
const clean = (phone) => (phone ? String(phone).replace(DIGITS_ONLY, '') : '');

/**
 * Return true if the input looks like a Kenyan mobile number in any supported format.
 */
export const isValidKenyanPhone = (phone) => {
  if (!phone) return false;
  const digits = clean(phone);

  if (digits.startsWith('254')) {
    return VALID_MOBILE.test(digits.slice(3));
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return VALID_MOBILE.test(digits.slice(1));
  }
  if (digits.length === 9) {
    return VALID_MOBILE.test(digits);
  }
  return false;
};

/**
 * Convert any supported Kenyan phone format to the canonical 254XXXXXXXXX form.
 * Returns null if the number cannot be normalized.
 */
export const normalizeKenyanPhone = (phone) => {
  if (!phone) return null;
  const digits = clean(phone);

  if (digits.startsWith('254') && VALID_MOBILE.test(digits.slice(3))) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 10 && VALID_MOBILE.test(digits.slice(1))) {
    return `254${digits.slice(1)}`;
  }
  if (digits.length === 9 && VALID_MOBILE.test(digits)) {
    return `254${digits}`;
  }
  return null;
};

/**
 * Friendly display format: +254 712 345 678.
 */
export const formatKenyanPhoneDisplay = (phone) => {
  const normalized = normalizeKenyanPhone(phone);
  if (!normalized) return phone || '';
  return `+${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
};

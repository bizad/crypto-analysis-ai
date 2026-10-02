import crypto from 'node:crypto';

// RFC 4648 Base32 Alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue; // Skip unrecognized characters gracefully

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate a cryptographically secure Base32 secret for TOTP (160 bits / 20 bytes)
 */
export function generateTotpSecret(bytesLength: number = 20): string {
  const randomBytes = crypto.randomBytes(bytesLength);
  return base32Encode(randomBytes);
}

/**
 * Generate a 6-digit TOTP token using HMAC-SHA1 (RFC 6238)
 */
export function generateTotpToken(
  secretBase32: string,
  timeOffsetSteps: number = 0,
  stepSeconds: number = 30
): string {
  const key = base32Decode(secretBase32);
  const epochSeconds = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epochSeconds / stepSeconds) + timeOffsetSteps;

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;

  return binaryCode.toString().padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP token allowing clock drift of +/- window steps (default: 1 step = +/- 30s)
 */
export function verifyTotpToken(
  secretBase32: string,
  token: string,
  window: number = 1,
  stepSeconds: number = 30
): boolean {
  const cleanToken = token.trim();
  if (!/^\d{6}$/.test(cleanToken)) return false;

  for (let step = -window; step <= window; step++) {
    const expected = generateTotpToken(secretBase32, step, stepSeconds);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Generate standard otpauth URL for Google Authenticator / 1Password
 */
export function generateTotpUri(
  label: string,
  issuer: string,
  secretBase32: string
): string {
  const encodedIssuer = encodeURIComponent(issuer.trim());
  const encodedLabel = encodeURIComponent(label.trim());
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate a set of emergency one-time recovery backup codes
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`);
  }
  return codes;
}

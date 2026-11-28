import { EncryptedVaultPayload, PersonalVaultItem, PinHashRecord, VaultItemCategory } from '../types/medical';

const PBKDF2_ITERATIONS = 150000;
const SALT_BYTE_LENGTH = 16;
const AES_GCM_IV_LENGTH = 12;

export function isWebCryptoAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined'
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/**
 * Hashes a user PIN / short passcode with a random 16-byte salt using SHA-256 via Web Crypto API.
 * The raw PIN is never persisted.
 */
export async function hashPinSha256(pin: string, existingSaltBase64?: string): Promise<PinHashRecord> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is unavailable in this browser context.');
  }

  const saltBytes = existingSaltBase64
    ? base64ToBytes(existingSaltBase64)
    : window.crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));

  const encoder = new TextEncoder();
  const pinBytes = encoder.encode(pin);
  const combined = new Uint8Array(saltBytes.length + pinBytes.length);
  combined.set(saltBytes, 0);
  combined.set(pinBytes, saltBytes.length);

  const digestBuffer = await window.crypto.subtle.digest('SHA-256', toArrayBuffer(combined));
  const hashHex = bytesToHex(new Uint8Array(digestBuffer));

  return {
    version: 1,
    algorithm: 'SHA-256',
    salt: bytesToBase64(saltBytes),
    hash: hashHex,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Verifies a candidate PIN against a stored SHA-256 salted hash record.
 */
export async function verifyPinSha256(pin: string, record: PinHashRecord): Promise<boolean> {
  if (!record || record.algorithm !== 'SHA-256' || !record.salt || !record.hash) {
    return false;
  }
  try {
    const computed = await hashPinSha256(pin, record.salt);
    return constantTimeEqual(computed.hash, record.hash);
  } catch {
    return false;
  }
}

async function deriveAesGcmKey(
  pin: string,
  saltBytes: Uint8Array,
  iterations = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is unavailable in this browser context.');
  }

  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    toArrayBuffer(encoder.encode(pin)),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(saltBytes),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypts the personal vault items array using AES-GCM (256-bit) with a PBKDF2-SHA256 derived key
 * and fresh random salt + 12-byte IV on every save.
 */
export async function encryptVaultItems(
  items: PersonalVaultItem[],
  pin: string,
): Promise<EncryptedVaultPayload> {
  const saltBytes = window.crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const ivBytes = window.crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const aesKey = await deriveAesGcmKey(pin, saltBytes, PBKDF2_ITERATIONS);

  const plaintextBytes = new TextEncoder().encode(JSON.stringify(items));
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(ivBytes) },
    aesKey,
    toArrayBuffer(plaintextBytes),
  );

  return {
    version: 1,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    salt: bytesToBase64(saltBytes),
    iv: bytesToBase64(ivBytes),
    ciphertext: bytesToBase64(new Uint8Array(cipherBuffer)),
    itemCount: items.length,
    updatedAt: new Date().toISOString(),
  };
}

const VALID_VAULT_CATEGORIES: VaultItemCategory[] = ['vod', 'vlk', 'rezerv', 'personal'];

function normalizeVaultItems(raw: unknown): PersonalVaultItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry, idx) => {
    const item = entry as Partial<PersonalVaultItem>;
    const rawUrls = Array.isArray(item.urls) ? item.urls : [];
    const safeUrls = rawUrls
      .filter((u): u is string => typeof u === 'string')
      .map((u) => u.trim())
      .filter((u) => isSafeHttpUrl(u));
    const category: VaultItemCategory = VALID_VAULT_CATEGORIES.includes(
      item.category as VaultItemCategory,
    )
      ? (item.category as VaultItemCategory)
      : 'personal';

    return {
      id: typeof item.id === 'string' && item.id ? item.id : `vault-${Date.now()}-${idx}`,
      category,
      title: typeof item.title === 'string' ? item.title.trim() : '',
      date: typeof item.date === 'string' ? item.date.trim() : '',
      urls: safeUrls,
      notes: typeof item.notes === 'string' ? item.notes.trim() : '',
      updatedAt:
        typeof item.updatedAt === 'string' && item.updatedAt
          ? item.updatedAt
          : new Date().toISOString(),
    };
  });
}

/**
 * Decrypts an AES-GCM encrypted personal vault payload using the provided PIN.
 */
export async function decryptVaultItems(
  payload: EncryptedVaultPayload,
  pin: string,
): Promise<PersonalVaultItem[]> {
  if (
    !payload ||
    payload.algorithm !== 'AES-GCM' ||
    !payload.salt ||
    !payload.iv ||
    !payload.ciphertext
  ) {
    throw new Error('Invalid encrypted vault format.');
  }

  const saltBytes = base64ToBytes(payload.salt);
  const ivBytes = base64ToBytes(payload.iv);
  const cipherBytes = base64ToBytes(payload.ciphertext);
  const iterations =
    typeof payload.iterations === 'number' && payload.iterations >= 10000
      ? payload.iterations
      : PBKDF2_ITERATIONS;

  const aesKey = await deriveAesGcmKey(pin, saltBytes, iterations);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(ivBytes) },
    aesKey,
    toArrayBuffer(cipherBytes),
  );

  const jsonText = new TextDecoder().decode(decryptedBuffer);
  const parsed: unknown = JSON.parse(jsonText);
  return normalizeVaultItems(parsed);
}

/**
 * Validates that a URL strictly uses http:// or https:// protocol (prevents javascript:/data: XSS).
 */
export function isSafeHttpUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Parses multi-line URL input for vault items, normalizing bare hostnames to https://
 * while strictly rejecting unsafe protocols such as javascript: or data:.
 */
export function parseAndValidateVaultUrls(multilineInput: string): {
  valid: string[];
  invalid: string[];
} {
  const lines = multilineInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const line of lines) {
    // Reject explicit non-http(s) schemes immediately (e.g., javascript:, data:, file:, vbscript:)
    const schemeMatch = line.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    if (schemeMatch) {
      const scheme = schemeMatch[1].toLowerCase();
      if (scheme !== 'http' && scheme !== 'https') {
        invalid.push(line);
        continue;
      }
      if (isSafeHttpUrl(line)) {
        valid.push(line);
      } else {
        invalid.push(line);
      }
      continue;
    }

    // Bare domain like drive.google.com/... -> prepend https:// and validate
    const candidate = `https://${line}`;
    if (isSafeHttpUrl(candidate) && line.includes('.')) {
      valid.push(candidate);
    } else {
      invalid.push(line);
    }
  }

  return { valid, invalid };
}

export function isValidPinHashRecord(raw: unknown): raw is PinHashRecord {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Partial<PinHashRecord>;
  return (
    r.version === 1 &&
    r.algorithm === 'SHA-256' &&
    typeof r.salt === 'string' &&
    r.salt.length > 0 &&
    typeof r.hash === 'string' &&
    /^[0-9a-f]{64}$/i.test(r.hash)
  );
}

export function isValidEncryptedVaultPayload(raw: unknown): raw is EncryptedVaultPayload {
  if (!raw || typeof raw !== 'object') return false;
  const p = raw as Partial<EncryptedVaultPayload>;
  return (
    p.version === 1 &&
    p.algorithm === 'AES-GCM' &&
    typeof p.salt === 'string' &&
    p.salt.length > 0 &&
    typeof p.iv === 'string' &&
    p.iv.length > 0 &&
    typeof p.ciphertext === 'string' &&
    p.ciphertext.length > 0
  );
}

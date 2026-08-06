/**
 * Password hashing berbasis Web Crypto (PBKDF2-SHA256).
 * Tanpa dependensi eksternal — berjalan di Cloudflare Workers.
 *
 * Format hash yang disimpan: pbkdf2$<iterations>$<salt_hex>$<hash_hex>
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // bytes
const SALT_LENGTH = 16; // bytes

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    return false;
  }

  const [, iterationsStr, saltHex, expectedHex] = parts;
  const iterations = Number.parseInt(iterationsStr, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as BufferSource,
      iterations,
    },
    keyMaterial,
    expectedHex.length * 4,
  );

  const computed = toHex(new Uint8Array(bits));
  return computed === expectedHex.toLowerCase();
}

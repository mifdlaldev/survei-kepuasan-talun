/**
 * Session management: token acak disimpan sebagai hash SHA-256 di D1.
 * Cookie HttpOnly + SameSite=Lax + Secure — tidak bisa diakses JavaScript.
 */

const SESSION_COOKIE = "skm_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 hari

const encoder = new TextEncoder();

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function sessionCookieOptions(token: string): string[] {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  return parts;
}

export function buildSessionCookie(token: string): string {
  return sessionCookieOptions(token).join("; ");
}

export function buildLogoutCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function readSessionToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) {
      return rest.join("=");
    }
  }
  return null;
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };

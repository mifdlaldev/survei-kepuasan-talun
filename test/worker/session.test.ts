import { describe, it, expect } from "vitest";
import {
  generateToken,
  sha256Hex,
  buildSessionCookie,
  buildLogoutCookie,
  readSessionToken,
  SESSION_COOKIE,
} from "../../worker/src/lib/session";

describe("session helpers", () => {
  it("generateToken menghasilkan 64 karakter hex", () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generateToken selalu unik", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });

  it("sha256Hex konsisten", async () => {
    const a = await sha256Hex("abc");
    const b = await sha256Hex("abc");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("session cookie mengandung flag keamanan", () => {
    const cookie = buildSessionCookie("token123");
    expect(cookie).toContain(`${SESSION_COOKIE}=token123`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("Path=/");
  });

  it("logout cookie menghapus sesi (Max-Age=0)", () => {
    const cookie = buildLogoutCookie();
    expect(cookie).toContain("Max-Age=0");
  });

  it("readSessionToken mengekstrak token dari header Cookie", () => {
    const cookieHeader = "other=1; skm_session=abc123; foo=bar";
    expect(readSessionToken(cookieHeader)).toBe("abc123");
  });

  it("readSessionToken null untuk header kosong/tanpa sesi", () => {
    expect(readSessionToken(null)).toBeNull();
    expect(readSessionToken("foo=bar")).toBeNull();
    expect(readSessionToken(undefined)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../worker/src/lib/password";

describe("password hashing (PBKDF2)", () => {
  it("hash menghasilkan format pbkdf2$iterations$salt$hash", async () => {
    const hash = await hashPassword("rahasia123");
    expect(hash.split("$")).toHaveLength(4);
    expect(hash.startsWith("pbkdf2$100000$")).toBe(true);
  });

  it("password benar diverifikasi sukses", async () => {
    const hash = await hashPassword("Kelurahan123!");
    expect(await verifyPassword("Kelurahan123!", hash)).toBe(true);
  });

  it("password salah ditolak", async () => {
    const hash = await hashPassword("Kelurahan123!");
    expect(await verifyPassword("SalahPassword", hash)).toBe(false);
  });

  it("hash yang sama untuk password sama tetap beda (salt acak)", async () => {
    const a = await hashPassword("rahasia123");
    const b = await hashPassword("rahasia123");
    expect(a).not.toBe(b);
  });

  it("hash rusak/format invalid ditolak tanpa throw", async () => {
    expect(await verifyPassword("apapun", "bukan-format-hash")).toBe(false);
    expect(await verifyPassword("apapun", "")).toBe(false);
    expect(await verifyPassword("apapun", "pbkdf2$abc$def$ghi")).toBe(false);
  });
});

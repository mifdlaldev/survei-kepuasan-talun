import type { Context, Next } from "hono";
import type { AppEnv } from "../types";
import { readSessionToken, sha256Hex, SESSION_TTL_SECONDS } from "../lib/session";

/**
 * Middleware proteksi admin.
 * Memvalidasi cookie sesi (hash token) terhadap tabel sessions di D1,
 * memeriksa kedaluwarsa, dan menaruh data admin di c.get("admin").
 */
export async function requireAdmin(
  c: Context<AppEnv>,
  next: Next,
) {
  const token = readSessionToken(c.req.header("Cookie"));
  if (!token) {
    return c.json({ error: "Tidak terautentikasi" }, 401);
  }

  const tokenHash = await sha256Hex(token);

  const session = await c.env.DB.prepare(
    `SELECT s.token_hash, s.expires_at, a.id, a.username, a.nama_lengkap, a.is_active
     FROM sessions s
     JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = ?`,
  )
    .bind(tokenHash)
    .first<{
      token_hash: string;
      expires_at: string;
      id: number;
      username: string;
      nama_lengkap: string;
      is_active: number;
    }>();

  if (!session) {
    return c.json({ error: "Sesi tidak valid" }, 401);
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    // Sesi kedaluwarsa: hapus dari DB + tolak.
    await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(tokenHash)
      .run();
    return c.json({ error: "Sesi telah kedaluwarsa" }, 401);
  }

  if (session.is_active !== 1) {
    return c.json({ error: "Akun dinonaktifkan" }, 403);
  }

  // Perpanjang sesi aktif (sliding expiration) bila sudah lewat setengah umur.
  const expiresAt = new Date(session.expires_at).getTime();
  const halfLifeMs = (SESSION_TTL_SECONDS * 1000) / 2;
  if (expiresAt - Date.now() < halfLifeMs) {
    const newExpiry = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    await c.env.DB.prepare("UPDATE sessions SET expires_at = ? WHERE token_hash = ?")
      .bind(newExpiry, tokenHash)
      .run();
  }

  c.set("admin", {
    id: session.id,
    username: session.username,
    nama_lengkap: session.nama_lengkap,
  });

  await next();
}

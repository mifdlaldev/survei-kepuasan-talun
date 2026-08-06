import type { Context, Next } from "hono";
import type { Env } from "../types";

/**
 * Rate limiting per-IP berbasis D1.
 * Jendela 60 detik; batas default 30 request/menit per IP.
 * Anti-spam untuk endpoint publik (submit survei) dan login.
 */

const WINDOW_SECONDS = 60;
const DEFAULT_LIMIT = 30;

export interface RateLimitOptions {
  limit?: number;
}

function getClientIp(c: Context<{ Bindings: Env }>): string {
  const cf = c.req.header("CF-Connecting-IP");
  if (cf) return cf;
  const xff = c.req.header("X-Forwarded-For");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

/** Hitung awal jendela (detik epoch) yang berisi `now`. */
function windowStartEpoch(nowSeconds: number): number {
  return Math.floor(nowSeconds / WINDOW_SECONDS) * WINDOW_SECONDS;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const limit = options.limit ?? DEFAULT_LIMIT;

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const env = c.env as Env;
    const ip = getClientIp(c);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = windowStartEpoch(now);
    const windowStartIso = new Date(windowStart * 1000).toISOString();

    try {
      // Hapus jendela basi (lebih dari 2 jendela lalu) — sekali per request.
      const staleCutoff = new Date((windowStart - WINDOW_SECONDS * 2) * 1000).toISOString();
      await env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?")
        .bind(staleCutoff)
        .run();

      // Upsert counter jendela aktif.
      await env.DB.prepare(
        `INSERT INTO rate_limits (ip, window_start, request_count)
         VALUES (?, ?, 1)
         ON CONFLICT (ip, window_start)
         DO UPDATE SET request_count = request_count + 1`,
      )
        .bind(ip, windowStartIso)
        .run();

      const row = await env.DB.prepare(
        `SELECT request_count FROM rate_limits WHERE ip = ? AND window_start = ?`,
      )
        .bind(ip, windowStartIso)
        .first<{ request_count: number }>();

      const count = row?.request_count ?? 1;

      if (count > limit) {
        return c.json(
          {
            error: "Terlalu banyak permintaan. Silakan coba lagi sebentar lagi.",
            retry_after: WINDOW_SECONDS,
          },
          429,
        );
      }

      await next();
    } catch (err) {
      // Jangan blokir request jika rate limiter gagal (fail-open).
      console.error("Rate limit error:", err);
      await next();
    }
  };
}

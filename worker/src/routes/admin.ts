import { Hono } from "hono";
import type { AppEnv } from "../types";
import { requireAdmin } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  generateToken,
  sha256Hex,
  buildSessionCookie,
  buildLogoutCookie,
  SESSION_TTL_SECONDS,
} from "../lib/session";
import {
  loginSchema,
  questionSchema,
  questionUpdateSchema,
  adminCreateSchema,
} from "../lib/validators";

/** Rute admin: login, sesi, kelola soal, dashboard, feedback. */
export const adminRoutes = new Hono<AppEnv>();

// ------------------------------------------------------------
// AUTH
// ------------------------------------------------------------

adminRoutes.post("/login", rateLimit({ limit: 10 }), async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "Format permintaan tidak valid" }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      422,
    );
  }

  const { username, password } = parsed.data;

  const admin = await c.env.DB.prepare(
    `SELECT id, username, password_hash, nama_lengkap, is_active
     FROM admins WHERE username = ?`,
  )
    .bind(username)
    .first<{
      id: number;
      username: string;
      password_hash: string;
      nama_lengkap: string;
      is_active: number;
    }>();

  // Verifikasi selalu dijalankan (walaupun admin tak ditemukan) untuk
  // mengurangi risiko timing attack.
  const hash = admin?.password_hash ?? "pbkdf2$100000$0000000000000000$0000000000000000000000000000000000000000000000000000000000000000";
  const valid = await verifyPassword(password, hash);

  if (!admin || !valid) {
    return c.json({ error: "Username atau password salah" }, 401);
  }

  if (admin.is_active !== 1) {
    return c.json({ error: "Akun dinonaktifkan. Hubungi administrator." }, 403);
  }

  const token = generateToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  await c.env.DB.prepare(
    `INSERT INTO sessions (token_hash, admin_id, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(
      tokenHash,
      admin.id,
      expiresAt,
      c.req.header("CF-Connecting-IP") ?? null,
      c.req.header("User-Agent")?.slice(0, 200) ?? null,
    )
    .run();

  // Hapus sesi lama admin yang sudah kedaluwarsa (housekeeping).
  await c.env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?")
    .bind(new Date().toISOString())
    .run();

  c.header("Set-Cookie", buildSessionCookie(token));
  return c.json({
    success: true,
    admin: {
      id: admin.id,
      username: admin.username,
      nama_lengkap: admin.nama_lengkap,
    },
  });
});

adminRoutes.post("/logout", requireAdmin, async (c) => {
  const { readSessionToken } = await import("../lib/session");
  const token = readSessionToken(c.req.header("Cookie"));
  if (token) {
    const tokenHash = await sha256Hex(token);
    await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(tokenHash)
      .run();
  }
  c.header("Set-Cookie", buildLogoutCookie());
  return c.json({ success: true });
});

adminRoutes.get("/me", requireAdmin, (c) => {
  return c.json({ admin: c.get("admin") });
});

// ------------------------------------------------------------
// QUESTIONS (CRUD)
// ------------------------------------------------------------

adminRoutes.get("/questions", requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, pertanyaan, status, urutan, created_at, updated_at
     FROM questions
     ORDER BY urutan ASC, id ASC`,
  ).all();
  return c.json({ data: results });
});

adminRoutes.post("/questions", requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "Format permintaan tidak valid" }, 400);
  }

  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      422,
    );
  }

  const { pertanyaan, status, urutan } = parsed.data;

  const result = await c.env.DB.prepare(
    `INSERT INTO questions (pertanyaan, status, urutan)
     VALUES (?, ?, ?)`,
  )
    .bind(pertanyaan, status, urutan)
    .run();

  return c.json(
    { success: true, id: result.meta.last_row_id },
    201,
  );
});

adminRoutes.patch("/questions/:id", requireAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "ID tidak valid" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "Format permintaan tidak valid" }, 400);
  }

  const parsed = questionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      422,
    );
  }

  const fields = parsed.data;
  const existing = await c.env.DB.prepare(
    "SELECT id FROM questions WHERE id = ?",
  )
    .bind(id)
    .first();

  if (!existing) {
    return c.json({ error: "Pertanyaan tidak ditemukan" }, 404);
  }

  // Bangun UPDATE dinamis dari field yang dikirim.
  const sets: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (fields.pertanyaan !== undefined) {
    sets.push("pertanyaan = ?");
    values.push(fields.pertanyaan);
  }
  if (fields.status !== undefined) {
    sets.push("status = ?");
    values.push(fields.status);
  }
  if (fields.urutan !== undefined) {
    sets.push("urutan = ?");
    values.push(fields.urutan);
  }

  values.push(id);
  await c.env.DB.prepare(
    `UPDATE questions SET ${sets.join(", ")} WHERE id = ?`,
  )
    .bind(...values)
    .run();

  return c.json({ success: true });
});

adminRoutes.delete("/questions/:id", requireAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "ID tidak valid" }, 400);
  }

  const result = await c.env.DB.prepare("DELETE FROM questions WHERE id = ?")
    .bind(id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Pertanyaan tidak ditemukan" }, 404);
  }

  return c.json({ success: true });
});

// ------------------------------------------------------------
// DASHBOARD & FEEDBACK
// ------------------------------------------------------------

adminRoutes.get("/dashboard", requireAdmin, async (c) => {
  const totalRespondents = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM respondents",
  ).first<{ count: number }>();

  const totalAnswers = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM survey_answers",
  ).first<{ count: number }>();

  const avgScore = await c.env.DB.prepare(
    "SELECT AVG(skor) AS avg FROM survey_answers",
  ).first<{ avg: number | null }>();

  const perQuestion = await c.env.DB.prepare(
    `SELECT q.id, q.pertanyaan,
            COUNT(sa.id) AS total,
            ROUND(AVG(sa.skor), 2) AS avg_skor
     FROM questions q
     LEFT JOIN survey_answers sa ON sa.question_id = q.id
     GROUP BY q.id
     ORDER BY q.urutan ASC, q.id ASC`,
  ).all();

  const recentRespondents = await c.env.DB.prepare(
    `SELECT id, nama, usia, jk, pendidikan, pekerjaan, created_at
     FROM respondents
     ORDER BY id DESC
     LIMIT 10`,
  ).all();

  return c.json({
    data: {
      total_respondents: totalRespondents?.count ?? 0,
      total_answers: totalAnswers?.count ?? 0,
      avg_score: avgScore?.avg != null ? Number(avgScore.avg) : null,
      per_question: perQuestion.results,
      recent_respondents: recentRespondents.results,
    },
  });
});

adminRoutes.get("/feedback", requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, nama, kritik_saran, created_at
     FROM respondents
     WHERE kritik_saran IS NOT NULL AND kritik_saran != ''
     ORDER BY id DESC
     LIMIT 200`,
  ).all();

  return c.json({ data: results });
});

// ------------------------------------------------------------
// ADMIN MANAGEMENT (buat akun admin tambahan)
// ------------------------------------------------------------

adminRoutes.post("/admins", requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "Format permintaan tidak valid" }, 400);
  }

  const parsed = adminCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      422,
    );
  }

  const { username, password, nama_lengkap } = parsed.data;

  const existing = await c.env.DB.prepare(
    "SELECT id FROM admins WHERE username = ?",
  )
    .bind(username)
    .first();

  if (existing) {
    return c.json({ error: "Username sudah digunakan" }, 409);
  }

  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    `INSERT INTO admins (username, password_hash, nama_lengkap)
     VALUES (?, ?, ?)`,
  )
    .bind(username, passwordHash, nama_lengkap)
    .run();

  return c.json({ success: true }, 201);
});

import { Hono } from "hono";
import type { Env } from "../types";
import { rateLimit } from "../middleware/rateLimit";
import { submitSurveySchema } from "../lib/validators";

/** Rute publik: soal aktif + submit survei. */
export const publicRoutes = new Hono<{ Bindings: Env }>();

publicRoutes.get("/questions", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, pertanyaan, urutan
     FROM questions
     WHERE status = 1
     ORDER BY urutan ASC, id ASC`,
  ).all();

  return c.json({ data: results });
});

publicRoutes.post("/survey", rateLimit({ limit: 10 }), async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "Format permintaan tidak valid" }, 400);
  }

  const parsed = submitSurveySchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return c.json(
      { error: firstIssue?.message ?? "Data tidak valid" },
      422,
    );
  }

  const { respondent, answers } = parsed.data;

  try {
    // Validasi: semua question_id harus milik soal yang AKTIF.
    const ids = answers.map((a) => a.question_id);
    const placeholders = ids.map(() => "?").join(",");
    const active = await c.env.DB.prepare(
      `SELECT id FROM questions WHERE status = 1 AND id IN (${placeholders})`,
    )
      .bind(...ids)
      .all<{ id: number }>();

    const activeIds = new Set(active.results.map((r) => r.id));
    const hasInvalid = answers.some((a) => !activeIds.has(a.question_id));
    if (hasInvalid) {
      return c.json({ error: "Terdapat pertanyaan yang tidak valid atau nonaktif" }, 422);
    }

    // Cegah duplikat question_id dalam satu submit.
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      return c.json({ error: "Terdapat jawaban duplikat untuk satu pertanyaan" }, 422);
    }

    // Insert responden dalam transaksi.
    const respondentInsert = await c.env.DB.prepare(
      `INSERT INTO respondents (nama, usia, jk, pendidikan, pekerjaan, kritik_saran)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        respondent.nama,
        respondent.usia,
        respondent.jk,
        respondent.pendidikan,
        respondent.pekerjaan,
        respondent.kritik_saran || null,
      )
      .run();

    const respondentId = respondentInsert.meta.last_row_id;

    const answerStmt = c.env.DB.prepare(
      `INSERT INTO survey_answers (respondent_id, question_id, skor)
       VALUES (?, ?, ?)`,
    );

    const batch = answers.map((a) =>
      answerStmt.bind(respondentId, a.question_id, a.skor),
    );
    await c.env.DB.batch(batch);

    return c.json({ success: true, respondent_id: respondentId }, 201);
  } catch (err) {
    console.error("Survey submit error:", err);
    return c.json({ error: "Gagal menyimpan survei. Silakan coba lagi." }, 500);
  }
});

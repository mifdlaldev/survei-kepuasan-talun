import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SELF, env } from "cloudflare:test";

/** Alur lengkap: soal -> survei publik -> login admin -> dashboard. */

const DB = env.DB;

afterAll(async () => {
  await DB.exec("DELETE FROM survey_answers; DELETE FROM respondents; DELETE FROM questions; DELETE FROM sessions; DELETE FROM admins; DELETE FROM rate_limits;");
});

async function jsonFetch(path: string, init?: RequestInit) {
  const res = await SELF.fetch(`https://example.com${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  return res;
}

async function createAdmin(username = "admin-test", password = "Password123!") {
  const { hashPassword } = await import("../../worker/src/lib/password");
  const hash = await hashPassword(password);
  await DB.prepare("INSERT INTO admins (username, password_hash, nama_lengkap) VALUES (?, ?, ?)")
    .bind(username, hash, "Admin Test")
    .run();
}

async function createQuestion(pertanyaan: string, status = 1) {
  const r = await DB.prepare("INSERT INTO questions (pertanyaan, status, urutan) VALUES (?, ?, 0)")
    .bind(pertanyaan, status)
    .run();
  return Number(r.meta.last_row_id);
}

describe("API publik", () => {
  it("GET /api/health -> ok", async () => {
    const res = await SELF.fetch("https://example.com/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect((body as { status: string }).status).toBe("ok");
  });

  it("GET /api/questions -> daftar soal aktif", async () => {
    await createQuestion("Pertanyaan aktif 1");
    await createQuestion("Pertanyaan nonaktif", 0);
    const res = await jsonFetch("/api/questions");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { pertanyaan: string }[] };
    expect(body.data).toHaveLength(1);
    expect(body.data[0].pertanyaan).toBe("Pertanyaan aktif 1");
  });

  it("POST /api/survey -> simpan responden + jawaban", async () => {
    const qid = await createQuestion("Pertanyaan valid");
    const res = await jsonFetch("/api/survey", {
      method: "POST",
      body: JSON.stringify({
        respondent: { nama: "Budi", usia: 30, jk: "L", pendidikan: "SD", pekerjaan: "Petani" },
        answers: [{ question_id: qid, skor: 5 }],
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);

    const count = await DB.prepare("SELECT COUNT(*) AS c FROM respondents").first<{ c: number }>();
    expect(count?.c).toBe(1);
  });

  it("POST /api/survey dengan soal nonaktif -> 422", async () => {
    const qid = await createQuestion("Pertanyaan nonaktif", 0);
    const res = await jsonFetch("/api/survey", {
      method: "POST",
      body: JSON.stringify({
        respondent: { nama: "Budi", usia: 30, jk: "L", pendidikan: "SD", pekerjaan: "Petani" },
        answers: [{ question_id: qid, skor: 5 }],
      }),
    });
    expect(res.status).toBe(422);
  });

  it("POST /api/survey dengan data invalid -> 422", async () => {
    const res = await jsonFetch("/api/survey", {
      method: "POST",
      body: JSON.stringify({
        respondent: { nama: "Budi", usia: 10, jk: "L", pendidikan: "SD", pekerjaan: "Petani" },
        answers: [],
      }),
    });
    expect(res.status).toBe(422);
  });

  it("endpoint tidak dikenal -> 404 JSON", async () => {
    const res = await SELF.fetch("https://example.com/api/unknown-endpoint");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect((body as { error: string }).error).toBe("Endpoint tidak ditemukan");
  });
});

describe("API admin", () => {
  beforeAll(async () => {
    await createAdmin();
  });

  it("POST /api/admin/login password salah -> 401", async () => {
    const res = await jsonFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin-test", password: "SalahPassword" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/admin/login benar -> 200 + Set-Cookie", async () => {
    const res = await jsonFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin-test", password: "Password123!" }),
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
  });

  it("GET /api/admin/me tanpa cookie -> 401", async () => {
    const res = await SELF.fetch("https://example.com/api/admin/me");
    expect(res.status).toBe(401);
  });

  it("alur login -> /me -> dashboard -> logout", async () => {
    const loginRes = await jsonFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin-test", password: "Password123!" }),
    });
    const setCookie = loginRes.headers.get("Set-Cookie");
    expect(setCookie).not.toBeNull();
    const cookie = setCookie!.split(";")[0];

    // /me dengan cookie
    const meRes = await SELF.fetch("https://example.com/api/admin/me", {
      headers: { Cookie: cookie },
    });
    expect(meRes.status).toBe(200);
    const me = (await meRes.json()) as { admin: { username: string } };
    expect(me.admin.username).toBe("admin-test");

    // CRUD soal
    const createRes = await jsonFetch("/api/admin/questions", {
      method: "POST",
      headers: { Cookie: cookie },
      body: JSON.stringify({ pertanyaan: "Pertanyaan via admin", status: 1, urutan: 0 }),
    });
    expect(createRes.status).toBe(201);

    // dashboard
    const dashRes = await SELF.fetch("https://example.com/api/admin/dashboard", {
      headers: { Cookie: cookie },
    });
    expect(dashRes.status).toBe(200);
    const dash = (await dashRes.json()) as { data: { per_question: unknown[] } };
    expect(Array.isArray(dash.data.per_question)).toBe(true);

    // logout -> sesi invalid
    await SELF.fetch("https://example.com/api/admin/logout", {
      method: "POST",
      headers: { Cookie: cookie },
    });
    const afterLogout = await SELF.fetch("https://example.com/api/admin/me", {
      headers: { Cookie: cookie },
    });
    expect(afterLogout.status).toBe(401);
  });

  it("POST /api/admin/questions tanpa auth -> 401", async () => {
    const res = await jsonFetch("/api/admin/questions", {
      method: "POST",
      body: JSON.stringify({ pertanyaan: "Hack", status: 1, urutan: 0 }),
    });
    expect(res.status).toBe(401);
  });
});

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  questionSchema,
  respondentSchema,
  submitSurveySchema,
  adminCreateSchema,
} from "../../worker/src/lib/validators";

describe("validators", () => {
  describe("loginSchema", () => {
    it("login valid", () => {
      const r = loginSchema.safeParse({ username: "admin-talun", password: "Kelurahan123!" });
      expect(r.success).toBe(true);
    });

    it("password terlalu pendek ditolak", () => {
      const r = loginSchema.safeParse({ username: "admin", password: "pendek" });
      expect(r.success).toBe(false);
    });
  });

  describe("questionSchema", () => {
    it("pertanyaan valid", () => {
      const r = questionSchema.safeParse({
        pertanyaan: "Bagaimana kepuasan Anda terhadap pelayanan?",
        status: 1,
      });
      expect(r.success).toBe(true);
    });

    it("pertanyaan terlalu pendek ditolak", () => {
      const r = questionSchema.safeParse({ pertanyaan: "Pendek", status: 1 });
      expect(r.success).toBe(false);
    });

    it("status tidak valid ditolak", () => {
      const r = questionSchema.safeParse({ pertanyaan: "Pertanyaan cukup panjang ini", status: 2 });
      expect(r.success).toBe(false);
    });
  });

  describe("respondentSchema", () => {
    it("responden valid", () => {
      const r = respondentSchema.safeParse({
        nama: "Budi Santoso",
        usia: 34,
        jk: "L",
        pendidikan: "Sarjana (S1)",
        pekerjaan: "Wiraswasta",
      });
      expect(r.success).toBe(true);
    });

    it("usia di bawah 15 ditolak", () => {
      const r = respondentSchema.safeParse({
        nama: "Budi",
        usia: 12,
        jk: "L",
        pendidikan: "SD",
        pekerjaan: "Pelajar",
      });
      expect(r.success).toBe(false);
    });

    it("jk tidak valid ditolak", () => {
      const r = respondentSchema.safeParse({
        nama: "Budi",
        usia: 30,
        jk: "X",
        pendidikan: "SD",
        pekerjaan: "Petani",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("submitSurveySchema", () => {
    it("submit valid dengan minimal 1 jawaban", () => {
      const r = submitSurveySchema.safeParse({
        respondent: {
          nama: "Budi",
          usia: 30,
          jk: "L",
          pendidikan: "SD",
          pekerjaan: "Petani",
        },
        answers: [{ question_id: 1, skor: 5 }],
      });
      expect(r.success).toBe(true);
    });

    it("tanpa jawaban ditolak", () => {
      const r = submitSurveySchema.safeParse({
        respondent: {
          nama: "Budi",
          usia: 30,
          jk: "L",
          pendidikan: "SD",
          pekerjaan: "Petani",
        },
        answers: [],
      });
      expect(r.success).toBe(false);
    });

    it("skor di luar 1-5 ditolak", () => {
      const r = submitSurveySchema.safeParse({
        respondent: {
          nama: "Budi",
          usia: 30,
          jk: "L",
          pendidikan: "SD",
          pekerjaan: "Petani",
        },
        answers: [{ question_id: 1, skor: 9 }],
      });
      expect(r.success).toBe(false);
    });
  });

  describe("adminCreateSchema", () => {
    it("username dengan karakter aneh ditolak", () => {
      const r = adminCreateSchema.safeParse({
        username: "admin!@#",
        password: "password123",
        nama_lengkap: "Admin Test",
      });
      expect(r.success).toBe(false);
    });

    it("username valid diterima", () => {
      const r = adminCreateSchema.safeParse({
        username: "admin_talun2",
        password: "password123",
        nama_lengkap: "Admin Test",
      });
      expect(r.success).toBe(true);
    });
  });
});

import { z } from "zod";

/** Validasi input di SERVER — tidak pernah percaya data dari klien. */

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
});

export const questionSchema = z.object({
  pertanyaan: z
    .string()
    .trim()
    .min(10, "Pertanyaan minimal 10 karakter")
    .max(500, "Pertanyaan maksimal 500 karakter"),
  status: z.union([z.literal(0), z.literal(1)]),
  urutan: z.number().int().min(0).max(999).default(0),
});

export const questionUpdateSchema = questionSchema.partial();

export const respondentSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  usia: z.coerce
    .number()
    .int("Usia harus bilangan bulat")
    .min(15, "Usia minimal 15 tahun")
    .max(120, "Usia maksimal 120 tahun"),
  jk: z.enum(["L", "P"], { message: "Jenis kelamin tidak valid" }),
  pendidikan: z
    .string()
    .trim()
    .min(1, "Pendidikan wajib diisi")
    .max(50, "Pendidikan maksimal 50 karakter"),
  pekerjaan: z
    .string()
    .trim()
    .min(2, "Pekerjaan minimal 2 karakter")
    .max(100, "Pekerjaan maksimal 100 karakter"),
  kritik_saran: z
    .string()
    .trim()
    .max(2000, "Kritik & saran maksimal 2000 karakter")
    .optional()
    .default(""),
});

export const answerSchema = z.object({
  question_id: z.coerce.number().int().positive(),
  skor: z.coerce.number().int().min(1).max(5),
});

export const submitSurveySchema = z.object({
  respondent: respondentSchema,
  answers: z
    .array(answerSchema)
    .min(1, "Minimal satu jawaban wajib diisi")
    .max(50, "Terlalu banyak jawaban"),
});

export const adminCreateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya huruf, angka, dan underscore"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
  nama_lengkap: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
});

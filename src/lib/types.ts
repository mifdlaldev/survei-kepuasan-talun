/** Tipe data bersama frontend — harus sinkron dengan worker API. */

export interface Question {
  id: number;
  pertanyaan: string;
  urutan: number;
}

export interface QuestionAdmin extends Question {
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface RespondentInput {
  nama: string;
  usia: number;
  jk: "L" | "P";
  pendidikan: string;
  pekerjaan: string;
  kritik_saran?: string;
}

export interface AnswerInput {
  question_id: number;
  skor: number;
}

export interface AdminSession {
  id: number;
  username: string;
  nama_lengkap: string;
}

export interface DashboardData {
  total_respondents: number;
  total_answers: number;
  avg_score: number | null;
  per_question: {
    id: number;
    pertanyaan: string;
    total: number;
    avg_skor: number | null;
  }[];
  recent_respondents: {
    id: number;
    nama: string;
    usia: number;
    jk: string;
    pendidikan: string;
    pekerjaan: string;
    created_at: string;
  }[];
}

export interface FeedbackItem {
  id: number;
  nama: string;
  kritik_saran: string;
  created_at: string;
}

export const LIKERT_OPTIONS = [
  { value: 1, label: "Sangat Tidak Puas" },
  { value: 2, label: "Tidak Puas" },
  { value: 3, label: "Cukup Puas" },
  { value: 4, label: "Puas" },
  { value: 5, label: "Sangat Puas" },
] as const;

export const PENDIDIKAN_OPTIONS = [
  "SD / Sederajat",
  "SMP / Sederajat",
  "SMA / Sederajat",
  "SMK",
  "Diploma (D3)",
  "Sarjana (S1)",
  "Lainnya",
] as const;

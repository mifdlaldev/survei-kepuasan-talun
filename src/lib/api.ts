import type {
  AdminSession,
  AnswerInput,
  DashboardData,
  FeedbackItem,
  Question,
  QuestionAdmin,
  RespondentInput,
} from "./types";

/**
 * Klien API frontend. Semua request lewat fetch ke /api.
 * Session cookie dikelola browser otomatis (HttpOnly — tidak disentuh JS).
 */

class ApiClientError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    credentials: "same-origin",
    ...options,
  });

  if (!res.ok) {
    let message = "Terjadi kesalahan. Silakan coba lagi.";
    let retryAfter: number | undefined;
    try {
      const body = (await res.json()) as { error?: string; retry_after?: number };
      if (body.error) message = body.error;
      retryAfter = body.retry_after;
    } catch {
      // body bukan JSON — pakai pesan default
    }
    throw new ApiClientError(message, res.status, retryAfter);
  }

  return (await res.json()) as T;
}

export const api = {
  // --- Publik ---
  getQuestions: () =>
    request<{ data: Question[] }>("/questions"),

  submitSurvey: (input: {
    respondent: RespondentInput;
    answers: AnswerInput[];
  }) =>
    request<{ success: boolean; respondent_id: number }>("/survey", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  // --- Admin: auth ---
  login: (username: string, password: string) =>
    request<{ success: boolean; admin: AdminSession }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<{ success: boolean }>("/admin/logout", { method: "POST" }),

  getMe: () =>
    request<{ admin: AdminSession }>("/admin/me"),

  // --- Admin: data ---
  getAdminQuestions: () =>
    request<{ data: QuestionAdmin[] }>("/admin/questions"),

  createQuestion: (input: {
    pertanyaan: string;
    status: 0 | 1;
    urutan: number;
  }) =>
    request<{ success: boolean; id: number }>("/admin/questions", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateQuestion: (
    id: number,
    input: Partial<{
      pertanyaan: string;
      status: 0 | 1;
      urutan: number;
    }>,
  ) =>
    request<{ success: boolean }>(`/admin/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteQuestion: (id: number) =>
    request<{ success: boolean }>(`/admin/questions/${id}`, {
      method: "DELETE",
    }),

  getDashboard: () =>
    request<{ data: DashboardData }>("/admin/dashboard"),

  getFeedback: () =>
    request<{ data: FeedbackItem[] }>("/admin/feedback"),
};

export { ApiClientError };

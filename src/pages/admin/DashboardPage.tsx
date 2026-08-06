import { useEffect, useState } from "react";
import { Users, MessageSquareText, Star, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

function scoreLabel(score: number | null): string {
  if (score === null) return "—";
  if (score >= 4.5) return "Sangat Puas";
  if (score >= 3.5) return "Puas";
  if (score >= 2.5) return "Cukup Puas";
  if (score >= 1.5) return "Tidak Puas";
  return "Sangat Tidak Puas";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard()
      .then(({ data }) => setData(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data."));
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-pine-600" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Responden",
      value: data.total_respondents,
      icon: Users,
    },
    {
      label: "Total Jawaban",
      value: data.total_answers,
      icon: MessageSquareText,
    },
    {
      label: "Skor Rata-rata",
      value: data.avg_score != null ? data.avg_score.toFixed(2) : "—",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">Dashboard</h1>
        <p className="mt-1 text-sm text-charcoal-700/70">
          Ringkasan data Survei Kepuasan Masyarakat
        </p>
      </div>

      {/* Statistik */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-sand-200 bg-white p-5 shadow-card"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-pine-50">
              <s.icon className="h-5 w-5 text-pine-700" />
            </div>
            <p className="text-3xl font-bold tabular-nums text-charcoal-900">{s.value}</p>
            <p className="mt-1 text-sm text-charcoal-700/70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Skor per pertanyaan */}
      <div className="rounded-xl border border-sand-200 bg-white p-6 shadow-card">
        <h2 className="mb-5 font-display text-lg font-semibold text-charcoal-900">
          Skor per Pertanyaan
        </h2>
        {data.per_question.length === 0 ? (
          <p className="text-sm text-charcoal-700/60">
            Belum ada data. Survei pertama akan muncul di sini.
          </p>
        ) : (
          <div className="space-y-5">
            {data.per_question.map((q) => (
              <div key={q.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-4">
                  <p className="text-sm font-medium text-charcoal-900">{q.pertanyaan}</p>
                  <p className="shrink-0 text-sm tabular-nums text-charcoal-700/70">
                    {q.avg_skor != null ? q.avg_skor.toFixed(2) : "—"}{" "}
                    <span className="text-xs text-charcoal-700/50">
                      ({q.total} jawaban)
                    </span>
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pine-600 to-padi-400 transition-all duration-700"
                    style={{ width: `${q.avg_skor != null ? (q.avg_skor / 5) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-charcoal-700/50">{scoreLabel(q.avg_skor)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responden terbaru */}
      <div className="rounded-xl border border-sand-200 bg-white p-6 shadow-card">
        <h2 className="mb-5 font-display text-lg font-semibold text-charcoal-900">
          Responden Terbaru
        </h2>
        {data.recent_respondents.length === 0 ? (
          <p className="text-sm text-charcoal-700/60">Belum ada responden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-xs uppercase tracking-wider text-charcoal-700/50">
                  <th className="pb-3 pr-4 font-semibold">Nama</th>
                  <th className="pb-3 pr-4 font-semibold">Usia</th>
                  <th className="pb-3 pr-4 font-semibold">JK</th>
                  <th className="pb-3 pr-4 font-semibold">Pendidikan</th>
                  <th className="pb-3 pr-4 font-semibold">Pekerjaan</th>
                  <th className="pb-3 font-semibold">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_respondents.map((r) => (
                  <tr key={r.id} className="border-b border-sand-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-charcoal-900">{r.nama}</td>
                    <td className="py-3 pr-4 tabular-nums text-charcoal-700/80">{r.usia}</td>
                    <td className="py-3 pr-4 text-charcoal-700/80">
                      {r.jk === "L" ? "Laki-laki" : "Perempuan"}
                    </td>
                    <td className="py-3 pr-4 text-charcoal-700/80">{r.pendidikan}</td>
                    <td className="py-3 pr-4 text-charcoal-700/80">{r.pekerjaan}</td>
                    <td className="py-3 text-charcoal-700/60">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { FeedbackItem } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getFeedback()
      .then(({ data }) => setItems(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat kritik & saran."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-charcoal-900">
          Kritik &amp; Saran
        </h1>
        <p className="mt-1 text-sm text-charcoal-700/70">
          Masukan dari masyarakat yang mengisi kolom kritik &amp; saran
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-pine-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-sand-200 bg-white p-12 text-center">
          <MessageSquare className="mb-3 h-8 w-8 text-charcoal-700/30" />
          <p className="text-sm text-charcoal-700/60">
            Belum ada kritik &amp; saran dari masyarakat.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-xl border border-sand-200 bg-white p-5 shadow-card"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-semibold text-charcoal-900">{item.nama}</p>
                <p className="shrink-0 text-xs text-charcoal-700/50">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-charcoal-700/90">
                {item.kritik_saran}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

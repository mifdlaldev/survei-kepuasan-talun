import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { api } from "@/lib/api";
import type { QuestionAdmin } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/Field";

export default function QuestionPage() {
  const [questions, setQuestions] = useState<QuestionAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.getAdminQuestions();
      setQuestions(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat soal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    const text = editText.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      await api.createQuestion({
        pertanyaan: text,
        status: 1,
        urutan: questions.length,
      });
      setEditText("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah soal.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (q: QuestionAdmin) => {
    try {
      await api.updateQuestion(q.id, { status: q.status === 1 ? 0 : 1 });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status.");
    }
  };

  const handleSaveEdit = async () => {
    if (editingId === null || saving) return;
    const text = editText.trim();
    if (!text) return;
    setSaving(true);
    try {
      await api.updateQuestion(editingId, { pertanyaan: text });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q: QuestionAdmin) => {
    if (!window.confirm(`Hapus pertanyaan "${q.pertanyaan}"?`)) return;
    try {
      await api.deleteQuestion(q.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus soal.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-charcoal-900">Kelola Soal</h1>
        <p className="mt-1 text-sm text-charcoal-700/70">
          Tambah, ubah, aktifkan, atau nonaktifkan pertanyaan survei
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tambah soal */}
      <div className="rounded-xl border border-sand-200 bg-white p-6 shadow-card">
        <TextAreaField
          label="Pertanyaan baru"
          placeholder="Tulis pertanyaan survei baru…"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={() => void handleCreate()} disabled={saving || !editText.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Tambah Pertanyaan
          </Button>
        </div>
      </div>

      {/* Daftar soal */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-pine-600" />
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sand-200 bg-white p-10 text-center text-sm text-charcoal-700/60">
          Belum ada pertanyaan. Tambahkan pertanyaan pertama di atas.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-sand-200 bg-white p-5 shadow-card"
            >
              {editingId === q.id ? (
                <div className="space-y-3">
                  <TextAreaField
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Pertanyaan…"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setEditingId(null)}>
                      Batal
                    </Button>
                    <Button onClick={() => void handleSaveEdit()} disabled={saving || !editText.trim()}>
                      <Check className="h-4 w-4" /> Simpan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal-900">
                      {q.urutan + 1}. {q.pertanyaan}
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        q.status === 1
                          ? "bg-pine-50 text-pine-700"
                          : "bg-sand-100 text-charcoal-700/60"
                      }`}
                    >
                      {q.status === 1 ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setEditingId(q.id);
                        setEditText(q.pertanyaan);
                      }}
                      aria-label="Ubah pertanyaan"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => void handleToggle(q)}>
                      {q.status === 1 ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => void handleDelete(q)}
                      aria-label="Hapus pertanyaan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hint */}
      <div className="flex items-center justify-end gap-2 text-xs text-charcoal-700/50">
        <X className="h-3.5 w-3.5" />
        Soal nonaktif tidak tampil di survei publik.
      </div>
    </div>
  );
}

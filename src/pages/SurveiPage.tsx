import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Send, Loader2, CheckCircle2, Info } from "lucide-react";
import { api } from "@/lib/api";
import { LIKERT_OPTIONS, PENDIDIKAN_OPTIONS } from "@/lib/types";
import type { Question } from "@/lib/types";
import { BatikPattern } from "@/components/BatikPattern";
import { BambooProgress } from "@/components/BambooProgress";
import { Button } from "@/components/ui/Button";
import { TextField, SelectField, TextAreaField } from "@/components/ui/Field";

type Step = "intro" | "biodata" | "survey" | "comment" | "success";

const STEPS: Step[] = ["intro", "biodata", "survey", "comment", "success"];

const initialBiodata = {
  nama: "",
  jk: "" as "" | "L" | "P",
  usia: "",
  pendidikan: "",
  pekerjaan: "",
};

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function SurveiPage() {
  const [step, setStep] = useState<Step>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [comment, setComment] = useState("");
  const [biodata, setBiodata] = useState(initialBiodata);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchQuestions = async () => {
    try {
      const { data } = await api.getQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pertanyaan.");
    }
  };

  const startSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biodata.nama || !biodata.jk || !biodata.usia || !biodata.pendidikan || !biodata.pekerjaan) {
      setError("Mohon lengkapi semua data diri terlebih dahulu.");
      return;
    }
    if (questions.length === 0) {
      setError("Pertanyaan belum dimuat. Silakan tunggu atau muat ulang halaman.");
      return;
    }
    setError("");
    setStep("survey");
  };

  const handleAnswer = (val: number) => {
    setAnswers((prev) => ({ ...prev, [questions[qIndex].id]: val }));
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setStep("comment");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      await api.submitSurvey({
        respondent: {
          nama: biodata.nama,
          usia: Number(biodata.usia),
          jk: biodata.jk as "L" | "P",
          pendidikan: biodata.pendidikan,
          pekerjaan: biodata.pekerjaan,
          kritik_saran: comment,
        },
        answers: Object.entries(answers).map(([qid, skor]) => ({
          question_id: Number(qid),
          skor,
        })),
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim survei.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressIndex = Math.max(0, STEPS.indexOf(step) - 1);
  const isSurveyStep = step === "survey";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6">
      <BatikPattern />

      {/* Header instansi */}
      <header className="relative mb-6 flex w-full max-w-2xl items-center gap-4">
        <img
          src="/logoinsunmedal.png"
          alt="Logo Kelurahan Talun"
          className="h-14 w-14 rounded-xl bg-white p-1 shadow-card"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-pine-600">
            Pemerintah Kabupaten Sumedang
          </p>
          <h1 className="font-display text-2xl font-bold leading-tight text-charcoal-900">
            Survei Kepuasan Masyarakat
          </h1>
          <p className="text-sm text-charcoal-700/70">Kantor Kelurahan Talun, Kec. Sumedang Utara</p>
        </div>
      </header>

      <div className="relative w-full max-w-2xl">
        <div className="min-h-[520px] overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lift">
          {step !== "success" && (
            <div className="border-b border-sand-100 px-6 py-5 sm:px-8">
              <BambooProgress
                current={progressIndex}
                total={4}
                label={isSurveyStep ? "Pertanyaan" : "Langkah"}
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {step === "intro" && (
                <motion.div key="intro" {...slide} className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="font-display text-2xl font-bold text-charcoal-900">
                      Selamat datang
                    </h2>
                    <p className="text-sm leading-relaxed text-charcoal-700/80">
                      Survei ini mengukur kepuasan Anda terhadap pelayanan publik di Kantor
                      Kelurahan Talun, sesuai PermenPAN-RB No. 14 Tahun 2017.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-pine-100 bg-pine-50/60 p-5">
                    <p className="flex items-start gap-2.5 text-sm text-charcoal-700">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-pine-600" />
                      Identitas Anda dirahasiakan dan hanya digunakan untuk keperluan evaluasi
                      layanan.
                    </p>
                    <p className="flex items-start gap-2.5 text-sm text-charcoal-700">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-pine-600" />
                      Hanya membutuhkan waktu 2–3 menit.
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setError("");
                      void fetchQuestions();
                      setStep("biodata");
                    }}
                  >
                    Mulai Isi Survei <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === "biodata" && (
                <motion.form
                  key="biodata"
                  {...slide}
                  onSubmit={startSurvey}
                  className="space-y-5"
                >
                  <h2 className="font-display text-xl font-semibold text-charcoal-900">
                    Data responden
                  </h2>

                  <TextField
                    label="Nama lengkap"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={biodata.nama}
                    onChange={(e) => setBiodata({ ...biodata, nama: e.target.value })}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="Usia (tahun)"
                      type="number"
                      required
                      min={15}
                      max={120}
                      placeholder="Contoh: 34"
                      value={biodata.usia}
                      onChange={(e) => setBiodata({ ...biodata, usia: e.target.value })}
                    />
                    <SelectField
                      label="Jenis kelamin"
                      required
                      value={biodata.jk}
                      onChange={(e) =>
                        setBiodata({ ...biodata, jk: e.target.value as "L" | "P" })
                      }
                    >
                      <option value="">Pilih…</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </SelectField>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField
                      label="Pendidikan terakhir"
                      required
                      value={biodata.pendidikan}
                      onChange={(e) => setBiodata({ ...biodata, pendidikan: e.target.value })}
                    >
                      <option value="">Pilih…</option>
                      {PENDIDIKAN_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </SelectField>
                    <TextField
                      label="Pekerjaan"
                      required
                      placeholder="Contoh: Wiraswasta"
                      value={biodata.pekerjaan}
                      onChange={(e) => setBiodata({ ...biodata, pekerjaan: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep("intro")}>
                      Batal
                    </Button>
                    <Button type="submit" className="flex-1">
                      Lanjut ke Pertanyaan <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === "survey" && questions.length > 0 && (
                <motion.div key={`q-${qIndex}`} {...slide} className="flex h-full flex-col">
                  <h2 className="mb-6 font-display text-xl font-semibold leading-relaxed text-charcoal-900">
                    {questions[qIndex].pertanyaan}
                  </h2>

                  <div className="flex-1 space-y-3">
                    {LIKERT_OPTIONS.map((opt) => {
                      const selected = answers[questions[qIndex].id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswer(opt.value)}
                          className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600 ${
                            selected
                              ? "border-pine-600 bg-pine-50 text-pine-800"
                              : "border-sand-100 hover:border-pine-300 hover:bg-sand-50"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected ? "border-pine-600 bg-pine-600" : "border-sand-200"
                            }`}
                          >
                            {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-sand-100 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => (qIndex > 0 ? setQIndex(qIndex - 1) : setStep("biodata"))}
                    >
                      <ChevronLeft className="h-4 w-4" /> Kembali
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!answers[questions[qIndex].id]}
                    >
                      {qIndex < questions.length - 1 ? "Selanjutnya" : "Lanjut"} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "survey" && questions.length === 0 && !error && (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-pine-600" />
                </div>
              )}

              {step === "comment" && (
                <motion.div key="comment" {...slide} className="flex h-full flex-col">
                  <h2 className="font-display text-xl font-semibold text-charcoal-900">
                    Kritik &amp; saran
                  </h2>
                  <p className="mt-1 text-sm text-charcoal-700/70">
                    Opsional — masukan Anda sangat berarti untuk kemajuan layanan.
                  </p>

                  <TextAreaField
                    className="mt-5 flex-1"
                    placeholder="Tuliskan masukan Anda untuk Kelurahan Talun…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <div className="mt-6 flex items-center justify-between border-t border-sand-100 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setStep("survey")}>
                      <ChevronLeft className="h-4 w-4" /> Kembali
                    </Button>
                    <Button type="button" onClick={() => void handleSubmit()} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Mengirim…
                        </>
                      ) : (
                        <>
                          Kirim Survei <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pine-50">
                    <CheckCircle2 className="h-10 w-10 text-pine-600" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-charcoal-900">
                    Terima kasih!
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-charcoal-700/80">
                    Data Anda berhasil kami simpan. Masukan Anda sangat berarti bagi peningkatan
                    layanan di Kelurahan Talun.
                  </p>
                  <Button className="mt-8" onClick={() => window.location.reload()}>
                    Isi Survei Baru
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="mt-6 text-center text-xs text-charcoal-700/50">
          © {new Date().getFullYear()} Pemerintah Desa/Kelurahan Talun — Kabupaten Sumedang
        </footer>
      </div>
    </div>
  );
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock framer-motion: animasi mode="wait" menunda render step berikutnya
// sampai animasi selesai. Mock jadi passthrough agar test deterministik.
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  const passthrough = ({ children }: { children: React.ReactNode }) => children;
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (target, prop) => {
        if (typeof prop === "string" && prop in target) {
          return passthrough;
        }
        return target[prop as keyof typeof target];
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import SurveiPage from "@/pages/SurveiPage";

describe("SurveiPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("menampilkan halaman intro dengan informasi survei", () => {
    render(<SurveiPage />);
    expect(screen.getByText("Selamat datang")).toBeInTheDocument();
    expect(screen.getByText(/Survei ini mengukur kepuasan Anda/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mulai Isi Survei/i })).toBeInTheDocument();
  });

  it("klik mulai -> form biodata muncul", async () => {
    const user = userEvent.setup();
    render(<SurveiPage />);
    await user.click(screen.getByRole("button", { name: /Mulai Isi Survei/i }));
    expect(screen.getByText("Data responden")).toBeInTheDocument();
  });

  it("submit biodata kosong -> peringatan validasi", async () => {
    const user = userEvent.setup();
    render(<SurveiPage />);
    await user.click(screen.getByRole("button", { name: /Mulai Isi Survei/i }));

    // fireEvent.submit melewati constraint validation (required) di jsdom
    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    expect(screen.getByText(/Mohon lengkapi semua data diri/i)).toBeInTheDocument();
  });

  it("render halaman survei setelah biodata lengkap (mock fetch soal)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: 1, pertanyaan: "Bagaimana kepuasan Anda terhadap pelayanan?", urutan: 0 },
          { id: 2, pertanyaan: "Bagaimana kepuasan Anda terhadap keramahan petugas?", urutan: 1 },
        ],
      }),
    });

    const user = userEvent.setup();
    render(<SurveiPage />);
    await user.click(screen.getByRole("button", { name: /Mulai Isi Survei/i }));

    await user.type(screen.getByLabelText("Nama lengkap"), "Budi Santoso");
    await user.type(screen.getByLabelText("Usia (tahun)"), "34");
    await user.selectOptions(screen.getByLabelText("Jenis kelamin"), "L");
    await user.selectOptions(screen.getByLabelText("Pendidikan terakhir"), "Sarjana (S1)");
    await user.type(screen.getByLabelText("Pekerjaan"), "Wiraswasta");
    await user.click(screen.getByRole("button", { name: /Lanjut ke Pertanyaan/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Bagaimana kepuasan Anda terhadap pelayanan?"),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByText("Puas"));
    await user.click(screen.getByRole("button", { name: /Selanjutnya/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Bagaimana kepuasan Anda terhadap keramahan petugas?"),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByText("Sangat Puas"));
    await user.click(screen.getByRole("button", { name: /Lanjut/i }));
    expect(screen.getByText(/Kritik & saran/i)).toBeInTheDocument();
  });
});

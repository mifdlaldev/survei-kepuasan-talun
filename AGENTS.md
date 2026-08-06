# AGENTS.md — Pedoman Kerja untuk AI Coding Assistant

> Dokumen ini adalah **kontrak kerja** antara pemilik repositori dan setiap AI coding assistant (agent) yang bekerja pada kode repositori ini. Kepatuhan terhadap aturan ini bersifat **wajib dan tidak dapat ditawar**.

## Tujuan Dokumen

Repositori ini adalah **produk yang dipakai oleh instansi pemerintah** (Kantor Kelurahan Talun). Kesalahan kode berdampak langsung pada pelayanan publik dan kepercayaan masyarakat. Karena itu, setiap pekerjaan AI di repositori ini harus mengikuti standar ketat di bawah.

---

## 1. LARANGAN KERAS: HALUSINASI

**Halusinasi adalah pelanggaran terberat dalam repositori ini.**

### Definisi halusinasi yang dilarang

1. **Mengklaim fakta yang tidak dapat diverifikasi** — misalnya menyebut fitur, API, tabel database, atau perilaku sistem yang tidak ada di kode.
2. **Membuat API/kolom/tabel yang tidak ada** — misalnya memanggil `supabase.from("feedback")` padahal tabel sebenarnya bernama `survey_answers`.
3. **Mengarang struktur file/direktori** — menyebut file yang tidak pernah dibaca atau diverifikasi keberadaannya.
4. **Menebak konfigurasi** — misalnya menyebut variabel env `VITE_SUPABASE_ANON_KEY` sudah dikonfigurasi padahal belum dicek.
5. **Mengarang dependensi** — menyebut library yang tidak terdaftar di `package.json`.
6. **Menggeneralisasi tanpa bukti** — menyimpulkan pola dari satu contoh tanpa membaca kode terkait.

### Protokol anti-halusinasi (WAJIB sebelum menulis kode)

| Langkah | Tindakan |
|---------|----------|
| 1 | **Baca dulu** — baca file yang relevan SEBELUM mengubahnya. Dilarang mengedit file yang belum dibaca. |
| 2 | **Verifikasi keberadaan** — konfirmasi nama file, fungsi, variabel, dan path dengan membaca kode, bukan menebak. |
| 3 | **Cek referensi silang** — jika menyebut nama simbol/tabel/kolom, pastikan nama itu benar-benar ada di repositori atau dokumentasi Supabase. |
| 4 | **Uji sebelum mengklaim** — jalankan build (`npm run build`) dan lint (`npm run lint`) sebelum menyatakan pekerjaan selesai. |
| 5 | **Jujur soal ketidaktahuan** — jika tidak yakin, KATAKAN "saya tidak yakin" daripada mengarang jawaban. |

### Sanksi

Setiap hasil kerja AI yang mengandung halusinasi **wajib ditolak dan dikerjakan ulang**. Pemilik repositori berhak menolak seluruh pekerjaan jika ditemukan satu pun halusinasi.

---

## 2. Aturan Kode

- **Jangan pernah menyembunyikan error** — dilarang `catch` kosong, `// eslint-disable`, atau menekan peringatan tanpa alasan tertulis.
- **Jangan menyisipkan secret** — dilarang menulis API key, token, atau kredensial ke dalam kode atau file yang ter-commit.
- **Jangan merusak fungsi yang berjalan** — jika mengubah logika, verifikasi alur lama tetap bekerja.
- **Ikuti pola yang ada** — konsisten dengan gaya kode file di sekitarnya (React hooks, naming convention, struktur folder).
- **Perubahan minimum** — kerjakan sesuai permintaan, jangan refactor besar tanpa instruksi.

## 3. Aturan Komunikasi

- **Jangan mengarang riwayat** — dilarang menyebut "commit sebelumnya menambahkan X" tanpa memverifikasi lewat `git log`.
- **Jangan mengarang status** — dilarang mengklaim "fitur sudah di-deploy" atau "tes sudah jalan" tanpa bukti.
- **Laporkan secara faktual** — sampaikan apa yang benar-benar dibaca, diubah, dan diuji, bukan apa yang seharusnya terjadi.

## 4. Alur Kerja Standar

```text
1. BACA    → baca file relevan, pahami konteks
2. CEK     → verifikasi semua nama & asumsi terhadap kode nyata
3. KERJA   → tulis perubahan minimal sesuai pola yang ada
4. UJI     → jalankan build + lint
5. LAPOR   → laporkan fakta, bukan klaim
```

## 5. Teknologi yang Dipakai

- React 19 + Vite 7
- Tailwind CSS 4
- React Router 7
- Supabase (PostgreSQL)
- Deployment: Vercel

---

_Dokumen ini berlaku sejak commit pertama setelah pembuatannya. Setiap AI coding assistant yang bekerja di repositori ini dianggap telah membaca dan menyetujui seluruh isi dokumen ini._

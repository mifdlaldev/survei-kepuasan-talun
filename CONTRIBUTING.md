# Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada **Survei Kepuasan Masyarakat Kelurahan Talun**. Proyek ini melayani instansi pemerintah, sehingga kualitas dan akurasi kode adalah prioritas utama.

## Cara Berkontribusi

1. **Fork** repositori ini dan buat branch baru dari `main`.
2. Buat perubahan dengan mengikuti [Aturan Kode](#aturan-kode).
3. Pastikan build dan lint lolos:
   ```bash
   npm run lint
   npm run build
   ```
4. Ajukan **Pull Request** dengan deskripsi yang jelas: apa yang diubah, mengapa, dan bagaimana cara mengujinya.
5. Tunggu peninjauan. Sertakan tangkapan layar untuk perubahan UI bila memungkinkan.

## Aturan Kode

- **Baca sebelum ubah** — pahami kode di sekitarnya terlebih dahulu.
- **Perubahan minimum** — hindari refactor besar yang tidak terkait dengan tujuan PR.
- **Jangan menyembunyikan error** — tidak ada `catch` kosong atau penekanan peringatan tanpa alasan.
- **Jangan commit secret** — API key dan kredensial hanya lewat variabel lingkungan (`.env`).
- **Ikuti pola yang ada** — konsisten dengan gaya kode file di sekitarnya.
- **Bahasa kode & komentar**: Indonesia, mengikuti kode yang sudah ada.

## Struktur Branch

- `main` — branch produksi. Dilarang commit langsung; semua perubahan melalui Pull Request.
- Branch fitur: `feat/nama-fitur`, `fix/nama-perbaikan`, `docs/nama-dokumentasi`.

## Menjalankan Proyek Secara Lokal

```bash
npm install
cp .env.example .env   # isi kredensial Supabase
npm run dev
```

## Melaporkan Bug

Gunakan [GitHub Issues](https://github.com/mifdlaldev/survei-kepuasan-talun/issues) dengan label `bug`. Sertakan:

- Langkah reproduksi
- Perilaku yang diharapkan vs aktual
- Tangkapan layar (bila ada)
- Informasi browser/perangkat

> **Catatan keamanan:** Jangan laporkan kerentanan keamanan melalui Issues publik. Gunakan prosedur di [SECURITY.md](SECURITY.md).

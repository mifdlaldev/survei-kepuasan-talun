<p align="center">
  <img src="public/logoinsunmedal.png" alt="Logo Kelurahan Talun" width="110" />
</p>

<h1 align="center">Survei Kepuasan Masyarakat Kelurahan Talun</h1>

<p align="center">
  <a href="https://github.com/mifdlaldev/survei-kepuasan-talun/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mifdlaldev/survei-kepuasan-talun" alt="License" /></a>
  <a href="https://github.com/mifdlaldev/survei-kepuasan-talun/releases"><img src="https://img.shields.io/github/v/release/mifdlaldev/survei-kepuasan-talun" alt="GitHub Release" /></a>
  <a href="https://github.com/mifdlaldev/survei-kepuasan-talun/actions"><img src="https://github.com/mifdlaldev/survei-kepuasan-talun/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

<p align="center">
  <em>Aplikasi Survei Kepuasan Masyarakat (SKM) terhadap kualitas pelayanan publik di <strong>Kantor Kelurahan Talun, Kecamatan Sumedang Utara, Kabupaten Sumedang, Jawa Barat</strong>.</em>
</p>

## Tentang

Survei Kepuasan Masyarakat (SKM) merupakan instrumen pengukuran tingkat kepuasan masyarakat terhadap kualitas pelayanan publik, sesuai amanat **PermenPAN-RB No. 14 Tahun 2017** tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.

Aplikasi ini memungkinkan masyarakat mengisi survei secara daring dari perangkat masing-masing (ponsel/komputer), menggantikan metode kertas yang lebih lambat dan rentan kehilangan data. Hasil survei dikelola melalui dashboard admin dan dijadikan bahan evaluasi peningkatan kualitas pelayanan.

> **Status**: Kode sumber repositori ini dipublikasikan untuk keperluan dokumentasi. Aplikasi berjalan terbatas untuk warga Kelurahan Talun dan tidak di-deploy secara global.

## Fitur

### Halaman Publik (Warga)
- Formulir survei multi-langkah dengan skala Likert 1–5
- Pengisian data responden (nama, jenis kelamin, usia, pendidikan, pekerjaan)
- Kolom kritik & saran opsional
- Responsif di perangkat seluler maupun desktop
- Animasi transisi halus antar langkah

### Dashboard Admin
- Login admin dengan sesi aman (cookie `HttpOnly`, password ter-hash)
- Dashboard ringkasan data responden dan skor survei
- Kelola daftar pertanyaan (tambah, ubah, aktif/nonaktif)
- Lihat seluruh feedback kritik & saran dari masyarakat

## Tampilan (Screenshot)

| Halaman Survei | Form Data Responden |
|---|---|
| ![Survei intro](docs/screenshots/01-survei-intro.png) | ![Biodata](docs/screenshots/02-survei-biodata.png) |

| Pertanyaan Survei | Dashboard Admin |
|---|---|
| ![Pertanyaan](docs/screenshots/03-survei-pertanyaan.png) | ![Dashboard](docs/screenshots/04-admin-dashboard.png) |

| Kelola Soal | Kritik & Saran |
|---|---|
| ![Kelola soal](docs/screenshots/05-admin-soal.png) | ![Feedback](docs/screenshots/06-admin-feedback.png) |

## Keamanan

- **Semua akses database lewat API Worker** — browser tidak pernah memegang kredensial database.
- Password di-hash dengan **PBKDF2-SHA256** (salt acak per akun), tidak pernah disimpan mentah.
- Sesi login menggunakan **cookie `HttpOnly` + `SameSite=Lax` + `Secure`** — tidak bisa dibaca/diubah JavaScript (bukan localStorage).
- **Rate limiting per-IP** pada endpoint publik (anti-spam form) dan login.
- **Validasi input di sisi server** dengan [Zod](https://zod.dev) — klien tidak pernah dipercaya.
- SQL berparameter (prepared statements) — tahan injeksi.
- Pelaporan kerentanan: lihat [SECURITY.md](SECURITY.md).

## Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | [React](https://react.dev) 19, [Vite](https://vite.dev) 7, TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) 4, [Framer Motion](https://www.framer.com/motion/), [lucide-react](https://lucide.dev) |
| Routing | [React Router](https://reactrouter.com) 7 |
| API | [Hono](https://hono.dev) di [Cloudflare Workers](https://workers.cloudflare.com) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com) + static assets |

## Struktur Proyek

```
├── src/                      # Frontend React + TypeScript
│   ├── App.tsx               # Routing utama (publik + admin)
│   ├── pages/
│   │   ├── SurveiPage.tsx    # Halaman survei publik
│   │   └── admin/            # Login, Dashboard, Kelola Soal, Kritik & Saran
│   ├── components/           # UI bersama + pola batik + progress ruas bambu
│   └── lib/
│       ├── api.ts            # Klien API (fetch ke /api)
│       └── types.ts          # Tipe data bersama
├── worker/                   # Cloudflare Worker (API)
│   ├── index.ts              # Entry Hono + SPA fallback
│   └── src/
│       ├── routes/           # Rute publik + admin
│       ├── middleware/       # Auth sesi + rate limiting
│       └── lib/              # PBKDF2, sesi, validasi Zod
├── migrations/               # Skema SQL D1
├── docs/
│   ├── API.md                # Dokumentasi endpoint API
│   └── screenshots/          # Tangkapan layar aplikasi
├── test/                     # Test worker (Vitest + pool-workers)
└── wrangler.toml             # Konfigurasi Workers + binding D1
```

Dokumentasi lengkap endpoint API: [docs/API.md](docs/API.md).

## Persyaratan

- Node.js 20+ dan npm
- Akun [Cloudflare](https://dash.cloudflare.com) dengan hak akses Workers + D1

## Instalasi Lokal

```bash
# 1. Clone repositori
git clone https://github.com/mifdlaldev/survei-kepuasan-talun.git
cd survei-kepuasan-talun

# 2. Install dependensi
npm install

# 3. Login Cloudflare (buka browser, klik Allow)
npx wrangler login

# 4. Buat database D1 + isi database_id di wrangler.toml
npx wrangler d1 create survei-kepuasan-talun-db
#   Salin nilai database_id dari output ke wrangler.toml

# 5. Terapkan skema database (lokal)
npm run db:generate

# 6. Jalankan server pengembangan (API + frontend)
npx wrangler dev --local --port 8787
```

## Skrip Tersedia

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Menjalankan Vite dev server frontend |
| `npm run build` | Type-check + build frontend ke `dist/` |
| `npm run lint` | Pemeriksaan kode ESLint |
| `npm run db:generate` | Terapkan migration D1 ke database lokal |
| `npm run db:deploy` | Terapkan migration D1 ke database remote |
| `npm run db:seed-admin` | Buat akun admin pertama (`npm run db:seed-admin -- <username> <password> <nama>`) |

## Deployment

Aplikasi ini berjalan terbatas di lingkungan internal Kelurahan Talun. Deployment dilakukan secara privat oleh administrator; instruksi teknis ada di `wrangler.toml` dan [docs/API.md](docs/API.md).

Riwayat perubahan: [CHANGELOG.md](CHANGELOG.md)

## Lisensi

Kode sumber dilisensikan di bawah **Apache License 2.0** — lihat [LICENSE](LICENSE).

Logo dan aset visual lainnya merupakan milik instansi masing-masing dan tidak tercakup dalam lisensi ini.

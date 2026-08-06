# Survei Kepuasan Masyarakat Kelurahan Talun

[![License](https://img.shields.io/github/license/mifdlaldev/survei-kepuasan-talun)](https://github.com/mifdlaldev/survei-kepuasan-talun/blob/main/LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/mifdlaldev/survei-kepuasan-talun)](https://github.com/mifdlaldev/survei-kepuasan-talun/releases)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black)](https://website-kepuasan-masyarakat.vercel.app)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

> Website resmi Survei Kepuasan Masyarakat (SKM) terhadap kualitas pelayanan publik di **Kantor Kelurahan Talun, Kecamatan Cisarua, Kabupaten Sumedang, Jawa Barat**.

## Tentang

Survei Kepuasan Masyarakat (SKM) merupakan instrumen pengukuran tingkat kepuasan masyarakat terhadap kualitas pelayanan publik, sesuai amanat **PermenPAN-RB No. 14 Tahun 2017** tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.

Aplikasi ini memungkinkan masyarakat mengisi survei secara daring dari perangkat masing-masing (ponsel/komputer), menggantikan metode kertas yang lebih lambat dan rentan kehilangan data. Hasil survei dikelola melalui dashboard admin dan dijadikan bahan evaluasi peningkatan kualitas pelayanan.

## Fitur

### Halaman Publik (Warga)
- Formulir survei multi-langkah dengan skala Likert 1–5
- Pengisian data responden (nama, jenis kelamin, usia, pendidikan, pekerjaan)
- Kolom kritik & saran opsional
- Responsif di perangkat seluler maupun desktop
- Animasi transisi halus antar langkah

### Dashboard Admin
- Login admin dengan proteksi rute
- Dashboard ringkasan data responden dan skor survei
- Kelola daftar pertanyaan (tambah, ubah, aktif/nonaktif)
- Lihat seluruh feedback kritik & saran dari masyarakat

## Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | [React](https://react.dev) 19, [Vite](https://vite.dev) 7 |
| Styling | [Tailwind CSS](https://tailwindcss.com) 4, [Framer Motion](https://www.framer.com/motion/), [lucide-react](https://lucide.dev) |
| Routing | [React Router](https://reactrouter.com) 7 |
| Backend/Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Deployment | [Vercel](https://vercel.com) |

## Struktur Proyek

```
src/
├── App.jsx                     # Routing utama (publik + admin)
├── SurveiApp.jsx               # Halaman survei publik
├── components/
│   └── layout/
│       └── AdminLayout.jsx     # Layout dashboard admin
├── lib/
│   ├── supabase.js             # Koneksi Supabase
│   └── mockData.js             # Data contoh (development)
└── pages/
    └── admin/
        ├── LoginPage.jsx       # Login admin
        ├── DashboardPage.jsx   # Ringkasan data survei
        ├── QuestionPage.jsx    # Kelola pertanyaan
        └── FeedbackPage.jsx    # Lihat kritik & saran
```

## Persyaratan

- Node.js 20+ dan npm
- Proyek Supabase dengan tabel: `questions`, `respondents`, `survey_answers`

## Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/mifdlaldev/survei-kepuasan-talun.git
cd survei-kepuasan-talun

# 2. Install dependensi
npm install

# 3. Konfigurasi environment
cp .env.example .env
# Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dengan kredensial proyek Supabase Anda

# 4. Jalankan server pengembangan
npm run dev
```

## Skrip Tersedia

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Menjalankan server pengembangan (http://localhost:5173) |
| `npm run build` | Membangun aplikasi untuk produksi |
| `npm run preview` | Pratinjau hasil build secara lokal |
| `npm run lint` | Menjalankan pemeriksaan kode ESLint |

## Deployment

Aplikasi di-deploy ke **Vercel**. Konfigurasi SPA rewrite terdapat pada `vercel.json` untuk memastikan routing React Router bekerja tanpa 404.

```
https://website-kepuasan-masyarakat.vercel.app
```

## Keamanan

- Kredensial Supabase disimpan melalui variabel lingkungan (`.env`), tidak pernah di-commit.
- Kebijakan keamanan dan cara melaporkan kerentanan: lihat [SECURITY.md](SECURITY.md).
- **Jangan pernah** mempublikasikan kunci `service_role` Supabase atau data responden.

## Kontribusi

Kami menyambut kontribusi dari siapa pun. Baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan memulai, dan [Kode Etik](CODE_OF_CONDUCT.md) sebagai pedoman perilaku.

## Lisensi

Kode sumber dilisensikan di bawah **Apache License 2.0** — lihat [LICENSE](LICENSE).

Logo dan aset visual lainnya merupakan milik instansi masing-masing dan tidak tercakup dalam lisensi ini.

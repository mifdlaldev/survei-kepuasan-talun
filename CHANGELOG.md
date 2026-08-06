# Changelog

Semua perubahan penting pada proyek ini dicatat di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan proyek ini mematuhi [Semantic Versioning](https://semver.org/lang/id/).

## [1.1.0] - 2026-08-06

### Added
- **43 unit & integrasi test** (36 worker API + 7 frontend) via Vitest + `@cloudflare/vitest-pool-workers`
- **Proteksi branch `main`**: wajib PR + review + CI hijau, force push ditolak
- `docs/API.md` — dokumentasi lengkap endpoint API
- `.nvmrc`, `engines`, `.gitattributes`, `delete_branch_on_merge`

### Changed
- **Dependensi di-update** untuk menutup advisories keamanan: `react-router-dom` 7.13 → 7.18.2, `vite` 7 → **8.2.0** (rolldown, build jauh lebih cepat), `postcss` 8.5.25, `tailwindcss` 4.3.3, `@vitejs/plugin-react` 6
- Font heading dari Fraunces → **Archivo** (lebih tegas & formal)
- Sidebar admin: full-height, footer profil dihapus (tidak duplikat header)
- Alamat instansi diperbaiki: Kec. Cisarua → **Kec. Sumedang Utara**
- Metadata repositori disesuaikan: **public read-only**, aplikasi berjalan terbatas untuk warga Kelurahan Talun

### Removed
- **Deployment global**: worker `survei-kepuasan-talun` dihapus dari Cloudflare (aplikasi tidak lagi live publik)
- Jalur kontribusi orang lain: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, template Issue/PR, `dependabot.yml`, workflow auto-deploy
- Issues & Wiki repositori (tidak ada interaksi eksternal)
- Homepage repositori (URL worker lama)

## [1.0.0] - 2026-08-06

### Added
- Migrasi total arsitektur: React 19 + TypeScript + Vite 7
- Backend API baru dengan **Hono di Cloudflare Workers**
- Database baru dengan **Cloudflare D1** (SQLite) — menggantikan Supabase
- Autentikasi admin aman: hash password **PBKDF2-SHA256** + sesi cookie `HttpOnly`
- **Rate limiting** per-IP pada endpoint publik dan login
- **Validasi input server-side** dengan Zod
- Redesign total antarmuka: palet hijau pinus & pasir, tipografi Fraunces + Plus Jakarta Sans
- Dashboard admin: statistik responden, skor rata-rata per pertanyaan, responden terbaru
- Screenshot dokumentasi di `docs/screenshots/`
- CI pipeline (lint, type-check, build) via GitHub Actions
- Template issue & pull request
- `AGENTS.md` — pedoman kerja AI coding assistant (anti-halusinasi)

### Changed
- Deployment dari Vercel → **Cloudflare Workers** (`survei-kepuasan-talun.mifdlaltsaqibalf25.workers.dev`)
- Konversi seluruh kode `.jsx` → `.tsx` (TypeScript)

### Removed
- Supabase (koneksi `@supabase/supabase-js` dan `src/lib/supabase.js`)
- Vercel (`vercel.json`)
- Autentikasi berbasis `localStorage` yang tidak aman
